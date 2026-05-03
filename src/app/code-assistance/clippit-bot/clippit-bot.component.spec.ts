import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClippitBotComponent } from './clippit-bot.component';

describe('ClippitBotComponent', () => {
  let component: ClippitBotComponent;
  let fixture: ComponentFixture<ClippitBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClippitBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClippitBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
