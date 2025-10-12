import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { NbCardModule, NbLayoutModule, NbWindowRef } from '@nebular/theme';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-code-editor',
  imports: [MonacoEditorModule, CommonModule, FormsModule, NbLayoutModule, NbCardModule],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
  @Input() fileContent: string = '';
  editorOptions = { theme: 'vs-dark', language: 'javascript', contextmenu: false, automaticLayout: true, scrollBeyondLastLine: false };
  code: string = 'function x() {\nconsole.log("Hello world!");\n}';
}
