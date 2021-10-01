import { TestBed } from '@angular/core/testing';

import { DynamicFormErrorHandlerService } from './dynamic-form-error-handler.service';

describe('DynamicFormErrorHandlerService', () => {
  let service: DynamicFormErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicFormErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
