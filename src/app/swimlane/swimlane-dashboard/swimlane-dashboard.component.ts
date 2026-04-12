import { Component, inject, Injector, signal, DestroyRef, OnInit } from '@angular/core';
import { NbCardModule, NbIconModule, NbLayoutModule, NbSidebarService } from "@nebular/theme";
import {
  initializeModel,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  NgDiagramConfig,
  NgDiagramNodeResizeAdornmentComponent,
  provideNgDiagram
} from 'ng-diagram';
import { FileTreeNodeComponent } from '../nodes/file-tree-node/file-tree-node.component';
import { SocketService } from '../../services/socket.service';
import { WebContainerService } from '../../services/web-container.service';
import { RoutingNodeComponent } from '../nodes/routing-node/routing-node.component';
import { ComponentNodeComponent } from '../nodes/component-node/component-node.component';
import { BrowserNodeComponent } from '../nodes/browser-node/browser-node.component';
import { AppWorkflowService } from '../../services/app-workflow.service';
import { filter, switchMap, tap, take, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConsoleNodeComponent } from '../nodes/console-node/console-node.component';

// --- Enums & Constants ---

enum NodeTypes {
  FileTree = 'fileTree',
  RouteTree = 'routeTree',
  ComponentTree = 'componentTree',
  BrowserTree = 'browserTree',
  ConsoleTree = 'consoleTree'
}

const NodeLabels: Record<NodeTypes, string> = {
  [NodeTypes.FileTree]: 'File Tree',
  [NodeTypes.RouteTree]: 'Routing',
  [NodeTypes.ComponentTree]: 'Component Files',
  [NodeTypes.BrowserTree]: 'Browser window',
  [NodeTypes.ConsoleTree]: 'Console'
};

// --- Interfaces ---

interface FSEntry {
  name: string;
  kind: string;
  items?: number;
}

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  autoSize: boolean;
  resizable: boolean;
  data: {
    appName: string;
    label: string;
    status: boolean;
    type: string;
    dataSource: any[];
    attribute: { icon: string; url: string };
  };
}

interface DiagramEdge {
  id: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
  type: string;
}

interface RouteData {
  path: string;
  component: string;
}

interface ComponentData {
  name: string;
  files: string[];
}

@Component({
  selector: 'app-swimlane-dashboard',
  providers: [provideNgDiagram()],
  imports: [
    NbCardModule,
    NbLayoutModule,
    NgDiagramComponent,
    NgDiagramBackgroundComponent,
    NgDiagramNodeResizeAdornmentComponent,
    NbIconModule
  ],
  templateUrl: './swimlane-dashboard.component.html',
  styleUrl: './swimlane-dashboard.component.scss',
})
export class SwimlaneDashboardComponent implements OnInit {

  // --- Configuration ---
  config: NgDiagramConfig = {
    zoom: {
      max: 1,
      zoomToFit: {
        onInit: true,
        padding: 100,
      },
    },
  };

  readonly nodeTemplateMap = new Map<string, any>([
    [NodeTypes.FileTree, FileTreeNodeComponent],
    [NodeTypes.RouteTree, RoutingNodeComponent],
    [NodeTypes.ComponentTree, ComponentNodeComponent],
    [NodeTypes.BrowserTree, BrowserNodeComponent],
    [NodeTypes.ConsoleTree, ConsoleNodeComponent],
  ]);

  // Define the flow of connections
  readonly nodeAssociationMap = new Map<NodeTypes, NodeTypes[]>([
    [NodeTypes.FileTree, [NodeTypes.RouteTree, NodeTypes.ConsoleTree]],
    [NodeTypes.RouteTree, [NodeTypes.ComponentTree]],
    [NodeTypes.ComponentTree, [NodeTypes.BrowserTree]],
  ]);

