import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbLayoutModule } from "@nebular/theme";

@Component({
  selector: 'app-browser-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, NbInputModule],
  templateUrl: './browser-window.component.html',
  styleUrl: './browser-window.component.scss'
})

export class BrowserWindowComponent implements OnInit, AfterViewInit {
  // @ViewChild('browserWindow') browserWindow: ElementRef | undefined;
  title = 'My Browser Window';
  isMinimized = false;
  isMaximized = false;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // Implement dragging and resizing logic here
  }

  minimize(): void {
    this.isMinimized = !this.isMinimized;
    // Apply styles to minimize the window
  }

  maximize(): void {
    this.isMaximized = !this.isMaximized;
    // Apply styles to maximize the window
  }

  close(): void {
    // Emit an event or trigger a service to close the window
  }
}