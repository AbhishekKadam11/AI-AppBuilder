import { Component } from '@angular/core';
import { NbLayoutModule } from '@nebular/theme';
import { ChatShowcaseComponent } from '../../chat-showcase/chat-showcase.component';
import { BrowserWindowComponent } from '../../browser-window/browser-window.component';
import { ConsoleWindowComponent } from '../../console-window/console-window.component';

@Component({
  selector: 'app-workbench',
  imports: [NbLayoutModule, ChatShowcaseComponent, BrowserWindowComponent, ConsoleWindowComponent,],
  templateUrl: './workbench.component.html',
  styleUrl: './workbench.component.scss'
})
export class WorkbenchComponent {

}
