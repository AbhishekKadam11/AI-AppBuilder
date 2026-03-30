import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentNodeComponent } from './component-node.component';

describe('ComponentNodeComponent', () => {
  let component: ComponentNodeComponent;
  let fixture: ComponentFixture<ComponentNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
