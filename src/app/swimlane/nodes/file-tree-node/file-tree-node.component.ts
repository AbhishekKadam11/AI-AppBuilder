import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, EventEmitter, HostListener, inject, input, Output, signal, ViewChild } from '@angular/core';
import { NbButtonModule, NbCardModule, NbCdkMappingModule, NbFormFieldModule, NbIconModule, NbInputModule, NbMenuItem, NbMenuModule, NbMenuService, NbPopoverDirective, NbPopoverModule, NbSortDirection, NbSortRequest, NbTooltipModule, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule } from "@nebular/theme";
import {
  NgDiagramBaseNodeTemplateComponent,
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramPortComponent,
  NgDiagramService,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram'
import { Subscription } from 'rxjs/internal/Subscription';
import { FsIconComponent } from '../../../dashboard/fs-icon/fs-icon.component';
import { SocketService } from '../../../services/socket.service';
import { WebContainerService } from '../../../services/web-container.service';
import { WindowService } from '../../../services/window.service';
import { AppWorkflowService } from '../../../services/app-workflow.service';
import { FormsModule } from '@angular/forms';
import { CodeEditorComponent } from '../../../code-display/code-editor.component';
import { NodeData } from '../../../core/common';
import { SwimlaneService } from '../../../services/swimlane.service';

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
  selector: 'app-file-tree-node',
  imports: [NbCardModule, NbTreeGridModule, NbIconModule, CommonModule, FsIconComponent, NbMenuModule, NbPopoverModule, NbCdkMappingModule, NbInputModule, FormsModule, NbFormFieldModule, NgDiagramBaseNodeTemplateComponent, NgDiagramPortComponent, NbButtonModule, NbTooltipModule],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  templateUrl: './file-tree-node.component.html',
  styleUrl: './file-tree-node.component.scss',
})
export class FileTreeNodeComponent {
  customColumn = 'name';
  defaultColumns = ['kind', 'items'];
  allColumns = [this.customColumn];

  dataSource!: NbTreeGridDataSource<FSEntry>;
  sortColumn!: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  private readonly directoryManager: string = 'DirectoryManager';
  private readonly refreshDirectory: string = 'RefreshDirectory';
  private directorySubscription: Subscription | undefined;
  messages: any = { "action": "getAll", "path": "" };
  private subscriptions: Subscription = new Subscription();
  @Output() openFile = new EventEmitter<any>();
  private isWebContainerActive: boolean = false;
  private appList: any[] = [];
  private currentMaxZIndex = signal(2000);
  @ViewChild(NbPopoverDirective)
  popover!: NbPopoverDirective;
  @ViewChild('popoverHost', { read: ElementRef })
  popoverHost!: ElementRef;
  setReadOnly: boolean = false;
  @ViewChild('editInput')
  inputElement!: ElementRef;
  private activeElements: any[] = [];
  addNewInputRow: string = '';
  insertNewRowIndicator: string = '';
  private webContainerSubscription: Subscription | undefined;
  private setKind: string = '';
  private toggleConsoleVisibility = signal(false);

  contextMenuItems: NbMenuItem[] = [
    { title: 'View Details', icon: 'eye-outline' },
    { title: 'Edit Node', icon: 'edit-outline' },
    { title: 'Delete Node', icon: 'trash-outline' },
  ];

