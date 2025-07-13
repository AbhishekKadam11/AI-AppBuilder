import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class SocketService {

    private isBrowser = false;
    private url = 'http://localhost:8001';
    private socket: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        // Initialize the Socket.IO connection with the server address
        this.isBrowser = isPlatformBrowser(this.platformId)
        if (this.isBrowser) {
            this.socket = io(this.url);
        }

    }

    public connectSocket(projectId: string) {
        if (this.isBrowser && this.socket) {
            this.socket.nsp = projectId; //'/projectId';
            this.socket.on('connect', () => {
                console.log('socket_ONE connected');
                this.socket.emit('SOURCE', `Client sending data from ${projectId}`);
            });

            this.socket.on('connect_error', (err: any) => {
                console.log("connect_error=>", err.message);
                console.log("connect_error_description=>",err?.description);
            });

            this.socket.on('disconnect', (reason: any, details: any) => {
                console.log("disconnect_reason=>", reason);
                console.log("disconnect_message=>", details.message);
            });

        }
    }

    // Method to send a message to the server
    public sendMessage(event: string, message: any) {
        // this.socket.emit(event, message);
    }

    // Method to listen for incoming messages from the server
    public onEvent(event: string): Observable<any> {
        return new Observable((observer) => {
            // this.socket.on(event, (data: any) => {
            //     observer.next(data);
            // });
        });
    }
}