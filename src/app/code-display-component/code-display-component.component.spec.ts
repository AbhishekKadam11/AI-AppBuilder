import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeDisplayComponentComponent } from './code-display-component.component';

describe('CodeDisplayComponentComponent', () => {
  let component: CodeDisplayComponentComponent;
  let fixture: ComponentFixture<CodeDisplayComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeDisplayComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeDisplayComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
