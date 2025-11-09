import { Component, Input, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { WindowConfig } from '../window-config';
import { WindowService } from '../../services/window.service';
import { DynamicContentDirective } from '../dynamic-content.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [NgClass, DynamicContentDirective, CommonModule, DragDropModule, NbCardModule, NbButtonModule, NbIconModule],
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent {
  @Input({ required: true }) window!: WindowConfig;
  @Input({ required: true }) index!: number;

  constructor(private windowService: WindowService) { }

  ngOnInit() {
  }

  minimize(): void {
    this.windowService.minimizeWindow(this.window.id);
  }

  maximize(): void {
    this.windowService.maximizeWindow(this.window.id);
  }

  restore(): void {
    this.windowService.restoreWindow(this.window.id);
  }

  close(): void {
    this.windowService.closeWindow(this.window.id);
  }
}