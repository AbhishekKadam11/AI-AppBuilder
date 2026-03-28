import { Component, input } from '@angular/core';
import { NgDiagramBaseNodeTemplateComponent, NgDiagramNodeTemplate, type Node } from 'ng-diagram';
import { NbIconModule, NbButtonModule, NbCardModule, NbTooltipModule } from '@nebular/theme';

type IData = { type: string; label: string; icon: string };

export type NodeData = {
  name: string;
  status: string;
  description: string;
  tooltip: string;
  data: IData;
};

@Component({
  selector: 'app-file-node',
  imports: [NgDiagramBaseNodeTemplateComponent, NbIconModule, NbButtonModule, NbCardModule, NbTooltipModule],
  templateUrl: './file-node.component.html',
  styleUrl: './file-node.component.scss',
})
export class FileNodeComponent {
  node = input.required<Node<NodeData>>();

  onDelete(event: MouseEvent) {
    event.stopPropagation(); // Prevent node dragging when clicking button
    //@ts-ignore
    console.log('Deleting node:', this.node()?.id);
  }
}
