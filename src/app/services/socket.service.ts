import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {

    private isBrowser = false;
    private socket!: Socket;
    public socketStatus = new Subject<any>();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        // Initialize the Socket.IO connection with the server address
        this.isBrowser = isPlatformBrowser(this.platformId)
        if (this.isBrowser) {
            this.socket = io(environment.socketUrl);
        }
    }

    public connectSocket(projectId: string) {
        if (this.isBrowser && this.socket) {
            //@ts-ignore
            this.socket.nsp = projectId; //'/projectId';
            this.socket.on('connect', () => {
                console.log(`socket ${projectId} connected`);
                this.socketStatus.next({ connected: true });
            });

            this.socket.on('connect_error', (err: any) => {
                console.log("connect_error=>", err.message);
                console.log("connect_error_description=>", err?.description);
                this.socketStatus.next({ connected: false, error: err.message });
            });

            this.socket.on('disconnect', (reason: any, details: any) => {
                console.log("disconnect_reason=>", reason);
                console.log("disconnect_message=>", details.message);
                this.socketStatus.next({ connected: false, error: details.message });
            });
        }
    }

    // Method to send a message to the server
    public sendMessage(event: string, message: any) {
        this.socket.emit(event, message);
    }

    // Method to listen for incoming messages from the server
    // public onEvent(event: string): Observable<any> {
    //     return new Observable((observer) => {
    //         this.socket.on(event, (data: any) => {
    //             observer.next(data);
    //         });
    //     });
    // }

    // Method to listen for an event
    on(eventName: string): Observable<any> | undefined {
        if (this.isBrowser && this.socket) {
            return new Observable((observer) => {
                this.socket.on(eventName, (data: any) => {
                    observer.next(data);
                });
            });
        }
        return undefined;
    }
}