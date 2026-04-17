import { Component, DestroyRef, inject, input } from '@angular/core';
import { NgDiagramBaseNodeTemplateComponent, NgDiagramModelService, NgDiagramNodeTemplate, NgDiagramPortComponent, type Node } from 'ng-diagram';
import { NbIconModule, NbButtonModule, NbCardModule, NbTooltipModule } from '@nebular/theme';
import { NodeData } from '../../../core/common';
import { SwimlaneService } from '../../../services/swimlane.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CodeEditorComponent } from '../../../code-display/code-editor.component';

@Component({
  selector: 'app-code-editor-node',
  imports: [NgDiagramBaseNodeTemplateComponent, NgDiagramPortComponent, NbIconModule, NbButtonModule, NbCardModule, NbTooltipModule, CodeEditorComponent],
  templateUrl: './code-editor-node.component.html',
  styleUrl: './code-editor-node.component.scss',
})
export class CodeEditorNodeComponent {
  node = input.required<Node<NodeData>>();
  private swimlaneService = inject(SwimlaneService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modelService = inject(NgDiagramModelService)
  fileContent: string = '';

  constructor() {
    this.swimlaneService.nodeEvent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      console.log('CodeEditorNodeComponent Node Event:', event);

      this.node().data.visible = this.swimlaneService.getNodeById(event.nodeId)?.data.visible ?? this.node().data.visible; // Update visibility based on the event's nodeId
    });
    
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation(); // Prevent node dragging when clicking button
  }

}
