import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { WindowConfig } from '../window/window-config';
import { WindowComponent } from '../window/window/window.component';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private windows: WritableSignal<WindowConfig[]> = signal([]);

  openWindow<T>(config: Omit<WindowConfig<T>, 'id' | 'isMinimized'>): void {
    const newWindow: WindowConfig<T> = {
      ...config,
      id: 'window-' + Date.now(), // Generate a unique ID
      isMinimized: signal(false),
      // placeholder: 'top-20 left-16 w-1/2 h-1/2'
    };
    this.windows.update(w => [...w, newWindow]);
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
    // this.updateWindowState(id, 'isMaximized', false);
    // this.updateWindowState(id, 'isMinimized', false);
  }

  getWindows(): Signal<WindowConfig[]> {
    return this.windows.asReadonly();
  }

  private updateWindowState(id: string, property: 'isMinimized' | 'isMaximized', value: boolean): void {
    this.windows.update(w =>
      w.map(win => (win.id === id ? { ...win, [property]: signal(value) } : win))
    );
  }

  renderWindows(windowHost: any, windowsComponents: Map<string, any>, renderer: any): void {
      if (!windowHost) return; 
  
      const currentWindows = this.getWindows()();
      // CRITICAL CHANGE: activeWindowIds should only contain IDs of windows that are *not* minimized
      const activeWindowIds = new Set(currentWindows.filter(w => !w.isMinimized()).map(w => w.id));
  
      // 1. Destroy components that should no longer be in the dashboard area
      windowsComponents.forEach((componentRef, id) => {
        // If the window ID is not in the active list (it's minimized or closed), destroy the component
        if (!activeWindowIds.has(id)) {
          componentRef.destroy();
          windowsComponents.delete(id);
        }
      });
  
      // 2. Create components for windows that should be active and aren't already rendered
      currentWindows.forEach((windowConfig, index) => {
        // Only act if the window is NOT minimized and NOT already rendered
        if (!windowConfig.isMinimized() && !windowsComponents.has(windowConfig.id)) {
          const componentRef = windowHost.createComponent(WindowComponent);
          componentRef.instance.window = windowConfig;
          
          // Add Tailwind placement classes via the Renderer2
          if (windowConfig.data?.placementClasses) {
            windowConfig.data.placementClasses.split(' ').forEach((cls: string) => {
               renderer.addClass(componentRef.location.nativeElement, cls);
            });
          }
  
          windowsComponents.set(windowConfig.id, componentRef);
          this.updateWindowState(windowConfig.id, 'isMinimized', true);
        }
      });
    }
}