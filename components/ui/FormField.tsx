import React from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectOption } from './Select';
import { ValidationRule } from '@/lib/validation';

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  touched?: boolean;
  rules?: ValidationRule[];
  onValidate?: (error?: string) => void;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, touched, rules, onValidate, ...props }, ref) => {
    const showError = touched && error;

    return (
      <Input
        ref={ref}
        error={showError ? error : undefined}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  touched?: boolean;
  rules?: ValidationRule[];
  onValidate?: (error?: string) => void;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ error, touched, rules, onValidate, ...props }, ref) => {
  const showError = touched && error;

  return (
    <Textarea
      ref={ref}
      error={showError ? error : undefined}
      {...props}
    />
  );
});

FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  touched?: boolean;
  options: SelectOption[];
  placeholder?: string;
  rules?: ValidationRule[];
  onValidate?: (error?: string) => void;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, touched, rules, onValidate, ...props }, ref) => {
    const showError = touched && error;

    return (
      <Select
        ref={ref}
        error={showError ? error : undefined}
        {...props}
      />
    );
  }
);

FormSelect.displayName = 'FormSelect';
