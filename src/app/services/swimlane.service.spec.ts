import { TestBed } from '@angular/core/testing';

import { SwimlaneService } from './swimlane.service';

describe('SwimlaneService', () => {
  let service: SwimlaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwimlaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
