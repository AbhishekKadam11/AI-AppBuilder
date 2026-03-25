import { Component, computed, inject, input, signal } from '@angular/core';
import { NbCardModule } from "@nebular/theme";
import {
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram'

export type NodeData = {
  name: string;
  status: string;
  description: string;
  tooltip: string;
};

@Component({
  selector: 'app-simple-node',
  imports: [NbCardModule],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './simple-node.component.html',
  styleUrl: './simple-node.component.scss',
})
export class SimpleNodeComponent implements NgDiagramNodeTemplate<NodeData>{
 private readonly modelService = inject(NgDiagramModelService);
  readonly panelOpenState = signal(false);
  node = input.required<Node<NodeData>>();
  nodeStatus = computed(() =>
    this.node().data.status === 'Active'
      ? 'green'
      : this.node().data.status === 'Error'
        ? 'red'
        : 'orange'
  );

  onColorChange({ value }: any) {
    this.modelService.updateNodeData(this.node().id, {
      ...this.node().data,
      status: value,
    });
  }
}
