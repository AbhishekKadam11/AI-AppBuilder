import { Component, DestroyRef, EventEmitter, Output, inject, input, signal } from '@angular/core';
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
import { WebContainerService } from '../../../services/web-container.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  iframeUrl = signal<SafeResourceUrl | string>('');
  node = input.required<Node<NodeData>>();
  routes = [];
  @Output() navigateUrlEvent = new EventEmitter<string>();
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  constructor(private modelService: NgDiagramModelService,
    private webContainerService: WebContainerService
  ) {

    this.webContainerService.iframeUrl$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(url => {
        if (url) {
           console.log('Received new iframe URL:', url);
          this.updateIframeUrl(url);
        }
      });
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

   private updateIframeUrl(baseUrl: string): void {

    const path = this.node().data.dataSource[0]['component'] || '';
    const appUrl = baseUrl + '/' + path;
    console.log('Updating iframe URL to:', appUrl);
    this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(appUrl));
  }
}
