import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    // private socket: Socket;

    constructor(private socket: Socket) {
        // Initialize the Socket.IO connection with the server address
        //this.socket = io('http://localhost:8001/projectId'); // Replace with your server address
        socket.connect()

        this.socket.of('/projectId').on('connect', () => {
            console.log('socket_ONE connected');
            this.socket.emit('SOURCE', 'SESSION');
        })

        this.socket.on("connect_error", (err) => {
            // the reason of the error, for example "xhr poll error"
            console.log(err.message);

            // some additional description, for example the status code of the initial HTTP response
            //@ts-ignore
            console.log(err?.description);

            // some additional context, for example the XMLHttpRequest object
            // console.log(err.context);
        });
        this.socket.on("disconnect", (reason, details) => {
            // the reason of the disconnection, for example "transport error"
            console.log(reason);

            // the low-level reason of the disconnection, for example "xhr post error"
            //@ts-ignore
            console.log(details.message);
        });
    }

    // Method to send a message to the server
    public sendMessage(event: string, message: any) {
        this.socket.emit(event, message);
    }

    // Method to listen for incoming messages from the server
    public onEvent(event: string): Observable<any> {
        return new Observable((observer) => {
            this.socket.on(event, (data: any) => {
                observer.next(data);
            });
        });
    }
}