import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FsIconComponent } from './fs-icon.component';

describe('FsIconComponent', () => {
  let component: FsIconComponent;
  let fixture: ComponentFixture<FsIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FsIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
