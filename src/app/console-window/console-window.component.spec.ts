import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleWindowComponent } from './console-window.component';

describe('ConsoleWindowComponent', () => {
  let component: ConsoleWindowComponent;
  let fixture: ComponentFixture<ConsoleWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleWindowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
