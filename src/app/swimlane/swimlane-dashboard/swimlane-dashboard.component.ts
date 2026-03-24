import { Component } from '@angular/core';
import { NbCardModule, NbLayoutModule } from "@nebular/theme";
import { initializeModel, NgDiagramBackgroundComponent, NgDiagramComponent, NgDiagramConfig, NgDiagramNodeTemplateMap, provideNgDiagram, NgDiagramNodeResizeAdornmentComponent } from 'ng-diagram';
import { SimpleNodeComponent } from '../nodes/simple-node/simple-node.component';
import { FileTreeNodeComponent } from '../nodes/file-tree-node/file-tree-node.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

enum NodeTemplateType {
  CustomNodeType = 'customNodeType',
}

@Component({
  selector: 'app-swimlane-dashboard',
  providers: [provideNgDiagram()],
  imports: [NbCardModule, NbLayoutModule, NgDiagramComponent, NgDiagramBackgroundComponent, NgDiagramNodeResizeAdornmentComponent],
  templateUrl: './swimlane-dashboard.component.html',
  styleUrl: './swimlane-dashboard.component.scss',
})

export class SwimlaneDashboardComponent {
 nodeTemplateMap = new NgDiagramNodeTemplateMap([
    [NodeTemplateType.CustomNodeType, FileTreeNodeComponent],
  ]);

  config = {
    zoom: {
      max: 3,
      zoomToFit: {
        onInit: true,
        padding: 100,
      },
    },
  } satisfies NgDiagramConfig;

  backgroundConfig = {
    type: 'grid',
    config: {
     // cellSize: 50,
    },
    // class: 'grid-background',
  };

  model = initializeModel({
    nodes: [
      {
        id: '1',
        position: { x: 50, y: 100 },
        type: 'customNodeType',
        data: {
          appName: 'loginApp5',
          description:
            'This is Node 1. This node is a custom node with a custom template.',
          tooltip: 'Node 1 is a custom node',
          status: 'Active',
        },
      },

    ],
  });
}
