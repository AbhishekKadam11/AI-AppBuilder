import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserNodeComponent } from './browser-node.component';

describe('BrowserNodeComponent', () => {
  let component: BrowserNodeComponent;
  let fixture: ComponentFixture<BrowserNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowserNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
