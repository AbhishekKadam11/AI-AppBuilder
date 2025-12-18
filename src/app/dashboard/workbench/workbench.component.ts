import { Component, signal } from '@angular/core';
import { NbLayoutModule } from '@nebular/theme';
import { ChatShowcaseComponent } from '../../chat-showcase/chat-showcase.component';
import { BrowserWindowComponent } from '../../browser-window/browser-window.component';
import { ConsoleWindowComponent } from '../../console-window/console-window.component';
import { WindowComponent } from '../../window/window/window.component';
import { WindowService } from '../../services/window.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workbench',
  imports: [NbLayoutModule, WindowComponent, CommonModule],
  // imports: [NbLayoutModule,],
  templateUrl: './workbench.component.html',
  styleUrl: './workbench.component.scss'
})
export class WorkbenchComponent {

  constructor(public windowService: WindowService) {

    this.openSecondWindow();
    setTimeout(() => this.openThirdWindow(), 100);
    setTimeout(() => this.openFirstWindow(), 110);
  }


  getWindowIndex(windowId: string): number {
    const windows = this.windowService.getWindows()();
    return windows.findIndex(w => w.id === windowId);
  }

  ngAfterViewInit(): void {

  }

  openFirstWindow(): void {
    this.windowService.openWindow({
      title: 'Console',
      contentComponent: ConsoleWindowComponent,
      data: {},
      placeholder: 'h-full w-full min-w-1/2 row-start-2 col-end-2 ',
      maximizedStyles: {},
      isMaximized: signal(true),
      zIndex: signal(100)
    });
  }

  openSecondWindow(): void {
    this.windowService.openWindow({
      title: 'Chat',
      contentComponent: ChatShowcaseComponent,
      data: {},
      placeholder: 'h-full w-full col-start-1 col-end-2 row-start-1',
      isMaximized: signal(true),
      zIndex: signal(100)
    });
  }

  openThirdWindow(): void {
    this.windowService.openWindow({
      title: 'Browser',
      contentComponent: BrowserWindowComponent,
      data: {},
      placeholder: 'h-full w-full col-start-2 col-end-2 row-span-2',
      isMaximized: signal(true),
      zIndex: signal(100)
    });
  }
}
