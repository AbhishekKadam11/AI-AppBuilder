import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleNodeComponent } from './simple-node.component';

describe('SimpleNodeComponent', () => {
  let component: SimpleNodeComponent;
  let fixture: ComponentFixture<SimpleNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
