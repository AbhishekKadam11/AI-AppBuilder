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

@Component({
  selector: 'app-swimlane-dashboard',
  providers: [provideNgDiagram()],
  imports: [NbCardModule, NbLayoutModule, NgDiagramComponent, NgDiagramBackgroundComponent, NgDiagramNodeResizeAdornmentComponent, NbIconModule],
  templateUrl: './swimlane-dashboard.component.html',
  styleUrl: './swimlane-dashboard.component.scss',
})

export class SwimlaneDashboardComponent {
  //  nodeTemplateMap = new NgDiagramNodeTemplateMap([
  //     [NodeTemplateType.CustomNodeType, FileTreeNodeComponent],
  //   ]);

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

  //   model = initializeModel({
  //     nodes: [
  //       {
  //         id: '1',
  //         position: { x: 50, y: 100 },
  //         type: 'customNodeType',
  //         data: {
  //           appName: 'loginApp5',
  //           description:
  //             'This is Node 1. This node is a custom node with a custom template.',
  //           tooltip: 'Node 1 is a custom node',
  //           status: 'Active',
  //         },
  //       },

  //     ],
  //   });

// 1. Register the component map
nodeTemplateMap = new Map<string, typeof FileTreeNodeComponent | typeof RoutingNodeComponent>([
  ['fileTree', FileTreeNodeComponent],
  ['routeTree', RoutingNodeComponent],
]);

  // 2. Initialize model with the 'fileTree' type
  // model = initializeModel({
  //   nodes: [
  //     {
  //       id: '1',
  //       type: 'fileTree', // Matches the map key
  //       position: { x: 400, y: 100 },
  //       size: { width: 360, height: 320 },
  //       autoSize: false,
  //       resizable: true,
  //       data: { appName: 'loginApp5', label: '', type: 'rootNode', dataSource:[], attribute: { icon: 'angular-logo', url: '' } }
  //     },
  //     // {
  //     //   id: '2',
  //     //   type: 'fileTree',
  //     //   position: { x: 400, y: 100 },
  //     //   data: { label: 'src/app', type: 'Directory', icon: 'folder-outline' }
  //     // }
  //   ]
  // });

  model: any = initializeModel();
  private readonly injector = inject(Injector);
  private readonly directoryManager: string = 'DirectoryManager';
  messages: any = { "action": "getContainerFiles", "path": "" }
  private directorySubscription: Subscription | undefined
  dataSource: any
  // private webContainerService = new WebContainerService();

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
        this.model = initializeModel({
          nodes: [
            {
              id: '1',
              type: 'fileTree', // Matches the map key
              position: { x: 100, y: 100 },
              size: { width: 360, height: 320 },
              autoSize: false,
              resizable: true,
              data: { appName: 'loginApp5', label: '', type: 'rootNode', dataSource: formatedTree, attribute: { icon: 'angular-logo', url: '' } }
            },
             {
              id: '2',
              type: 'routeTree', // Matches the map key
              position: { x: 500, y: 100 },
              size: { width: 360, height: 200 },
              autoSize: false,
              resizable: true,
              data: { appName: 'loginApp5', label: '', type: 'rootNode', dataSource: formatedTree, attribute: { icon: 'angular-logo', url: '' } }
            },
          ]
        }, this.injector);
        // this.dataSource = this.dataSourceBuilder.create(formatedTree);
      });
    }
  }

}
