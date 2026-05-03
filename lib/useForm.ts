/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from 'react';
import { ValidationRule, validateField } from './validation';

type FormValues = Record<string, any>;

interface UseFormOptions {
  onSubmit?: (values: FormValues) => void | Promise<void>;
  initialValues?: FormValues;
}

interface UseFormReturn {
  values: FormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error?: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validateField: (field: string, rules: ValidationRule[]) => string | undefined;
  validateForm: (fields: Record<string, ValidationRule[]>) => Promise<Record<string, string | undefined>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
}

export function useForm(options: UseFormOptions = {}): UseFormReturn {
  const { onSubmit, initialValues = {} } = options;

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((field: string, error?: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const validateFieldLocal = useCallback((field: string, rules: ValidationRule[]): string | undefined => {
    const error = validateField(values[field], rules);
    setFieldError(field, error);
    return error;
  }, [values, setFieldError]);

  const validateFormLocal = useCallback(
    async (fields: Record<string, ValidationRule[]>): Promise<Record<string, string | undefined>> => {
      setIsValidating(true);
      const newErrors: Record<string, string | undefined> = {};

      Object.entries(fields).forEach(([field, rules]) => {
        const error = validateField(values[field], rules);
        newErrors[field] = error;
      });

      setErrors(newErrors);
      setIsValidating(false);
      return newErrors;
    },
    [values]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const { name } = target;
      const newValue = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
      setFieldValue(name, newValue);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name, true);
    },
    [setFieldTouched]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await onSubmit?.(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    isValidating,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    validateField: validateFieldLocal,
    validateForm: validateFormLocal,
    handleSubmit,
    reset,
  };
}
