import { TestBed } from '@angular/core/testing';

import { OsmosysFormService } from './osmosys-form.service';

describe('OsmosysFormService', () => {
  let service: OsmosysFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsmosysFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
