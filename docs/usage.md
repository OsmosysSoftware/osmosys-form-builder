### Osmosys Form Library Documentation

#### Table of Contents

- [Osmosys Form Library Documentation](#osmosys-form-library-documentation)
  - [Table of Contents](#table-of-contents)
- [1. Introduction](#1-introduction)
- [2. Setting Up the Library](#2-setting-up-the-library)
- [3. Creating the Configuration](#3-creating-the-configuration)
- [4. Using in Parent Component](#4-using-in-parent-component)
- [5. Supported Features](#5-supported-features)
- [6. Demo Repository](#6-demo-repository)

### 1. Introduction

The Osmosys Form Library is a dynamic and configurable form generator for Angular applications. It allows you to create complex forms using a simple JSON configuration. This documentation will guide you through setting up the library, creating a configuration, and using the library in a parent component.

### 2. Setting Up the Library

To use the Osmosys Form Library in your Angular application, you need to follow these steps:

1. **Build and Link the Library**:
   Since the package is not deployed yet, you need to build and link it locally.

   ```sh
   ng build osmosys-form --watch
   cd dist/osmosys-form/ && npm link
   ```

2. **Link the Library in Your Angular App**:
   In your Angular application, link the locally built library.

   ```sh
   npm link osmosys-form
   ```

3. **Install Required Dependencies**:
   Ensure you have Bootstrap and other required dependencies installed.

   ```sh
   npm install bootstrap
   ```

   Add the following modules to your Angular application:

   ```typescript
   import { CommonModule } from '@angular/common';
   import { FormsModule, ReactiveFormsModule } from '@angular/forms';
   ```

### 3. Creating the Configuration

The configuration for the form is written in JSON format. The basic structure of the configuration includes the form title, layout, rows, columns, and elements.

Key components of the configuration:

- **Title**: The title of the form, which includes text and optional classes for styling.
- **Layout**: Defines the type of layout (e.g., grid) and the rows within the form.
- **Rows**: Each row can have multiple columns.
- **Columns**: Each column can have multiple elements.
- **Elements**: These are the form fields like input, select, radio, checkbox, textarea, button, etc.

For detailed examples of configuration, refer to the [demo repository](https://github.com/OsmosysSoftware/osmosys-form-builder-demo).

### 4. Using in Parent Component

To use the Osmosys Form Library in your parent component:

1. **Import the OsmosysFormComponent**:
   Import the OsmosysFormComponent into your parent component.

   ```typescript
   import { OsmosysFormComponent } from 'osmosys-form';
   ```

2. **Add OsmosysFormComponent to Parent Component**:
   Use the `<osmosys-form>` selector in your parent component's template.

3. **Pass Configuration and Handle Actions**:
   Pass the configuration JSON to the form component and handle form actions using event bindings.

Example usage in HTML:

```html
<osmosys-form
  *ngIf="showPreview"
  [formJsonData]="previewData"
  (formSubmit)="onFormSubmit($event)"
  (buttonAction)="onButtonAction($event)"
  [formInstance]="setFormInstance($event)"
></osmosys-form>
```

### 5. Supported Features

The Osmosys Form Library supports the following features:

- **Form Inputs**: Text, Email, Password, Date, File, Range, Select, Multiselect, Radio, Checkbox, Textarea, Color.
- **Validations**: Supports reactive form validations like required, minlength, maxlength, pattern, etc.
- **Custom Styling**: You can add custom classes and styles to elements.
- **Bootstrap Integration**: Uses Bootstrap classes for styling by default.
- **Dynamic Configuration**: Easily configurable via JSON.
- **Event Handling**: Emits events for form submission, button actions, and provides form instance.

### 6. Demo Repository

For detailed examples, code snippets, and configurations, please refer to the [Osmosys Form Builder Demo Repository](https://github.com/OsmosysSoftware/osmosys-form-builder-demo). Here, you will find comprehensive examples and usage instructions to help you get started with the Osmosys Form Library in your Angular application.
