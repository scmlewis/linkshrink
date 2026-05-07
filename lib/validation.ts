/* eslint-disable @typescript-eslint/no-explicit-any */

// Form field value and error states
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Validation rule
export interface ValidationRule {
  validate: (value: any) => boolean | string;
  message: string;
}

// Common validation rules
export const validators = {
  required: (fieldName: string = 'This field'): ValidationRule => ({
    validate: (value) => !!value?.toString().trim(),
    message: `${fieldName} is required`,
  }),

  email: (): ValidationRule => ({
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },
    message: 'Please enter a valid email address',
  }),

  minLength: (length: number): ValidationRule => ({
    validate: (value) => !value || value.toString().length >= length,
    message: `Must be at least ${length} characters`,
  }),

  maxLength: (length: number): ValidationRule => ({
    validate: (value) => !value || value.toString().length <= length,
    message: `Must be no more than ${length} characters`,
  }),

  url: (): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Please enter a valid URL',
  }),

  password: (): ValidationRule => ({
    validate: (value) => {
      if (!value) return false;
      return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
    },
    message: 'Password must be at least 8 characters with uppercase and numbers',
  }),

  match: (fieldValue: string, fieldName: string = 'Field'): ValidationRule => ({
    validate: (value) => value === fieldValue,
    message: `${fieldName} does not match`,
  }),

  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value) => !value || pattern.test(value),
    message,
  }),

  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    validate: validator,
    message,
  }),
};

// Validation function
export function validateField(
  value: any,
  rules: ValidationRule[]
): string | undefined {
  for (const rule of rules) {
    const result = rule.validate(value);
    if (result !== true) {
      return typeof result === 'string' ? result : rule.message;
    }
  }
  return undefined;
}
