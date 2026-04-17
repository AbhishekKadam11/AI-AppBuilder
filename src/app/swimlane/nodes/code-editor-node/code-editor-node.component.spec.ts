import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeEditorNodeComponent } from './code-editor-node.component';

describe('CodeEditorNodeComponent', () => {
  let component: CodeEditorNodeComponent;
  let fixture: ComponentFixture<CodeEditorNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeEditorNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
