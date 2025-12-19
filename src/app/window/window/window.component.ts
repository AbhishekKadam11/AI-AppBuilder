import { ChangeDetectorRef, Component, HostBinding, HostListener, Input } from '@angular/core';
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
  @HostBinding('style.z-index') get zIndex() {
    return this.window.zIndex();
  }

  constructor(private windowService: WindowService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

  getCombinedClasses(): string {
    let classes = '';

    if (this.window?.isMinimized()) classes += ' minimized';
    if (this.window?.isMaximized()) classes += ' maximized';

    if (this.window.placeholder && this.window?.isMaximized()) {
      if (this.window.isMaximized() || (!this.window.isMaximized() && !this.window.isMinimized())) {
        //   classes += ' ' + this.window.placeholder;
      }

    } else if (this.window?.isMinimized()) {
      classes = 'minimized';
    } else {
      classes += ' h-full'; // Default size when not maximized or minimized
    }
    // console.log(classes);
    return classes.trim();
  }

  minimize(): void {
    console.log('Minimize called for window ID:', this.window.id);
    this.windowService.minimizeWindow(this.window.id);
  }

  maximize(): void {
    console.log('Maximize called for window ID:', this.window.id);
    this.window.placeholder = 'w-full h-full';
    this.windowService.maximizeWindow(this.window.id);
  }

  restore(): void {
    console.log('Restore called for window ID:', this.window.id);
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