import { Component } from '@angular/core';
import { NbCardModule, NbIconModule, NbLayoutModule } from "@nebular/theme";
import { initializeModel, NgDiagramBackgroundComponent, NgDiagramComponent, NgDiagramConfig, NgDiagramNodeTemplateMap, provideNgDiagram, NgDiagramNodeResizeAdornmentComponent } from 'ng-diagram';
import { SimpleNodeComponent } from '../nodes/simple-node/simple-node.component';
import { FileTreeNodeComponent } from '../nodes/file-tree-node/file-tree-node.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { FileNodeComponent } from '../nodes/file-node/file-node.component';

enum NodeTemplateType {
  CustomNodeType = 'customNodeType',
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
      max: 3,
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
  nodeTemplateMap = new Map([
    ['fileTree', FileTreeNodeComponent]
  ]);

  // 2. Initialize model with the 'fileTree' type
  model = initializeModel({
    nodes: [
      {
        id: '1',
        type: 'fileTree', // Matches the map key
        position: { x: 100, y: 100 },
        data: { appName: 'loginApp5', label: 'package.json', type: 'JSON Configuration', attribute: {icon: 'angular_gradient'} }
      },
      // {
      //   id: '2',
      //   type: 'fileTree',
      //   position: { x: 400, y: 100 },
      //   data: { label: 'src/app', type: 'Directory', icon: 'folder-outline' }
      // }
    ]
  });

}
