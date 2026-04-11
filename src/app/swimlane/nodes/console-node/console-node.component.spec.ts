import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleNodeComponent } from './console-node.component';

describe('ConsoleNodeComponent', () => {
  let component: ConsoleNodeComponent;
  let fixture: ComponentFixture<ConsoleNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
