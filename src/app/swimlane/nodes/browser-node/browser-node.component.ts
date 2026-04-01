import { Component, EventEmitter, Output, input } from '@angular/core';
import { NbCardModule, NbIconModule, NbListModule, NbTagModule } from '@nebular/theme';
import {
  NgDiagramBaseNodeTemplateComponent,
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram'
import { NodeData } from '../../../core/common';
import { CommonModule } from '@angular/common';
import { BrowserWindowComponent } from '../../../browser-window/browser-window.component';

@Component({
  selector: 'app-browser-node',
  imports: [NbCardModule, NgDiagramBaseNodeTemplateComponent, NbListModule, NbTagModule, CommonModule, NbIconModule, BrowserWindowComponent],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './browser-node.component.html',
  styleUrl: './browser-node.component.scss',
})
export class BrowserNodeComponent {

  node = input.required<Node<NodeData>>();
  routes = [];
  @Output() navigateUrlEvent = new EventEmitter<string>();

  constructor(private modelService: NgDiagramModelService,) {

  }

  selectRoute(route: any) {
    console.log('Selected route:', route);
    // You can add your logic here to handle the selected route
  }

  navigateToUrl(url: string): void {
    console.log('Navigating to URL:', url);
    if (url) {
      // Emit an event or call a service to navigate to the URL in the browser window
      // For example, you could use an EventEmitter to notify the parent component
      // this.navigateUrlEvent.emit(url);
      // Or directly call a method in the BrowserWindowComponent if you have a reference to it
      // this.browserWindowComponent.navigateToUrl(url);
      this.navigateUrlEvent.emit(url);
    }
  }
}
