/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'osmosys-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './osmosys-form.component.html',
  styles: '',
})
export class OsmosysFormComponent implements OnInit, OnChanges {
  @Input() formJsonData: any;

  @Input() modelData: any;

  @Input() eventHandlers: { [key: string]: (event: Event) => void } = {};

  @Input() useTranslation = false;

  @Input() overrides: { [key: string]: any } = {};

  @Input() translateService!: TranslateService;

  @Output() formSubmit = new EventEmitter<any>();

  @Output() formInstance = new EventEmitter<FormGroup>();

  @Output() buttonAction = new EventEmitter<{ action: string; form: FormGroup }>();

  form: FormGroup;

  formConfig: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.formConfig = this.formJsonData || {};

    if (this.formConfig.layout?.rows) {
      this.createForm(this.formConfig.layout.rows);
    }

    this.formInstance.emit(this.form);
  }

  ngOnChanges(changes: SimpleChanges) {
    // eslint-disable-next-line dot-notation
    if (changes['formJsonData']) {
      this.formConfig = this.formJsonData || {};
      this.createForm(this.formConfig.layout.rows);
      this.cdr.detectChanges();
      this.formInstance.emit(this.form);
    }

    // eslint-disable-next-line dot-notation
    if (changes['modelData'] && !changes['formJsonData']) {
      this.updateFormValues(this.modelData);
    }
  }

  createForm(rows: any) {
    const group: any = {};
    rows.forEach((row: any) => {
      row.columns.forEach((column: any) => {
        column.elements.forEach((element: any) => {
          if (
            element.type === 'input' ||
            element.type === 'select' ||
            element.type === 'radio' ||
            element.type === 'checkbox' ||
            element.type === 'range' ||
            element.type === 'date' ||
            element.type === 'multiselect' ||
            element.type === 'textarea' ||
            element.type === 'file' ||
            element.type === 'color'
          ) {
            const validations: ValidatorFn[] = [];

            if (element.validations) {
              element.validations.forEach((validation: any) => {
                if (validation.validator === 'required') {
                  validations.push(Validators.required);
                } else if (validation.validator === 'minlength') {
                  validations.push(Validators.minLength(validation.value));
                } else if (validation.validator === 'maxlength') {
                  validations.push(Validators.maxLength(validation.value));
                } else if (validation.validator === 'pattern') {
                  validations.push(Validators.pattern(validation.value));
                } else if (validation.validator === 'requiredTrue') {
                  validations.push(Validators.requiredTrue);
                } else if (validation.validator === 'max') {
                  validations.push(Validators.max(validation.value));
                } else if (validation.validator === 'min') {
                  validations.push(Validators.min(validation.value));
                }
              });
            }

            group[element.name] = this.fb.control(
              { value: element.value || '', disabled: element.disabled || false },
              validations,
            );
            this.applyOverrides(element);
          }
        });
      });
    });
    this.form = this.fb.group(group);
    this.updateFormValues(this.modelData);
  }

  applyOverrides(element: any) {
    if (element.overrides) {
      Object.keys(element.overrides).forEach((key) => {
        const overrideFunction = this.overrides[element.overrides[key]];
        if (overrideFunction) {
          if (key === 'options') {
            console.log(`Applying override for ${element.name}: ${key}`);
            overrideFunction().subscribe((data: any) => {
              console.log(`Fetched options for ${element.name}:`, data);
              element[key] = data;
            });
          } else if (key === 'placeholder') {
            element[key] = overrideFunction();
          } else {
            element[key] = overrideFunction();
          }
        }
      });
    }
  }

  updateFormValues(data: any) {
    if (data) {
      this.form.patchValue(data);
    }
  }

  handleButtonClick(action: string) {
    if (action === 'reset') {
      this.onReset();
    } else {
      this.buttonAction.emit({ action, form: this.form });
    }
  }

  handleEvent(eventName: string, event: Event): void {
    console.log(`Event triggered: ${eventName}`);
    const method = this.eventHandlers[eventName];
    if (method) {
      method(event);
    } else {
      console.warn(`No handler found for event: ${eventName}`, event);
    }

    // Handle dependent dropdowns
    const target = event.target as HTMLSelectElement;
    const elementName = target.name;
    const selectedValue = target.value;
    console.log(`Element name: ${elementName}, Selected value: ${selectedValue}`);

    // Find the element with the dependent dropdown
    const dependentElement = this.findDependentElement(elementName);
    if (dependentElement) {
      console.log(`Found dependent element: ${dependentElement.name}`);
      const overrideFunction = this.overrides[dependentElement.overrides.options];
      if (overrideFunction) {
        overrideFunction(selectedValue).subscribe((data: any) => {
          console.log(`Fetched options for ${dependentElement.name}:`, data);
          dependentElement.options = data;
          this.cdr.detectChanges();
        });
      }
    }
  }

  findDependentElement(elementName: string): any {
    for (const row of this.formConfig.layout.rows) {
      for (const column of row.columns) {
        for (const element of column.elements) {
          if (element.dependentOn === elementName) {
            return element;
          }
        }
      }
    }
    return null;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);

      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  onReset() {
    this.form.reset();
  }

  translate(key: string): string {
    if (this.useTranslation && this.translateService) {
      if (key) {
        return this.translateService.instant(key) || key;
      }

      // eslint-disable-next-line no-console
      console.warn(`Translation key is empty: ${key}`);
      return ''; // Return an empty string if the key is invalid
    }

    return key; // Return the key as fallback if translation is not used
  }
}
