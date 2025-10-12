import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbCardModule, NbIconModule, NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule } from '@nebular/theme';
import { FsIconComponent } from '../fs-icon/fs-icon.component';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AppWorkflowService } from '../../services/app-workflow.service';
import { WebContainerService } from '../../services/web-container.service';
import { WindowService } from '../../services/window.service';
import { CodeEditorComponent } from '../../code-display/code-editor.component';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  name: string;
  kind: string;
  items?: number;
}

@Component({
  selector: 'app-directory-list',
  imports: [NbTreeGridModule, NbIconModule, NbCardModule, CommonModule, FsIconComponent],
  standalone: true,
  templateUrl: './directory-list.component.html',
  styleUrl: './directory-list.component.scss'
})

export class DirectoryListComponent {
  customColumn = 'name';
  defaultColumns = ['kind', 'items'];
  allColumns = [this.customColumn];

  data: TreeNode<FSEntry>[] = [
    {
      data: { name: 'Projects', items: 5, kind: 'dir' },
      children: [
        { data: { name: 'project-1.doc', kind: 'doc' } },
        { data: { name: 'project-2.doc', kind: 'doc' } },
        {
          data: { name: 'project-3', kind: 'dir', items: 3 },
          children: [
            { data: { name: 'project-3A.doc', kind: 'doc' } },
            { data: { name: 'project-3B.doc', kind: 'doc' } },
            { data: { name: 'project-3C.doc', kind: 'doc' } },
          ],
        },
        { data: { name: 'project-4.docx', kind: 'docx' } },
      ],
    },
    {
      data: { name: 'Reports', kind: 'dir', items: 2 },
      children: [
        {
          data: { name: 'Report 1', kind: 'dir', items: 1 },
          children: [
            { data: { name: 'report-1.doc', kind: 'doc' } },
          ],
        },
        {
          data: { name: 'Report 2', kind: 'dir', items: 2 },
          children: [
            { data: { name: 'report-2.doc', kind: 'doc' } },
            { data: { name: 'report-2-note.txt', kind: 'txt' } },
          ],
        },
      ],
    },
    {
      data: { name: 'Other', kind: 'dir', items: 2 },
      children: [
        { data: { name: 'backup.bkp', kind: 'bkp' } },
        { data: { name: 'secret-note.txt', kind: 'txt' } },
      ],
    },
  ];

  dataSource!: NbTreeGridDataSource<FSEntry>;
  sortColumn!: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  private readonly directoryManager: string = 'DirectoryManager';
  private directorySubscription: Subscription | undefined;
  messages: any = { "action": "getAll", "path": "" };
  private subscriptions: Subscription = new Subscription();
  @Output() openFile = new EventEmitter<any>();
  private readonly webContainerFiles: string = 'WebContainerFiles';
  private isWebContainerActive: boolean = false;

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private socketService: SocketService,
    private webContainerService: WebContainerService,
    private windowService: WindowService,
    private appWorkflowService: AppWorkflowService) {
  }

  ngAfterViewInit() {

    // Test. Hardcoded project path
    // this.messages = { "action": "getAll", "path": "newApp1" };
    // this.socketService.sendMessage(this.directoryManager, this.messages);
    // const serverReply$ = this.socketService?.on(this.directoryManager);
    // if (serverReply$) {
    //   this.directorySubscription = serverReply$.subscribe((response: any) => {
    //     console.log('Received directorySubscription from server:', response);
    //     this.dataSource = this.dataSourceBuilder.create(response.data);
    //   });
    // }


    //1. Required server side directory fetch

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails.projectName && !this.socketService?.socketStatus.closed) {
          this.messages = { "action": "getAll", "path": appDetails.projectName };
          this.socketService.sendMessage(this.directoryManager, this.messages);
          const serverReply$ = this.socketService?.on(this.directoryManager);
          if (serverReply$) {
            this.directorySubscription = serverReply$.subscribe((response: any) => {
              console.log('Received directorySubscription from server:', response);
              this.dataSource = this.dataSourceBuilder.create(response.data);
            });
          }
        }
      })
    );
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  onRowClick(row: any) {
    if (row && row.data && row.data.kind !== 'directory' && this.isWebContainerActive) {
      //Test. Hardcoded access webcontainer file
      // this.messages = { "action": "getContinerFiles", "path": "newApp1" };
      // this.socketService.sendMessage(this.directoryManager, this.messages);
      // const webContainerFiles$ = this.socketService?.on(this.webContainerFiles);
      // if (webContainerFiles$) {
      //   webContainerFiles$.subscribe((response: any) => {
      //     console.log('Mod webContainerFiles from server:', response);
      //     if (!this.isWebContainerActive) {
      //       this.webContainerService.bootAndRun(response.data['newApp1']['directory']);
      //       this.isWebContainerActive = true;
      //     }

      //     this.webContainerService.webContainerFileContent(row.data.path.replace(/\\/g, '/')).then((fileData: string) => {
      //       this.windowService.openWindow({
      //         title: row.data.name,
      //         contentComponent: CodeEditorComponent, // Pass the component class to render
      //         data: { fileContent: fileData }
      //       });
      //     }, error => {
      //       console.log('error', error);
      //     });

      //   });
      // }


      this.webContainerService.webContainerFileContent(row.data.path.replace(/\\/g, '/')).then((fileData: string) => {
        this.windowService.openWindow({
          title: row.data.name,
          contentComponent: CodeEditorComponent, // Pass the component class to render
          data: { fileContent: fileData }
        });
      }, error => {
        console.log('error', error);
      });

    }
  }
}