  private readonly modelService = inject(NgDiagramModelService);
  private diagramService = inject(NgDiagramService);
  private swimlaneService = inject(SwimlaneService);
  readonly panelOpenState = signal(false);
  node = input.required<Node<NodeData>>();


  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private socketService: SocketService,
    private webContainerService: WebContainerService,
    private windowService: WindowService,
    private menuService: NbMenuService,
    private appWorkflowService: AppWorkflowService) { }

  ngOnInit() {
    this.menuService.onItemClick().subscribe((menuItem) => {
      console.log(menuItem);
      switch (menuItem.item.title) {
        case 'Rename':
          // this.renameDirectory(menuItem.item.data);
          break;
        case 'Delete':
          // console.log('Delete');
          break;
        case 'Add Folder':
          // this.addFileAndFolder(menuItem.item.data, 'directory');
          break;
        case 'Add File':
          // this.addFileAndFolder(menuItem.item.data, 'file');
          break;
      }
    });

  }

  ngAfterViewInit() {

    // this.subscriptions.add(
    //   this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
    //     if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
    // this.messages = { "action": "getContainerFiles", "path": appDetails.data.extraConfig.projectName };
    // this.messages = { "action": "getContainerFiles", "path": 'loginApp5' };
    // this.socketService.sendMessage(this.directoryManager, this.messages);
    // const serverReply$ = this.socketService?.on(this.directoryManager);
    // if (serverReply$) {
    //   this.directorySubscription = serverReply$.subscribe((response: any) => {
    //     console.log('Received directorySubscription from server:', response);
    //     const formatedTree: TreeNode<FSEntry>[] = this.webContainerService.transformToNebularTree(response.data);
    //     this.dataSource = this.dataSourceBuilder.create(formatedTree);
    //   });
    // }
    //   }
    // })
    // );
    this.dataSource = this.dataSourceBuilder.create(this.node().data.dataSource as TreeNode<FSEntry>[]);
    console.log('this.node', this.modelService.getNodeById('id-consoleTree'));
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
        this.currentMaxZIndex.update(z => z + 1);
        this.windowService.openWindow({
          title: row.data.name,
          contentComponent: CodeEditorComponent, // Pass the component class to render
          data: { fileDetails: { fileContent: fileData, filePath: row.data.path.replace(/\\/g, '/') } },
          placeholder: 'h-full w-full col-start-1 col-end-2 row-start-1 row-span-2',
          isMaximized: signal(true),
          zIndex: signal(this.currentMaxZIndex())
        });
      }, error => {
        console.log('onRowClick error', error);
      });
    }
  }

  openOnRightClick(event: MouseEvent, popover: any, row: any) {
    if (row.kind === 'directory') {
      this.contextMenuItems = [
        { title: 'Rename', icon: 'edit-outline', data: row },
        { title: 'Delete', icon: 'trash-outline', data: row },
        { title: 'Copy', icon: 'copy-outline', data: row },
        { title: 'Cut', icon: 'scissors-outline', data: row },
        { title: 'Add Folder', icon: 'folder-outline', data: row },
        { title: 'Add File', icon: 'file-text-outline', data: row }
      ]
    } else if (row.kind === 'file') {
      this.contextMenuItems = [
        { title: 'Rename', icon: 'edit-outline', data: row },
        { title: 'Copy', icon: 'copy-outline', data: row },
        { title: 'Cut', icon: 'scissors-outline', data: row },
        { title: 'Delete', icon: 'trash-outline', data: row }
      ]
    }
    event.preventDefault();
    this.onDocumentClick(event);
    popover.show();
    this.popover = popover;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.popover && this.popover.isShown) {
      const clickedInside = this.popoverHost.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.popover.hide();
      }
    }
    // this.insertNewRowIndicator = '';
  }

  renameDirectory(row: any) {
    row.setReadOnly = !row.setReadOnly;
    const element = document.getElementById(row.name);
    if (element) {
      setTimeout(() => {
        element.focus();
        if (this.activeElements.indexOf(element) === -1) {
          this.activeElements.map(el => {
            if (el.element !== element) {
              el.row.setReadOnly = true;
              el.element.blur();
              this.activeElements.splice(this.activeElements.indexOf(el), 1);
            }
          })
        }
        this.activeElements.push({ element, row });
      }, 0);
    }
  }

  focusOutInput(row: any) {
    if (this.activeElements.length === 0) {
      return;
    }

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
          this.messages = { "action": "rename", "path": appDetails.data.extraConfig.projectName, "content": row };
          this.socketService.sendMessage(this.directoryManager, this.messages);
          const serverReply$ = this.socketService?.on(this.directoryManager);
          if (serverReply$) {
            this.directorySubscription = serverReply$.subscribe((response: any) => {
              console.log('Received directorySubscription rename replay from server:', response);
              this.sendRequestToRename(appDetails.data.extraConfig.projectName, row);
            });
          }
        }
      })
    );
    this.activeElements.map(el => {
      el.row.setReadOnly = true;
      el.element.blur();
    })
  }

  sendRequestToRename(projectName: string, row: any) {
    this.webContainerService.renameWebContainerFile(projectName, row).then(() => {
      console.log('File renamed successfully');
    }).catch((error) => {
      console.error('Error renaming file:', error);
    });
  }

  trackByFn(index: number, item: any) {
    return item.data.id;
  }

  addFileAndFolder(row: any, kind: string) {
    this.insertNewRowIndicator = row.name;
    this.setKind = kind;
  }

  addNewDirectoryRow(row: any) {
    const newRow = {
      name: this.addNewInputRow,
      kind: this.setKind,
      path: row.data.path,
    }
    this.insertNewRowIndicator = '';
    const setAction = this.setKind === 'file' ? 'AddFile' : 'AddFolder';
    this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
      if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
        this.messages = { "action": setAction, "path": appDetails.data.extraConfig.projectName, "content": newRow };
        this.socketService.sendMessage(this.directoryManager, this.messages);
        const serverReply$ = this.socketService?.on(this.refreshDirectory);
        if (serverReply$) {
          this.directorySubscription = serverReply$.subscribe((response: any) => {
            console.log('Received add new file from server:', response);
            this.updateFileSystem(appDetails);
          });
        }
      }
    })
  }

  updateFileSystem(appObject: any) {
    this.messages = { "action": "getContainerFiles", "path": appObject.data.extraConfig.projectName };
    this.socketService.sendMessage(this.directoryManager, this.messages);
    const webContainerFiles$ = this.socketService?.on(this.directoryManager);
    if (webContainerFiles$) {
      this.webContainerSubscription = webContainerFiles$.subscribe((response: any) => {
        console.log('Received updateFileSystem from server:', response);
        if (response && response.data && response.data[appObject.data.extraConfig.projectName]) {
          const formatedTree: TreeNode<FSEntry>[] = this.webContainerService.transformToNebularTree(response.data);
          this.dataSource = this.dataSourceBuilder.create(formatedTree);
          this.webContainerService.mountFiles(response.data[appObject.data.extraConfig.projectName]['directory']);
        } else {
          console.log('Unable to receive webContainerFiles from server: Invalid response data');
        }
      });
    }
  }

  updateNode() {
    this.toggleConsoleVisibility.update(visible => !visible);
    this.swimlaneService.setNodeVisibility('id-consoleTree', this.toggleConsoleVisibility());

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
