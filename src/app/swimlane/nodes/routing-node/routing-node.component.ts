import { Component, input } from '@angular/core';
import { NbCardModule, NbListModule } from '@nebular/theme';
import {
  NgDiagramBaseNodeTemplateComponent,
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram'
import { NodeData } from '../../../core/common';

@Component({
  selector: 'app-routing-node',
  imports: [NbCardModule, NgDiagramBaseNodeTemplateComponent, NbListModule],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './routing-node.component.html',
  styleUrl: './routing-node.component.scss',
})
export class RoutingNodeComponent {
  node = input.required<Node<NodeData>>();
  routes = [];
  constructor(private modelService: NgDiagramModelService) { }
}
