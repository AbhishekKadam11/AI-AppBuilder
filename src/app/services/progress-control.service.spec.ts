import { TestBed } from '@angular/core/testing';

import { ProgressControlService } from './progress-control.service';

describe('ProgressControlService', () => {
  let service: ProgressControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
