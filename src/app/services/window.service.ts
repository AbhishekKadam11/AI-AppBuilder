import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { WindowConfig } from '../window/window-config';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private windows: WritableSignal<WindowConfig[]> = signal([]);
  private currentMaxZIndex = signal(1000);
  public windowPlaceholderMap: { [key: string]: string } = {};

  openWindow<T>(config: Omit<WindowConfig<T>, 'id' | 'isMinimized'>): void {
    const newWindow: WindowConfig<T> = {
      ...config,
      id: 'window-' + Date.now(), // Generate a unique ID
      isMinimized: signal(false),
    };
    this.windows.update(w => [...w, newWindow]);
    this.windowPlaceholderMap[newWindow.title] = newWindow.placeholder;
  }

  closeWindow(id: string): void {
    this.windows.update(w => w.filter(win => win.id !== id));
  }

  minimizeWindow(id: string): void {
    this.updateWindowState(id, 'isMinimized', true);
    this.updateWindowState(id, 'isMaximized', false);
  }

  maximizeWindow(id: string): void {
    console.log(`maximizeWindow requested for window ID: ${id}`, this.windows());
    this.updateWindowState(id, 'isMaximized', true);
    this.updateWindowState(id, 'isMinimized', false); // Cannot be both maximized and minimized
  }

  restoreWindow(id: string): void {
    console.log(`restoreWindow requested for window ID: ${id}`, this.windows());
    this.updateWindowState(id, 'isMaximized', false);
    this.updateWindowState(id, 'isMinimized', false);
  }

  getWindows(): Signal<WindowConfig[]> {
    return this.windows.asReadonly();
  }

  private updateWindowState(id: string, property: 'isMinimized' | 'isMaximized', value: boolean): void {
    this.windows.update(w =>
      w.map(win => (win.id === id ? { ...win, [property]: signal(value) } : win))
    );
  }

  bringToFront(id: string): void {
    const window = this.getWindows()().find(w => w.id === id);
    if (window) {
      this.currentMaxZIndex.update(z => z + 1);
      window.zIndex.set(this.currentMaxZIndex());
    }
  }

  getWindowClasses(window: WindowConfig): string {
    let classes = '';

    if (window.isMinimized()) classes += ' minimized';
    if (window.isMaximized()) { classes += ' maximized' };

    if (window.placeholder && window.isMaximized()) {
      //if (this.window.isMaximized() || (!this.window.isMaximized() && !this.window.isMinimized())) {
      //   classes += ' ' + this.window.placeholder;
      //}
      classes += ' maximized ' + this.windowPlaceholderMap[window.title];
    } else if (window.isMinimized()) {
      classes = 'minimized';
    } else {
      classes += 'w-full h-full overflow-hidden absolute'; // Default size when not maximized or minimized
    }
    // console.log(classes);
    return classes.trim();
  }
}