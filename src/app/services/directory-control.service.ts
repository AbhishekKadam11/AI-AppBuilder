import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { SocketService } from './socket.service';

const DIRECTORY_MANAGER = 'DirectoryManager';
const SOCKET_NAMESPACE = '/projectId';

@Injectable({
  providedIn: 'root',
})
export class DirectoryControlService {

  private readonly socketService = inject(SocketService);

  private directorySubscription: Subscription | null = null;
  public directoryDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public directoryData$ = this.directoryDataSubject.asObservable();

  constructor() { }

  loadDirectoryContents(projectName: string): void {

    this.cleanupSubscriptions();

    const message = { action: 'getContainerFiles', path: projectName };
    this.socketService.sendMessage(DIRECTORY_MANAGER, message);
    const serverReply$ = this.socketService.on(DIRECTORY_MANAGER);

    if (serverReply$) {
      this.directorySubscription = serverReply$.subscribe((response: any) => {
        console.log('directory-list- Received directorySubscription from server:', response);
        if (response?.data) {
          this.directoryDataSubject.next(response.data);
        }
      });
    }
  }

  private cleanupSubscriptions(): void {
    if (this.directorySubscription) {
      this.directorySubscription.unsubscribe();
      this.directorySubscription = null;
    }
  }
}
