import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbLayoutModule } from "@nebular/theme";
import { Subscription } from 'rxjs/internal/Subscription';
import { WebContainerService } from '../services/web-container.service';

//@ts-ignore
import files from '../../assets/fs-tree';
import { SocketService } from '../services/socket.service';
import { FileSystemTreeGeneratorService } from '../services/file-system-tree-generator.service';
import { FileSystemTree } from '@webcontainer/api';

@Component({
  selector: 'app-browser-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, NbInputModule, CommonModule],
  templateUrl: './browser-window.component.html',
  styleUrl: './browser-window.component.scss'
})

export class BrowserWindowComponent implements OnInit, AfterViewInit {
  // @ViewChild('browserWindow') browserWindow: ElementRef | undefined;
  title = 'My Browser Window';
  isMinimized = false;
  isMaximized = false;
  iframeUrl: SafeResourceUrl | null = null;
  outputLogs: string[] = [];
  private subscriptions: Subscription = new Subscription();
  private webContainerSubscription: Subscription | undefined;
  private socketSubscription!: Subscription;
  private readonly readDirectoryContent: string = 'ReadDirectoryContent';
  private readonly webContainerFiles: string = 'WebContainerFiles';
  private readonly directoryManager: string = 'DirectoryManager';
  messages: any = { "action": "geContinerFiles", "path": "newApp" };
  private fileSystemTree: any | null = null;
  private isWebContainerActive: boolean = false;

  constructor(private webContainerService: WebContainerService,
    private socketService: SocketService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

    // Subscribe to iframe URL updates from the service
    this.subscriptions.add(
      this.webContainerService.iframeUrl$.subscribe(url => {
        if (url) {
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      })
    );

    // Subscribe to logs for display
    this.subscriptions.add(
      this.webContainerService.output$.subscribe(log => {
        this.outputLogs.push(log);
      })
    );

    this.socketService.connectSocket('/projectId');
    this.socketSubscription = this.socketService?.socketStatus.subscribe((message) => {
      if (message.connected) {
        this.socketService.sendMessage(this.directoryManager, this.messages);
        const webContainerFiles$ = this.socketService?.on(this.webContainerFiles);
        if (webContainerFiles$) {
          this.webContainerSubscription = webContainerFiles$.subscribe((response: any) => {
            console.log('Received webContainerFiles from server:', response);
            this.fileSystemTree = this.webContainerService.buildWebContainerFileTree(response.data['newApp']['directory']) as any;
            // console.log('Constructed FileSystemTree:', this.fileSystemTree);
            if (this.fileSystemTree && !this.isWebContainerActive) {
             this.webContainerService.bootAndRun(response.data['newApp']['directory']);
              this.isWebContainerActive = true;
            }
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Implement dragging and resizing logic here
  }

  minimize(): void {
    this.isMinimized = !this.isMinimized;
    // Apply styles to minimize the window
  }

  maximize(): void {
    this.isMaximized = !this.isMaximized;
    // Apply styles to maximize the window
  }

  close(): void {
    // Emit an event or trigger a service to close the window
  }
}