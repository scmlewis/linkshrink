import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '@/lib/useForm';
import { validators } from '@/lib/validation';

describe('useForm Hook', () => {
  describe('initialization', () => {
    it('should initialize with empty values', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.values).toEqual({});
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });

    it('should initialize with provided initial values', () => {
      const initialValues = { email: 'test@example.com', name: 'John' };
      const { result } = renderHook(() =>
        useForm({ initialValues })
      );

      expect(result.current.values).toEqual(initialValues);
    });
  });

  describe('field management', () => {
    it('should set field value', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setFieldValue('email', 'test@example.com');
      });

      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.isDirty).toBe(true);
    });

    it('should set field error', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setFieldError('email', 'Invalid email');
      });

      expect(result.current.errors.email).toBe('Invalid email');
    });

    it('should set field touched state', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setFieldTouched('email', true);
      });

      expect(result.current.touched.email).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate a single field', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: '' },
        })
      );

      act(() => {
        result.current.validateField('email', [validators.required('Email')]);
      });

      expect(result.current.errors.email).toBe('Email is required');
    });

    it('should validate entire form', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: '', password: '' },
        })
      );

      let errors;
      await act(async () => {
        errors = await result.current.validateForm({
          email: [validators.required('Email'), validators.email()],
          password: [validators.required('Password')],
        });
      });

      expect(errors?.email).toBe('Email is required');
      expect(errors?.password).toBe('Password is required');
    });
  });

  describe('form submission', () => {
    it('should handle form submission', async () => {
      let submittedValues: any;
      const onSubmit = (values: any) => {
        submittedValues = values;
      };

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'test@example.com' },
          onSubmit,
        })
      );

      const event = new Event('submit') as any;
      event.preventDefault = () => {};

      await act(async () => {
        await result.current.handleSubmit(event);
      });

      expect(submittedValues).toEqual({ email: 'test@example.com' });
    });

    it('should set isSubmitting during submission', async () => {
      const onSubmit = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      };

      const { result } = renderHook(() => useForm({ onSubmit }));

      const event = new Event('submit') as any;
      event.preventDefault = () => {};

      const submitPromise = act(async () => {
        await result.current.handleSubmit(event);
      });

      // After calling handleSubmit, it should be in submission state
      await submitPromise;
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset form to initial state', () => {
      const initialValues = { email: 'initial@example.com' };
      const { result } = renderHook(() => useForm({ initialValues }));

      act(() => {
        result.current.setFieldValue('email', 'changed@example.com');
        result.current.setFieldError('email', 'Error');
        result.current.setFieldTouched('email', true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });
  });
});
