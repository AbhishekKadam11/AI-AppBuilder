import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTreeNodeComponent } from './file-tree-node.component';

describe('FileTreeNodeComponent', () => {
  let component: FileTreeNodeComponent;
  let fixture: ComponentFixture<FileTreeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTreeNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileTreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
