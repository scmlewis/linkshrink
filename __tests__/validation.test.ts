import { describe, it, expect } from 'vitest';
import { validators, validateField, ValidationRule } from '@/lib/validation';

describe('Validation Rules', () => {
  describe('required validator', () => {
    it('should validate non-empty strings', () => {
      const rule = validators.required('Email');
      expect(rule.validate('test@example.com')).toBe(true);
      expect(rule.validate('   ')).toBe(false);
      expect(rule.validate('')).toBe(false);
      expect(rule.validate(null)).toBe(false);
    });
  });

  describe('email validator', () => {
    it('should validate email format', () => {
      const rule = validators.email();
      expect(rule.validate('test@example.com')).toBe(true);
      expect(rule.validate('user+tag@domain.co.uk')).toBe(true);
      expect(rule.validate('invalid@')).toBe(false);
      expect(rule.validate('notanemail')).toBe(false);
      expect(rule.validate('')).toBe(true); // Empty is allowed
    });
  });

  describe('minLength validator', () => {
    it('should validate minimum length', () => {
      const rule = validators.minLength(5);
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('hello world')).toBe(true);
      expect(rule.validate('hi')).toBe(false);
      expect(rule.validate('')).toBe(true); // Empty is allowed
    });
  });

  describe('maxLength validator', () => {
    it('should validate maximum length', () => {
      const rule = validators.maxLength(10);
      expect(rule.validate('hello')).toBe(true);
      expect(rule.validate('hello world')).toBe(false);
      expect(rule.validate('1234567890')).toBe(true);
      expect(rule.validate('')).toBe(true);
    });
  });

  describe('url validator', () => {
    it('should validate URL format', () => {
      const rule = validators.url();
      expect(rule.validate('https://example.com')).toBe(true);
      expect(rule.validate('http://localhost:3000')).toBe(true);
      expect(rule.validate('not-a-url')).toBe(false);
      expect(rule.validate('')).toBe(true); // Empty is allowed
    });
  });

  describe('password validator', () => {
    it('should validate password requirements', () => {
      const rule = validators.password();
      expect(rule.validate('Password123')).toBe(true);
      expect(rule.validate('short')).toBe(false); // Too short
      expect(rule.validate('nouppercase123')).toBe(false); // No uppercase
      expect(rule.validate('NoNumbers')).toBe(false); // No numbers
    });
  });

  describe('pattern validator', () => {
    it('should validate against regex pattern', () => {
      const rule = validators.pattern(/^[A-Z]/, 'Must start with uppercase');
      expect(rule.validate('Hello')).toBe(true);
      expect(rule.validate('hello')).toBe(false);
      expect(rule.validate('')).toBe(true); // Empty is allowed
    });
  });

  describe('custom validator', () => {
    it('should use custom validation function', () => {
      const rule = validators.custom(
        (value) => value && value > 5,
        'Must be greater than 5'
      );
      expect(rule.validate(10)).toBe(true);
      expect(rule.validate(3)).toBe(false);
    });
  });
});

describe('validateField', () => {
  it('should return first error from multiple rules', () => {
    const rules: ValidationRule[] = [
      validators.required('Email'),
      validators.email(),
    ];

    expect(validateField('', rules)).toBe('Email is required');
    expect(validateField('invalid', rules)).toBe('Please enter a valid email address');
    expect(validateField('valid@example.com', rules)).toBeUndefined();
  });

  it('should handle multiple validators', () => {
    const rules: ValidationRule[] = [
      validators.required('Password'),
      validators.minLength(8),
      validators.password(),
    ];

    expect(validateField('', rules)).toBe('Password is required');
    expect(validateField('short', rules)).toBe('Must be at least 8 characters');
    expect(validateField('nouppercase', rules)).toContain('at least 8');
  });
});
