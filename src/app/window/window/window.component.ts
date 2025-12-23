import { ChangeDetectorRef, Component, HostBinding, HostListener, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { WindowConfig } from '../window-config';
import { WindowService } from '../../services/window.service';
import { DynamicContentDirective } from '../dynamic-content.directive';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [NgClass, DynamicContentDirective, CommonModule, NbCardModule, NbButtonModule, NbIconModule, DragDropModule],
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})

export class WindowComponent {
  @Input({ required: true }) window!: WindowConfig;
  @Input({ required: true }) index!: number;
  @HostBinding('style.z-index') get zIndex() {
    return this.window.zIndex();
  }

  constructor(public windowService: WindowService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

  minimize(): void {
    console.log('Minimize called for window ID:', this.window.title);
    this.windowService.minimizeWindow(this.window.id);
  }

  maximize(): void {
    console.log('Maximize called for window ID:', this.window.title);
    this.window.placeholder = this.windowService.windowPlaceholderMap[this.window.title];
    this.windowService.maximizeWindow(this.window.id);
  }

  restore(): void {
    console.log('Restore called for window ID:', this.window.title);
    this.window.placeholder = 'w-full h-full overflow-hidden absolute';
    this.windowService.restoreWindow(this.window.id);
  }

  close(): void {
    this.windowService.closeWindow(this.window.id);
  }

@HostListener('mousedown')  
  onWindowClick(): void {
    console.log('onWindowClick called for window ID:', this.window.id);
    this.windowService.bringToFront(this.window.id);
  }
}