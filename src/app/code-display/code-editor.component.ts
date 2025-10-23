import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCardModule, NbLayoutModule, NbWindowRef } from '@nebular/theme';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { WebContainerService } from '../services/web-container.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AppWorkflowService } from '../services/app-workflow.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-code-editor',
  imports: [MonacoEditorModule, CommonModule, FormsModule, NbLayoutModule, NbCardModule],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
  @Input() fileDetails: any;
  editorOptions = { theme: 'vs-dark', language: 'typescript', contextmenu: true, automaticLayout: true, scrollBeyondLastLine: false, paths: { vs: window.location.origin + '/monaco-editor/vs' } };
  code: string = 'function x() {\nconsole.log("Hello world!");\n}';
  private monacoEditor: any;
  private subscriptions: Subscription = new Subscription();
  private readonly directoryManager: string = 'DirectoryManager';
  private directorySubscription: Subscription | undefined;

  constructor(private webContainerService: WebContainerService,
    private appWorkflowService: AppWorkflowService,
    private socketService: SocketService,
  ) {

  }

  onEditorInit(editor: any) {
    this.monacoEditor = editor;

    // Subscribe to the Monaco editor's built-in onKeyUp event.
    this.monacoEditor.onKeyUp(() => {
      this.handleKeyUpEvent();
    });
  }

  handleKeyUpEvent() {
    // console.log('Current code:', this.fileDetails.fileContent);
    // console.log('Current path:', this.fileDetails.filePath);
    this.webContainerService.webContainerWriteFileContent(this.fileDetails.filePath, this.fileDetails.fileContent);
    this.saveToRemote();
  }

  saveToRemote() {
    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails.projectName && !this.socketService?.socketStatus.closed) {
          const messages = { "action": "save", "path": appDetails.projectName + '/' + this.fileDetails.filePath, content: this.fileDetails.fileContent };
          this.socketService.sendMessage(this.directoryManager, messages);
          const serverReply$ = this.socketService?.on(this.directoryManager);
          if (serverReply$) {
            this.directorySubscription = serverReply$.subscribe((response: any) => {
              console.log('Received directorySubscription save action from server:', response);
            });
          }
        }
      })
    );
  }
}