  readonly nodeSizeMap = new Map<NodeTypes, { width: number; height: number }>([
    [NodeTypes.FileTree, { width: 360, height: 320 }],
    [NodeTypes.RouteTree, { width: 360, height: 320 }],
    [NodeTypes.ComponentTree, { width: 360, height: 320 }],
    [NodeTypes.BrowserTree, { width: 560, height: 570 }],
    [NodeTypes.ConsoleTree, { width: 460, height: 360 }],
  ]);

  // --- State ---
  model = signal(initializeModel({ nodes: [], edges: [] }));
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private projectName!: string;

  private isWebContainerActive = false;
  private collectionLogs: string[] = [];
  private samelineLogs: string = ''; // Note: currently unused in UI, but kept for logic

  // Grouped data for diagram generation
  private appDiagramSchema: Partial<Record<NodeTypes, { dataSource: any[] }>> = {};


  constructor(
    private socketService: SocketService,
    private webContainerService: WebContainerService,
    private appWorkflowService: AppWorkflowService,
    private sidebarService: NbSidebarService,
  ) { }

  ngOnInit(): void {
    // this.sidebarService.collapse('dynamicSidebar');
    this.setupDataStream();
    // this.sidebarService.collapse('dynamicSidebar');
    // this.sidebarService.toggle(false, 'dynamicSidebar');
  }

  /**
   * Sets up the reactive pipeline: AppDetails -> Socket Request -> Data Processing -> Diagram Generation
   */
  private setupDataStream(): void {
    this.appWorkflowService.appObject$.pipe(
      takeUntilDestroyed(this.destroyRef),

      // 1. Debounce: Prevent rapid-fire requests if appObject emits quickly
      debounceTime(300),

      // 2. Filter: Ensure we have valid project details
      //@ts-ignore
      filter((appDetails): appDetails is { data: { extraConfig: { projectName: string } } } => !!appDetails?.data?.extraConfig?.projectName),

      // 3. Side Effect: Send the socket message
      tap((appDetails) => {
        //@ts-ignore
        this.projectName = appDetails.data.extraConfig.projectName;
        this.socketService.sendMessage('DirectoryManager', {
          action: "getContainerFiles",
          path: this.projectName
        });
      }),

      // 4. SwitchMap: Listen for the response
      // This prevents the 'multiple calls' crash if the socket emits multiple status updates.
      //@ts-ignore
      switchMap(() => this.socketService.on('DirectoryManager').pipe(
        take(1),
        filter(res => !!res?.data) // Ensure the response actually contains data
      ))
    ).subscribe({
      next: (response) => this.handleSocketResponse(response),
      error: (err) => console.error('Error in data stream:', err)
    });
  }

  private handleSocketResponse(response: any): void {
    if (!this.projectName || !response.data?.[this.projectName]?.directory) {
      console.warn('Directory not found in response for:', this.projectName);
      return;
    }

    const directory = response.data[this.projectName].directory;
    const formatedTree: TreeNode<FSEntry>[] = this.webContainerService.transformToNebularTree(response.data);
    // console.log('Received directory structure:', formatedTree);
    // Handle WebContainer boot/mount
    if (!this.isWebContainerActive) {
      this.webContainerService.bootAndRun(directory);
      this.isWebContainerActive = true;

      // Subscribe to logs only once
      this.webContainerService.output$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(log => {
        this.appendLog(log);
      });
    } else {
      this.webContainerService.mountFiles(directory);
    }

    // Process Data and Generate Diagram
    this.processSchemaData(formatedTree);
    this.generateDiagram();
  }

  /**
   * Transforms raw file tree into structured data for each node type
   */
  private processSchemaData(formatedTree: TreeNode<FSEntry>[]): void {
    // 1. Store File Tree
    this.appDiagramSchema[NodeTypes.FileTree] = { dataSource: formatedTree };

    // 2. Extract Routes
    const routes = this.extractRoutesFromFileTree(formatedTree);
    this.appDiagramSchema[NodeTypes.RouteTree] = { dataSource: routes };
    this.appDiagramSchema[NodeTypes.BrowserTree] = { dataSource: routes }; // Browser tree uses routes as source

    // 3. Extract Components
    const componentNodes = this.extractComponentNodesFromFileTree(formatedTree);
    this.appDiagramSchema[NodeTypes.ComponentTree] = { dataSource: componentNodes };

    // 4. Console Node doesn't require dynamic data for this example, but could be extended similarly
    this.appDiagramSchema[NodeTypes.ConsoleTree] = { dataSource: [] };
  }

