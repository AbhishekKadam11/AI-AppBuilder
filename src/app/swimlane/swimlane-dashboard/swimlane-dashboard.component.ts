import { Component, inject, Injector } from '@angular/core';
import { NbCardModule, NbIconModule, NbLayoutModule } from "@nebular/theme";
import { initializeModel, NgDiagramBackgroundComponent, NgDiagramComponent, NgDiagramConfig, NgDiagramNodeTemplateMap, provideNgDiagram, NgDiagramNodeResizeAdornmentComponent } from 'ng-diagram';
import { SimpleNodeComponent } from '../nodes/simple-node/simple-node.component';
import { FileTreeNodeComponent } from '../nodes/file-tree-node/file-tree-node.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { FileNodeComponent } from '../nodes/file-node/file-node.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { SocketService } from '../../services/socket.service';
import { WebContainerService } from '../../services/web-container.service';
import { RoutingNodeComponent } from '../nodes/routing-node/routing-node.component';
import { ComponentNodeComponent } from '../nodes/component-node/component-node.component';

enum NodeTemplateType {
  CustomNodeType = 'customNodeType',
}

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  name: string;
  kind: string;
  items?: number;
}

enum NodeTypes {
  FileTree = 'fileTree',
  RouteTree = 'routeTree',
  ComponentTree = 'componentTree',
}

enum NodeLabels {
  FileTree = 'File Tree',
  RouteTree = 'Routing',
  ComponentTree = 'Component Files',
}

@Component({
  selector: 'app-swimlane-dashboard',
  providers: [provideNgDiagram()],
  imports: [NbCardModule, NbLayoutModule, NgDiagramComponent, NgDiagramBackgroundComponent, NgDiagramNodeResizeAdornmentComponent, NbIconModule],
  templateUrl: './swimlane-dashboard.component.html',
  styleUrl: './swimlane-dashboard.component.scss',
})

export class SwimlaneDashboardComponent {

  config = {
    zoom: {
      max: 1,
      zoomToFit: {
        onInit: true,
        padding: 100,
      },
    },
  } satisfies NgDiagramConfig;

  //   backgroundConfig = {
  //     type: 'grid',
  //     config: {
  //      // cellSize: 50,
  //     },
  //     // class: 'grid-background',
  //   };

  // 1. Register the component map
  nodeTemplateMap = new Map<string, typeof FileTreeNodeComponent | typeof RoutingNodeComponent | typeof ComponentNodeComponent>([
    ['fileTree', FileTreeNodeComponent],
    ['routeTree', RoutingNodeComponent],
    ['componentTree', ComponentNodeComponent],
  ]);

  model: any = initializeModel();
  nodes: any[] = [];
  private readonly injector = inject(Injector);
  private readonly directoryManager: string = 'DirectoryManager';
  messages: any = { "action": "getContainerFiles", "path": "" }
  private directorySubscription: Subscription | undefined
  dataSource: any
  appDiagramSchema: any = {};

  constructor(private socketService: SocketService,
    private webContainerService: WebContainerService
  ) { }

  ngAfterViewInit() {
    this.messages = { "action": "getContainerFiles", "path": 'loginApp5' };
    this.socketService.sendMessage(this.directoryManager, this.messages);
    const serverReply$ = this.socketService?.on(this.directoryManager);
    if (serverReply$) {
      this.directorySubscription = serverReply$.subscribe((response: any) => {
        console.log('Received directorySubscription from server:', response);
        const formatedTree: TreeNode<FSEntry>[] = this.webContainerService.transformToNebularTree(response.data);
        console.log('formatedTree', formatedTree);
        this.destructringAssignment(formatedTree);
        this.nodeGeneration(); // Generate nodes after processing the file tree and routes
      });
    }
  }

  destructringAssignment(formatedTree: TreeNode<FSEntry>[]) {
    this.appDiagramSchema = Object.assign(this.appDiagramSchema, { [NodeTypes.FileTree]: { dataSource: formatedTree } }); // Store the entire tree if needed

    const routes = this.extractRoutesFromFileTree(formatedTree);
    this.appDiagramSchema = Object.assign(this.appDiagramSchema, { [NodeTypes.RouteTree]: { dataSource: routes } }); // Store the routes in the schema for later use

    const componentNodes = this.extractComponentNodesFromFileTree(formatedTree);
    this.appDiagramSchema = Object.assign(this.appDiagramSchema, { [NodeTypes.ComponentTree]: { dataSource: componentNodes } }); // Store the component nodes in the schema for later use

    console.log('App Diagram Schema after destructuring assignment:', this.appDiagramSchema);
  }

