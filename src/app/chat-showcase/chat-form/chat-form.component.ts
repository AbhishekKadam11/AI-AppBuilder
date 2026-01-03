import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NbButtonModule, NbComponentOrCustomStatus, NbIconModule, NbInputModule } from '@nebular/theme';

@Component({
  selector: 'app-chat-form',
  imports: [NbIconModule, CommonModule, NbInputModule, NbButtonModule, FormsModule],
  standalone: true,
  templateUrl: './chat-form.component.html',
  styleUrl: './chat-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatFormComponent {
  status: NbComponentOrCustomStatus = 'basic';
  inputFocus: boolean = false;
  inputHover: boolean = false;

  droppedFiles: any[] = [];
  imgDropTypes = ['image/png', 'image/jpeg', 'image/gif'];

  /**
   * Predefined message text
   * @type {string}
   */
  @Input() message: string = '';

  /**
   * Message placeholder text
   * @type {string}
   */
  @Input() messagePlaceholder: string = 'Type a message';
  /**
   * Send button title
   * @type {string}
   */
  @Input() buttonTitle: string = '';

  /**
   * Send button icon, shown if `buttonTitle` is empty
   * @type {string}
   */
  @Input() buttonIcon: string = 'paper-plane-outline';

  /**
   * Show send button
   * @type {boolean}
   */
  @Input() showButton: boolean = true;

  /**
   * Show send button
   * @type {boolean}
   */
  @Input() dropFiles: boolean = false;

  /**
   * File drop placeholder text
   * @type {string}
   */
  @Input() dropFilePlaceholder: string = 'Drop file to send';

  /**
   *
   * @type {EventEmitter<{ message: string, files: File[] }>}
   */
  @Output() send = new EventEmitter<{ message: string; files: File[] }>();

  /**
   * Emits when message input value has been changed
   * @type {EventEmitter<string>}
   */
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onInputChange = new EventEmitter<string>();

  @HostBinding('class.file-over') fileOver = false;

  constructor(protected cd: ChangeDetectorRef, protected domSanitizer: DomSanitizer) { }

  @HostListener('drop', ['$event'])
  onDrop(event: any) {
    if (this.dropFiles) {
      event.preventDefault();
      event.stopPropagation();

      this.fileOver = false;
      if (event.dataTransfer && event.dataTransfer.files) {
        for (const file of event.dataTransfer.files) {
          const res = file;

          if (this.imgDropTypes.includes(file.type)) {
            const fr = new FileReader();
            fr.onload = (e: any) => {
              res.src = e.target.result;
              res.urlStyle = this.domSanitizer.bypassSecurityTrustStyle(`url(${res.src})`);
              this.cd.detectChanges();
            };

            fr.readAsDataURL(file);
          }
          this.droppedFiles.push(res);
        }
      }
    }
  }

  removeFile(file: any) {
    const index = this.droppedFiles.indexOf(file);
    if (index >= 0) {
      this.droppedFiles.splice(index, 1);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropFiles) {
      this.fileOver = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropFiles) {
      this.fileOver = false;
    }
  }

  sendMessage() {
    if (this.droppedFiles.length || String(this.message).trim().length) {
      this.send.emit({ message: this.message, files: this.droppedFiles });
      this.message = '';
      this.droppedFiles = [];
    }
  }

  setStatus(status: NbComponentOrCustomStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.cd.detectChanges();
    }
  }

  getInputStatus(): NbComponentOrCustomStatus {
    if (this.fileOver) {
      return this.getHighlightStatus();
    }

    if (this.inputFocus || this.inputHover) {
      return this.status;
    }

    return 'basic';
  }

  getButtonStatus(): NbComponentOrCustomStatus {
    return this.getHighlightStatus();
  }

  protected getHighlightStatus(): NbComponentOrCustomStatus {
    if (this.status === 'basic' || this.status === 'control') {
      return 'primary';
    }

    return this.status;
  }

  onModelChange(value: any): void {
    this.onInputChange.emit(value);
  }
}
