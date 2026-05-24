// src/app/nebular-textarea/nebular-textarea.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { HtmlSanitizerService } from '../../services/html-sanitizer.service';
import { NbIconModule, NbButtonModule } from '@nebular/theme';



@Component({
  selector: 'app-nebular-textarea',
  templateUrl: './nebular-textarea.component.html',
  styleUrls: ['./nebular-textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NbIconModule, NbButtonModule], // <-- required for the template
})
export class NebularTextareaComponent implements OnInit, OnDestroy {
  @Input() model: string = '';
  @Output() modelChange = new EventEmitter<string>();

  @ViewChild('editor', { static: true }) private editorRef!: ElementRef<HTMLDivElement>;

  toolbar = {
    bold: false,
    italic: false,
    underline: false,
    link: false,
    image: false,
    list: false,
    heading: false,
  };

  private subs = new Subscription();

  constructor(private sanitizer: HtmlSanitizerService) { }

  ngOnInit(): void {
    this.model = this.sanitizer.sanitize(this.model) as string;
    setTimeout(() => this.focusEditor(), 0);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /** --------------------------------------------------------------- */
  get sanitizedModel(): string {
    return this.sanitizer.sanitize(this.model) as string;
  }

  onInput(): void {
    const raw = this.editorRef.nativeElement.innerHTML;
    const safe = this.sanitizer.sanitize(raw);
    this.model = safe as string;
    this.modelChange.emit(safe as string);
    this.updateToolbar();
  }

  /** --------------------------------------------------------------- */
  @HostListener('keydown.ctrl.b')
  @HostListener('keydown.command.b')
  toggleBold(): void {
    this.toggleFormat('b', 'bold', this.toolbar.bold);
  }

  @HostListener('keydown.ctrl+i')
  @HostListener('keydown.command+i')
  toggleItalic(): void {
    this.toggleFormat('i', 'italic', this.toolbar.italic);
  }

  @HostListener('keydown.ctrl+u')
  @HostListener('keydown.command+u')
  toggleUnderline(): void {
    this.toggleFormat('u', 'underline', this.toolbar.underline);
  }

  /** --------------------------------------------------------------- */
  private toggleFormat(tag: 'b' | 'i' | 'u', toolbarKey: 'bold' | 'italic' | 'underline', isActive: boolean): void {
    const sel = this.getSelection();
    if (!sel) return;

    const node = sel.startContainer as Node;
    const parent = node.nodeType === Node.ELEMENT_NODE ? (node as Element).parentElement : null;

    if (parent && parent.tagName.toLowerCase() === tag) {
      this.unwrapTag(parent);
    } else {
      this.wrapTag(parent, tag);
    }

    this.onInput();
    this.toolbar[toolbarKey] = !isActive;
  }

  private wrapTag(parent: Element | null, tag: string): void {
    if (!parent) return;
    const wrapper = document.createElement(tag);
    while (parent.firstChild) wrapper.appendChild(parent.firstChild);
    //@ts-ignore
    parent.parentNode?.replaceWith(wrapper);
  }

  private unwrapTag(parent: Element): void {
    const content = parent.textContent ?? '';
    const replacement = document.createElement(parent.tagName.toLowerCase());
    replacement.innerHTML = content;
    //@ts-ignore
    parent.parentNode?.replaceWith(replacement);
  }

  /** --------------------------------------------------------------- */
  private updateToolbar(): void {
    const sel = this.getSelection();
    if (!sel) {
      this.toolbar = {
        bold: false,
        italic: false,
        underline: false,
        link: false,
        image: false,
        list: false,
        heading: false,
      };
      return;
    }

    const node = sel.startContainer as Node;
    const parent = node.nodeType === Node.ELEMENT_NODE ? (node as Element).parentElement : null;
    const parentTag = parent?.tagName.toLowerCase() ?? '';
    this.toolbar = {
      bold: ['b', 'strong'].includes(parentTag),
      italic: ['i', 'em'].includes(parentTag),
      underline: ['u'].includes(parentTag),
      link: parentTag === 'a',
      image: parentTag === 'img',
      list: ['ul', 'ol', 'li'].includes(parentTag),
      heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(parentTag),
    };
  }

  /** --------------------------------------------------------------- */
  private focusEditor(): void {
    this.editorRef.nativeElement.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      //@ts-ignore
      range.setStart(sel.anchorElement, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  private getSelection(): Range | null {
    const sel = window.getSelection();
    return sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
  }
}
