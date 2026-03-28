import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingNodeComponent } from './routing-node.component';

describe('RoutingNodeComponent', () => {
  let component: RoutingNodeComponent;
  let fixture: ComponentFixture<RoutingNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutingNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
