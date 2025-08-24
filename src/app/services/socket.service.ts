import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs/internal/Observable';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { map } from 'rxjs/internal/operators/map';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs/internal/Subject';
import { switchAll } from 'rxjs/internal/operators/switchAll';
import { catchError } from 'rxjs/internal/operators/catchError';
import { retry } from 'rxjs/internal/operators/retry';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { retryWhen } from 'rxjs/internal/operators/retryWhen';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { timer } from 'rxjs/internal/observable/timer';

@Injectable({
    providedIn: 'root',
})
export class SocketService {

    private isBrowser = false;
    private url = 'http://localhost:8001';
    private socket: any;
    public isConnected$: Observable<boolean> | undefined;
    private messagesSubject = new Subject<any>();
    public messages$ = this.messagesSubject.pipe(switchAll(), catchError(e => { throw e }));

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
                // this.socket.emit('SOURCE', `${projectId}`);
            });

            this.socket.on('connect_error', (err: any) => {
                console.log("connect_error=>", err.message);
                console.log("connect_error_description=>", err?.description);
            });

            this.socket.on('disconnect', (reason: any, details: any) => {
                console.log("disconnect_reason=>", reason);
                console.log("disconnect_message=>", details.message);
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

    //     private isBrowser = false;
    //     private socket$: WebSocketSubject<any> | undefined;
    //     private messagesSubject = new Subject<any>();
    //     public messages$ = this.messagesSubject.pipe(switchAll(), catchError(e => { throw e }));
    // private reconnectInterval = 5000;

    //     constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    //         // Initialize the Socket.IO connection with the server address
    //         this.isBrowser = isPlatformBrowser(this.platformId);
    //         if (this.isBrowser) {
    //             // this.socket = io(this.url);
    //             this.connect('ws://localhost:8001/projectId');
    //         }

    //     }

    //     /**
    //      * Connects to the WebSocket server with optional retry logic.
    //      * @param url The WebSocket URL (e.g., 'ws://localhost:8080').
    //      */
    //     public connect(url: string): void {
    //         // debugger
    //         // if ((!this.socket$ || this.socket$.closed) && this.isBrowser) {
    //         //     this.socket$ = this.getNewWebSocket(url);
    //         //     const messagesObservable = this.socket$.pipe(
    //         //         retry({ delay: 1000 }), // Retry connection after 5 seconds if it fails
    //         //         catchError(error => {
    //         //             console.error('WebSocket connection error:', error);
    //         //             return EMPTY;
    //         //         })
    //         //     );
    //         //     this.messagesSubject.next(messagesObservable);
    //         // }
    //         this.socket$ = webSocket(url);

    //     }

    //     private getNewWebSocket(url: string): WebSocketSubject<any> {
    //         return webSocket({
    //             url: url,
    //             openObserver: {
    //                 next: () => console.log('WebSocket connection established.')
    //             },
    //             closeObserver: {
    //                 next: () => console.log('WebSocket connection closed.')
    //             },
    //         });
    //     }

    //     /**
    //      * Sends a message to the WebSocket server.
    //      * @param message The message to send.
    //      */
    //     public sendMessage(message: any): void {
    //         if (this.socket$) {
    //             this.socket$.next(message);
    //         } else {
    //             console.error('WebSocket is not connected.');
    //         }
    //     }

    //     /**
    //      * Closes the WebSocket connection.
    //      */
    //     public close(): void {
    //         if (this.socket$) {
    //             this.socket$.complete();
    //         }
    //     }
}