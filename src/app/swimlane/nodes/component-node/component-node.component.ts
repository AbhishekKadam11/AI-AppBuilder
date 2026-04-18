import { Component, inject, input } from '@angular/core';
import { NbCardModule, NbIconModule, NbListModule, NbTagModule } from '@nebular/theme';
import {
  NgDiagramBaseNodeTemplateComponent,
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramPortComponent,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram'
import { NodeData } from '../../../core/common';
import { CommonModule } from '@angular/common';
import { WebContainerService } from '../../../services/web-container.service';
import { SwimlaneService } from '../../../services/swimlane.service';

@Component({
  selector: 'app-component-node',
  imports: [NbCardModule, NgDiagramBaseNodeTemplateComponent, NgDiagramPortComponent, NbListModule, NbTagModule, CommonModule, NbIconModule],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './component-node.component.html',
  styleUrl: './component-node.component.scss',
})
export class ComponentNodeComponent {
  node = input.required<Node<NodeData>>();
  routes = [];
  private readonly webContainerService = inject(WebContainerService);
  private readonly modelService = inject(NgDiagramModelService);
  private readonly swimlaneService = inject(SwimlaneService);

  constructor() { }

  onRowClick(filepath: string) {
    if (filepath !== '') {
      this.webContainerService.webContainerFileContent(filepath.replace(/\\/g, '/').split('/').slice(2).join('/')).then((fileData: string) => {
        this.modelService.updateNodeData('id-codeEditorTree', { dataSource: [{ fileContent: fileData, filePath: filepath.replace(/\\/g, '/') }], label: filepath.split("/").pop() });
        // const relatedEdges = this.swimlaneService.getEdgesByNode(this.node().id);
        // console.log('Related edges for node', this.node().id, relatedEdges);
      }).catch((error) => {
        console.error('Error fetching file content for', filepath, error);
      });
    }
  }
}
