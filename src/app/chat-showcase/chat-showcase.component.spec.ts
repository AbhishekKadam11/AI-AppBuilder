import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatShowcaseComponent } from './chat-showcase.component';

describe('ChatShowcaseComponent', () => {
  let component: ChatShowcaseComponent;
  let fixture: ComponentFixture<ChatShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