  extractRoutesFromFileTree(tree: TreeNode<FSEntry>[], parentPath: string = ''): any[] {
    let routes: any[] = [];
    // extract routes from the file tree and make json structure like this { path: 'routePath', component: 'ComponentName' }
    for (const node of tree) {
      const currentPath = `${parentPath}/${node.data.name}`;
      if (node.data.kind === 'directory') {
        //@ts-ignore
        routes = [...routes, ...this.extractRoutesFromFileTree(node.children, currentPath)];
      } else if (node.data.kind === 'file' && node.data.name.endsWith('.component.ts')) {
        const componentName = node.data.name.replace('.component.ts', '');
        //@ts-ignore
        routes.push({ path: currentPath, component: componentName });
      }
    }
    return routes;
  }


  extractComponentNodesFromFileTree(tree: TreeNode<FSEntry>[], parentPath: string = ''): any[] {
    // extract component files from the file tree and make json structure like this { name: 'ComponentName', files: ['fileName', 'fileName2'] }
    let components: any[] = [];
    for (const node of tree) {
      const currentPath = `${parentPath}/${node.data.name}`;
      if (node.data.kind === 'directory') {
        //@ts-ignore
        components = [...components, ...this.extractComponentNodesFromFileTree(node.children, currentPath)];
      } else if (node.data.kind === 'file' && (node.data.name.endsWith('.component.ts') || node.data.name.endsWith('.component.html') || node.data.name.endsWith('.component.scss'))) {
        //append of files path to the component if the component already exists in the components array otherwise create a new component object and push it to the components array
        const componentName = node.data.name.replace('.component.ts', '').replace('.component.html', '').replace('.component.scss', '');
        const existingComponent = components.find(c => c.name === componentName);
        if (existingComponent) {
          existingComponent.files.push(currentPath);
        } else {
          components.push({ name: componentName, files: [currentPath] });
        }
      }
    }
    return components;
  }

  nodeGeneration() {
    //iterate over enum NodeTypes and generate nodes for each type
    for (const nodeType in NodeTypes) {
      console.log('Generating nodes for type:', NodeTypes[nodeType as keyof typeof NodeTypes]);
      const dataSource = this.appDiagramSchema[NodeTypes[nodeType as keyof typeof NodeTypes]]?.dataSource || [];
      //break component tre to sperate nodes for each component
      if (NodeTypes[nodeType as keyof typeof NodeTypes] === NodeTypes.ComponentTree) {
        const componentDataSource = this.appDiagramSchema[NodeTypes.ComponentTree]?.dataSource || [];
        for (const component of componentDataSource) {
          this.nodes.push({
            id: `id-${nodeType}-${component.name}`,
            type: NodeTypes[nodeType as keyof typeof NodeTypes],
            position: { x: 100 + Object.keys(NodeTypes).indexOf(nodeType) * 400, y: 100 + componentDataSource.indexOf(component) * 370 },
            size: { width: 360, height: 320 },
            autoSize: false,
            resizable: true,
            data: { appName: 'loginApp5', label: NodeLabels[nodeType as keyof typeof NodeLabels], type: 'rootNode', dataSource: [component], attribute: { icon: 'angular-logo', url: '' } }
          });
        }
        continue;
      }
      this.nodes.push({
        id: `id-${nodeType}`,
        type: NodeTypes[nodeType as keyof typeof NodeTypes],
        position: { x: 100 + Object.keys(NodeTypes).indexOf(nodeType) * 400, y: 100 },
        size: { width: 360, height: 320 },
        autoSize: false,
        resizable: true,
        data: { appName: 'loginApp5', label: NodeLabels[nodeType as keyof typeof NodeLabels], type: 'rootNode', dataSource: dataSource, attribute: { icon: 'angular-logo', url: '' } }
      });
    }

    console.log('Generated nodes:', this.nodes);
    this.model = initializeModel({
      nodes: this.nodes
    }, this.injector);
  }
}
