import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneDashboardComponent } from './swimlane-dashboard.component';

describe('SwimlaneDashboardComponent', () => {
  let component: SwimlaneDashboardComponent;
  let fixture: ComponentFixture<SwimlaneDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwimlaneDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwimlaneDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
