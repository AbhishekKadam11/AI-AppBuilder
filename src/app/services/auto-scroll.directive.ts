import { Directive, ElementRef, AfterViewChecked, Input } from '@angular/core';

@Directive({
  selector: '[appAutoScroll]',
  standalone: true
})
export class AutoScrollDirective implements AfterViewChecked {
  @Input() appAutoScroll: boolean = true; 

  constructor(private el: ElementRef) {}

  ngAfterViewChecked() {
    if (this.appAutoScroll !== false) {
        this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    const element: HTMLElement = this.el.nativeElement;
    element.scrollTop = element.scrollHeight;
  }
}