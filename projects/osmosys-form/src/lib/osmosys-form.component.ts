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
          }
        });
      });
    });
    this.form = this.fb.group(group);
    this.updateFormValues(this.modelData);
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
    // Retrieve the user's event handler function from the passed eventHandlers object
    const method = this.eventHandlers[eventName];

    // Check if the method exists and call it if it does
    if (method) {
      method(event);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`No handler found for event: ${eventName}`);
    }
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
    const defaultValues = this.formConfig.layout.rows.reduce((acc: any, row: any) => {
      row.columns.forEach((column: any) => {
        column.elements.forEach((element: any) => {
          acc[element.name] = element.value;
        });
      });
      return acc;
    }, {});

    this.form.reset(defaultValues);
  }
}
