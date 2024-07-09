import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsmosysFormComponent } from './osmosys-form.component';

describe('OsmosysFormComponent', () => {
  let component: OsmosysFormComponent;
  let fixture: ComponentFixture<OsmosysFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsmosysFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OsmosysFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
