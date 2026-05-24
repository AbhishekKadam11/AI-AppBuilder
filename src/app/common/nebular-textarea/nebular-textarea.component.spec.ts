import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NebularTextareaComponent } from './nebular-textarea.component';

describe('NebularTextareaComponent', () => {
  let component: NebularTextareaComponent;
  let fixture: ComponentFixture<NebularTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NebularTextareaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NebularTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
