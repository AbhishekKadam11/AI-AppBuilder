import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject } from 'rxjs'; // Fixed imports (removed /internal)
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private isBrowser = false;
  // Store multiple sockets using a Map, keyed by namespace/projectId
  private sockets = new Map<string, Socket>();

  public socketStatus = new Subject<{ namespace: string; connected: boolean; error?: string }>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initSocketConnection();
  }

  ngOnDestroy(): void {
    // Clean up all sockets when the service is destroyed
    this.sockets.forEach((socket) => {
      socket.removeAllListeners();
      socket.disconnect();
    });
    this.sockets.clear();
    this.socketStatus.complete();
  }

  private initSocketConnection() {
    if (this.isBrowser && environment.activeSocketNamespace?.length > 0) {
      for (const namespace of environment.activeSocketNamespace) {
        this.getOrCreateSocket(namespace);
      }
    }
  }

  /**
   * Core method to get an existing socket or create a new one for a namespace
   */
  private getOrCreateSocket(namespace: string): Socket | null {
    if (!this.isBrowser) return null;

    // Return existing socket if already connected/connecting
    if (this.sockets.has(namespace)) {
      return this.sockets.get(namespace)!;
    }

    // Create new socket for the specific namespace
    const url = `${environment.socketUrl}${namespace}`;
    const socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      timeout: 20000,
    });

    // Attach listeners once during creation, not on every connect call
    socket.on('connect', () => {
      console.log(`Socket [${namespace}] connected`);
      this.socketStatus.next({ namespace, connected: true });
    });

    socket.on('connect_error', (err: Error) => {
      console.error(`Socket [${namespace}] connect_error:`, err.message);
      this.socketStatus.next({ namespace, connected: false, error: err.message });
    });

    socket.on('disconnect', (reason: string) => {
      console.warn(`Socket [${namespace}] disconnected:`, reason);
      this.socketStatus.next({ namespace, connected: false, error: reason });
    });

    this.sockets.set(namespace, socket);
    return socket;
  }

  /**
   * Public method to ensure a socket is connected to a specific project/namespace
   */
  public connectSocket(projectId: string): void {
    this.getOrCreateSocket(projectId);
  }

  public sendMessage(event: string, message: any, namespace?: string): void {
    const nsp = namespace || environment.activeSocketNamespace?.[0];
    if (!nsp) {
      console.error('No namespace provided and no default namespace configured.');
      return;
    }

    const socket = this.sockets.get(nsp);
    if (socket) {
      socket.emit(event, message);
    } else {
      console.warn(`Socket namespace [${nsp}] not initialized. Cannot emit event: ${event}`);
    }
  }

  public on(eventName: string, namespace?: string): Observable<any> {
    const nsp = namespace || environment.activeSocketNamespace?.[0];

    if (!this.isBrowser || !nsp) {
      return new Observable(); // Return empty observable if not in browser or no namespace
    }

    const socket = this.getOrCreateSocket(nsp);

    return new Observable((observer) => {
      if (!socket) {
        observer.complete();
        return;
      }

      const handler = (data: any) => observer.next(data);
      socket.on(eventName, handler);

      // Return teardown function to prevent memory leaks when observable is unsubscribed
      return () => {
        socket.off(eventName, handler);
      };
    });
  }

  public disconnectSocket(namespace: string): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }
}
