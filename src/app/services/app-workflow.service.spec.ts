import { TestBed } from '@angular/core/testing';

import { AppWorkflowService } from './app-workflow.service';

describe('AppWorkflowService', () => {
  let service: AppWorkflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppWorkflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
