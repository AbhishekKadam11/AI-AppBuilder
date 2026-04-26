import { TestBed } from '@angular/core/testing';

import { JiraGraberService } from './jira-graber.service';

describe('JiraGraberService', () => {
  let service: JiraGraberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JiraGraberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
