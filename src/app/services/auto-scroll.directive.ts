import { Directive, ElementRef, AfterViewChecked, Input } from '@angular/core';

@Directive({
  selector: '[appAutoScroll]',
  standalone: true
})
export class AutoScrollDirective implements AfterViewChecked {
  @Input() appAutoScroll: boolean = true;

  constructor(private el: ElementRef) { }

  ngAfterViewChecked() {
    if (this.appAutoScroll !== false) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    const { nativeElement } = this.el;
    try {
      nativeElement.scrollTo({
        top: nativeElement.scrollHeight,
        behavior: 'auto' // 'smooth' can sometimes fail if many updates happen fast
      });
    } catch (err) {
      nativeElement.scrollTop = nativeElement.scrollHeight;
    }

  }

}