  /**
   * Optimized Route Extraction (Pass array by reference)
   */
  private extractRoutesFromFileTree(tree: TreeNode<FSEntry>[], parentPath: string = '', output: RouteData[] = []): RouteData[] {
    for (const node of tree) {
      const currentPath = `${parentPath}/${node.data.name}`;
      if (node.data.kind === 'directory' && node.children) {
        this.extractRoutesFromFileTree(node.children, currentPath, output);
      } else if (node.data.kind === 'file' && node.data.name.endsWith('.component.ts')) {
        const componentName = node.data.name.replace('.component.ts', '');
        output.push({ path: currentPath, component: componentName });
      }
    }
    return output;
  }

  /**
   * Optimized Component Extraction (Uses Map for O(N) grouping)
   */
  private extractComponentNodesFromFileTree(tree: TreeNode<FSEntry>[], parentPath: string = ''): ComponentData[] {
    const componentMap = new Map<string, string[]>();

    const traverse = (nodes: TreeNode<FSEntry>[], currentPath: string) => {
      for (const node of nodes) {
        const nodePath = `${currentPath}/${node.data.name}`;
        if (node.data.kind === 'directory' && node.children) {
          traverse(node.children, nodePath);
        } else if (node.data.kind === 'file') {
          const match = node.data.name.match(/(.+)\.(component\.(ts|html|scss))/);
          if (match) {
            const componentName = match[1];
            const files = componentMap.get(componentName) || [];
            files.push(nodePath);
            componentMap.set(componentName, files);
          }
        }
      }
    };

    traverse(tree, parentPath);

    return Array.from(componentMap.entries()).map(([name, files]) => ({ name, files }));
  }

