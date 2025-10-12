import { Directive, ViewContainerRef, Input, ComponentRef, OnChanges, Type } from '@angular/core';

@Directive({
  selector: '[appDynamicContent]',
  standalone: true,
})
export class DynamicContentDirective implements OnChanges {
  @Input() appDynamicContent!: Type<any>;
  @Input() appDynamicContentData: any; // Add an input for the data
  private componentRef: ComponentRef<any> | null = null;

  constructor(private viewContainerRef: ViewContainerRef) { }

  ngOnChanges(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    if (this.appDynamicContent) {
      this.componentRef = this.viewContainerRef.createComponent(this.appDynamicContent);
      // Assign the data to the component's instance
      if (this.appDynamicContentData && this.componentRef.instance) {
        Object.assign(this.componentRef.instance, this.appDynamicContentData);
      }
    }
  }
}