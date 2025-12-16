import { ChangeDetectorRef, Component, EventEmitter, Input, Output, computed, output } from '@angular/core';
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
  readonly minimizeWindowEvent = output<void>();
  readonly maximizeWindowEvent = output<void>();
  // placeholder = 'top-20 left-16 w-1/2 h-1/2';

  constructor(private windowService: WindowService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

  getCombinedClasses(): string {
    let classes = '';

    // Always include base classes
    if (this.window?.isMinimized()) classes += ' minimized';
    if (this.window?.isMaximized()) classes += ' maximized';
  //  console.log('Window State - Minimized:', this.window?.isMinimized(), 'Maximized:', this.window?.isMaximized());
    // Conditionally add placement classes
    if (this.window.placeholder && this.window?.isMaximized()) {
      // Check the condition for applying the placement classes (e.g. only when maximized, or default state)
      if (this.window.isMaximized() || (!this.window.isMaximized() && !this.window.isMinimized())) {
        //   classes += ' ' + this.window.placeholder;
      }
    } else {
      classes = 'minimized';
    }
    // console.log(classes);
    return classes.trim();
  }

  minimize(): void {
    // this.minimizeWindowEvent.emit();
    this.windowService.minimizeWindow(this.window.id);
    // this.getCombinedClasses()
    // this.window.placeholder = 'bottom-0 left-0 w-32 h-8';
  }

  maximize(): void {
    // this.maximizeWindowEvent.emit();
    this.windowService.maximizeWindow(this.window.id);
    // this.getCombinedClasses()
    // this.cdr.detectChanges();
    // this.cdr.reattach();
  }

  restore(): void {
    this.windowService.restoreWindow(this.window.id);
  }

  close(): void {
    this.windowService.closeWindow(this.window.id);
  }


}