  /**
   * Generates Nodes and Edges and updates the Model
   */
  private generateDiagram(): void {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    // Helper to track nodes by type for edge generation
    const nodesByType = new Map<NodeTypes, DiagramNode[]>();

    // --- Node Generation ---

    // 1. File Tree Node
    this.createNode(
      nodes,
      NodeTypes.FileTree,
      this.appDiagramSchema[NodeTypes.FileTree]?.dataSource || [],
      0, // Column Index
      0  // Row Index
    );

    // 2. Route Tree Node
    this.createNode(
      nodes,
      NodeTypes.RouteTree,
      this.appDiagramSchema[NodeTypes.RouteTree]?.dataSource || [],
      1, // Column Index
      0  // Row Index
    );

    // 3. Component Nodes (Multiple)
    const components = this.appDiagramSchema[NodeTypes.ComponentTree]?.dataSource || [];
    components.forEach((comp, index) => {
      this.createNode(
        nodes,
        NodeTypes.ComponentTree,
        [comp], // Single component data
        2, // Column Index
        index,
        `-${comp.name}` // ID Suffix
      );
    });

    // 4. Browser Nodes (Multiple)
    const routes = this.appDiagramSchema[NodeTypes.BrowserTree]?.dataSource || [];
    routes.forEach((route, index) => {
      this.createNode(
        nodes,
        NodeTypes.BrowserTree,
        [route], // Single route data
        3, // Column Index
        index,
        `-${route.path}` // ID Suffix
      );
    });

    // 5. Console Node (Single)
    this.createNode(
      nodes,
      NodeTypes.ConsoleTree,
      this.appDiagramSchema[NodeTypes.ConsoleTree]?.dataSource || [], // No dynamic data for console
      0, // Column Index
      2  // Row Index
    );

    // Populate nodesByType map for edge generation
    nodes.forEach(node => {
      const type = node.type as NodeTypes;
      if (!nodesByType.has(type)) nodesByType.set(type, []);
      nodesByType.get(type)!.push(node);
    });

    // --- Edge Generation ---

    nodesByType.forEach((sourceNodes, sourceType) => {
      const targetTypes = this.nodeAssociationMap.get(sourceType) || [];

      targetTypes.forEach(targetType => {
        const targetNodes = nodesByType.get(targetType) || [];

        // Special Logic: Component -> Browser (1-to-1 mapping based on data)
        if (sourceType === NodeTypes.ComponentTree && targetType === NodeTypes.BrowserTree) {
          sourceNodes.forEach(sourceNode => {
            const componentData = sourceNode.data.dataSource[0] as ComponentData;
            // Find matching browser node
            const matchingTarget = targetNodes.find(tn => {
              const routeData = tn.data.dataSource[0] as RouteData;
              return routeData.component === componentData.name;
            });

            if (matchingTarget) {
              edges.push(this.createEdge(sourceNode.id, matchingTarget.id));
            }
          });
        } else if (targetType === NodeTypes.ConsoleTree) {
          sourceNodes.forEach(sourceNode => {
            targetNodes.forEach(targetNode => {
              console.log("sourceNode.id: ", sourceNode.id, "targetNode.id: ", targetNode.id)
              edges.push(this.createEdge(sourceNode.id, targetNode.id, 'port-bottom', 'port-top'));
            });
          });
        }
        // Default Logic: All-to-All (Mesh) connection between columns
        else {
          sourceNodes.forEach(sourceNode => {
            targetNodes.forEach(targetNode => {
              edges.push(this.createEdge(sourceNode.id, targetNode.id));
            });
          });
        }
      });
    });

    // Update Model
    //@ts-ignore
    this.model.set(initializeModel({ nodes, edges }, this.injector));
  }

  /**
   * Helper to create a standardized node object
   */
  private createNode(
    nodesList: DiagramNode[],
    type: NodeTypes,
    dataSource: any[],
    colIndex: number,
    rowIndex: number,
    idSuffix: string = ''
  ): void {
    const id = `id-${type}${idSuffix}`;

    // Calculate Position
    // X: Base offset + (Column Index * Column Width)
    // Y: Base offset + (Row Index * Row Spacing)
    const x = 100 + (colIndex * 400);
    const y = 100 + (rowIndex * (type === NodeTypes.BrowserTree ? 570 : 370));

    // Specific Size adjustments
    const width = this.nodeSizeMap.get(type)?.width || 360;
    const height = this.nodeSizeMap.get(type)?.height || 320;
    const status = type === NodeTypes.ConsoleTree ? false : true; // Example status logic, can be customized

    nodesList.push({
      id,
      type,
      position: { x, y },
      size: { width, height },
      autoSize: false,
      resizable: true,
      data: {
        appName: this.projectName, // Consider making dynamic
        label: NodeLabels[type],
        type: 'rootNode',
        status,
        dataSource,
        attribute: { icon: 'angular-logo', url: '' }
      }
    });
  }

  private createEdge(sourceId: string, targetId: string, sourcePort: string = 'port-right', targetPort: string = 'port-left'): DiagramEdge {
    return {
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      sourcePort: sourcePort,
      target: targetId,
      targetPort: targetPort,
      type: 'smoothstep',
    };
  }

  private appendLog(log: string): void {
    const samelineWords = ['/', '-', '\\', '|', '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const timestamp = `[${new Date().toISOString()}]`;

    if (samelineWords.includes(log.trim().charAt(0))) {
      this.samelineLogs = log ? `[client] ${timestamp}: ${log.trim()}` : '';
    } else {
      if (log && log.trim() !== '') {
        this.collectionLogs.push(`[client] ${timestamp}: ${log}`);
      }
    }
  }
}
