import { Component, DestroyRef, inject, input } from '@angular/core';
import { NgDiagramBaseNodeTemplateComponent, NgDiagramNodeTemplate, NgDiagramPortComponent, type Node } from 'ng-diagram';
import { NbIconModule, NbButtonModule, NbCardModule, NbTooltipModule } from '@nebular/theme';
import { ConsoleWindowComponent } from '../../../console-window/console-window.component';
import { NodeData } from '../../../core/common';
import { SwimlaneService } from '../../../services/swimlane.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-console-node',
  imports: [NgDiagramBaseNodeTemplateComponent, NgDiagramPortComponent, NbIconModule, NbButtonModule, NbCardModule, NbTooltipModule, ConsoleWindowComponent],
  templateUrl: './console-node.component.html',
  styleUrl: './console-node.component.scss',
})
export class ConsoleNodeComponent {
  node = input.required<Node<NodeData>>();
  private swimlaneService = inject(SwimlaneService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.swimlaneService.nodeEvent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      console.log('ConsoleNodeComponent Node Event:', event);

      this.node().data.visible = this.swimlaneService.getNodeById(event.nodeId)?.data.visible ?? this.node().data.visible; // Update visibility based on the event's nodeId
    });
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation(); // Prevent node dragging when clicking button
  }

}


