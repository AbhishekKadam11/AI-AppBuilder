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
  private appList: any[] = [];

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private socketService: SocketService,
    private webContainerService: WebContainerService,
    private windowService: WindowService,
    private appWorkflowService: AppWorkflowService) {
  }

  ngAfterViewInit() {

    this.subscriptions.add(
    this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
          this.messages = { "action": "getContainerFiles", "path": appDetails.data.extraConfig.projectName };
          this.socketService.sendMessage(this.directoryManager, this.messages);
          const serverReply$ = this.socketService?.on(this.directoryManager);
          if (serverReply$) {
            this.directorySubscription = serverReply$.subscribe((response: any) => {
              console.log('Received directorySubscription from server:', response);
              const formatedTree: TreeNode<FSEntry>[] = this.webContainerService.transformToNebularTree(response.data);
              this.appWorkflowService.saveAppObjInLocalStorage(appDetails);
              this.dataSource = this.dataSourceBuilder.create(formatedTree);
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
    if (row && row.data && row.data.kind !== 'directory') {
      this.webContainerService.webContainerFileContent(row.data.path.replace(/\\/g, '/')).then((fileData: string) => {
        this.windowService.openWindow({
          title: row.data.name,
          contentComponent: CodeEditorComponent, // Pass the component class to render
          data: { fileDetails: { fileContent: fileData, filePath: row.data.path.replace(/\\/g, '/') } }
        });
      }, error => {
        console.log('onRowClick error', error);
      });
    }
  }

   ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}


