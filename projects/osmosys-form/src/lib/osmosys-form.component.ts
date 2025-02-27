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

const logger = console;

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
        // For dependent elements, skip applying override during initialization
        if (key === 'options' && element.dependentOn) {
          return;
        }

        const overrideFunction = this.overrides[element.overrides[key]];

        if (overrideFunction) {
          if (key === 'options') {
            overrideFunction().subscribe((data: any) => {
              Object.assign(element, { [key]: data });
            });
          } else if (key === 'placeholder') {
            // eslint-disable-next-line no-param-reassign
            element[key] = overrideFunction();
          } else {
            // eslint-disable-next-line no-param-reassign
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
    const method = this.eventHandlers[eventName];

    if (method) {
      method(event);
    } else {
      logger.warn(`No handler found for event: ${eventName}`, event);
    }

    // Refactored event handling using switch-case on event.type
    switch (event.type) {
      case 'change':
        this.processChangeEvent(event);
        break;
      case 'focus':
        this.processFocusEvent(event);
        break;
      case 'blur':
        this.processBlurEvent(event);
        break;
      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }
  }

  processChangeEvent(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const elementName = target.getAttribute('id') || target.getAttribute('name') || '';
    const selectedValue = target.value;
    // Locate dependent dropdown
    const dependentElement = this.findDependentElement(elementName);

    if (dependentElement) {
      const overrideKey = dependentElement.overrides?.options;

      if (overrideKey) {
        const overrideFunction = this.overrides[overrideKey];

        if (overrideFunction) {
          overrideFunction(selectedValue).subscribe(
            (data: any) => {
              dependentElement.options = data;
              this.cdr.detectChanges();
            },
            (error: Error) => {
              logger.error(`Error fetching options for ${dependentElement.name}:`, error);
            },
          );
        } else {
          logger.warn(
            `No override function found for key '${overrideKey}' on dependent element: ${dependentElement.name}`,
          );
        }
      } else {
        logger.warn(
          `Dependent element '${dependentElement.name}' does not have an override configuration for options. Sending parameters as undefined.`,
        );
      }
    } else {
      logger.warn(`No dependent element found for element: ${elementName}`);
    }
  }

  processFocusEvent(event: Event): void {
    const target = event.target as HTMLInputElement;
    const elementName = target.getAttribute('id') || target.getAttribute('name') || '';
    // Failsafe: if an override function is provided for focus event on this element, call it
    const element = this.findElementByName(elementName);

    if (element && element.overrides && element.overrides.focus) {
      const focusOverride = this.overrides[element.overrides.focus];

      if (focusOverride) {
        try {
          const result = focusOverride();

          if (result && typeof result.subscribe === 'function') {
            result.subscribe(
              () => {
                // Optionally update element properties based on data
                this.cdr.detectChanges();
              },
              (error: Error) => {
                logger.error(`Error in focus override for ${elementName}:`, error);
              },
            );
          } else {
            logger.warn(`Focus override for ${elementName} did not return an observable.`);
          }
        } catch (err) {
          logger.error(`Exception while invoking focus override for ${elementName}:`, err);
        }
      }
    }
  }

  processBlurEvent(event: Event): void {
    const target = event.target as HTMLInputElement;
    const elementName = target.getAttribute('id') || target.getAttribute('name') || '';
    // Failsafe: if an override function is provided for blur event on this element, call it
    const element = this.findElementByName(elementName);

    if (element && element.overrides && element.overrides.blur) {
      const blurOverride = this.overrides[element.overrides.blur];

      if (blurOverride) {
        try {
          const result = blurOverride();

          if (result && typeof result.subscribe === 'function') {
            result.subscribe(
              () => {
                // Optionally update element properties based on data
                this.cdr.detectChanges();
              },
              (error: Error) => {
                logger.error(`Error in blur override for ${elementName}:`, error);
              },
            );
          } else {
            logger.warn(`Blur override for ${elementName} did not return an observable.`);
          }
        } catch (err) {
          logger.error(`Exception while invoking blur override for ${elementName}:`, err);
        }
      }
    }
  }

  // Updated helper function to locate an element by its name in the form configuration using array iteration methods
  findElementByName(elementName: string): any {
    return (
      this.formConfig.layout.rows
        .flatMap((row: any) => row.columns)
        .flatMap((column: any) => column.elements)
        .find((element: any) => element.name === elementName) || null
    );
  }

  // Updated helper function to locate a dependent element by its dependentOn property using array iteration methods
  findDependentElement(elementName: string): any {
    return (
      this.formConfig.layout.rows
        .flatMap((row: any) => row.columns)
        .flatMap((column: any) => column.elements)
        .find((element: any) => element.dependentOn === elementName) || null
    );
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
      logger.warn(`Translation key is empty: ${key}`);
      return ''; // Return an empty string if the key is invalid
    }

    return key; // Return the key as fallback if translation is not used
  }
}
