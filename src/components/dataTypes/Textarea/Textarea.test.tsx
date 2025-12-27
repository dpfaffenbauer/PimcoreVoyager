/**
 * Textarea Data Type - Tests
 * Unit tests for Textarea components and utilities
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextareaDisplay } from './TextareaDisplay';
import { TextareaEdit } from './TextareaEdit';
import { validateTextarea } from './Textarea.validator';
import { TextareaTransformer } from './Textarea.transformer';

describe('Textarea DataType', () => {
  describe('Display Component', () => {
    it('should render textarea value', () => {
      const { getByText } = render(
        <TextareaDisplay
          value="Sample text content"
          config={{ label: 'Description' }}
        />
      );
      expect(getByText('Sample text content')).toBeTruthy();
    });

    it('should show placeholder when value is empty', () => {
      const { getByText } = render(
        <TextareaDisplay value="" config={{ label: 'Description' }} />
      );
      expect(getByText('-')).toBeTruthy();
    });

    it('should display label', () => {
      const { getByText } = render(
        <TextareaDisplay value="Test" config={{ label: 'Description' }} />
      );
      expect(getByText('Description')).toBeTruthy();
    });

    it('should show required indicator', () => {
      const { getByText } = render(
        <TextareaDisplay
          value="Test"
          config={{ label: 'Description', required: true }}
        />
      );
      expect(getByText('*')).toBeTruthy();
    });
  });

  describe('Edit Component', () => {
    it('should call onChange on text change', () => {
      const onChange = jest.fn();
      const { getByPlaceholderText } = render(
        <TextareaEdit
          value=""
          onChange={onChange}
          config={{ label: 'Description', placeholder: 'Enter description' }}
        />
      );

      const input = getByPlaceholderText('Enter description');
      fireEvent.changeText(input, 'New text content');

      expect(onChange).toHaveBeenCalledWith('New text content');
    });

    it('should display current value', () => {
      const { getByDisplayValue } = render(
        <TextareaEdit
          value="Existing content"
          onChange={() => {}}
          config={{ label: 'Description' }}
        />
      );

      expect(getByDisplayValue('Existing content')).toBeTruthy();
    });

    it('should show error message', () => {
      const { getByText } = render(
        <TextareaEdit
          value=""
          onChange={() => {}}
          config={{ label: 'Description' }}
          error="This field is required"
        />
      );

      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should show character count when maxLength is set', () => {
      const { getByText } = render(
        <TextareaEdit
          value="Test"
          onChange={() => {}}
          config={{ label: 'Description', maxLength: 100 }}
        />
      );

      expect(getByText('4 / 100')).toBeTruthy();
    });

    it('should be disabled in readonly mode', () => {
      const { getByPlaceholderText } = render(
        <TextareaEdit
          value=""
          onChange={() => {}}
          config={{ label: 'Description', placeholder: 'Enter text' }}
          readonly={true}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('Validator', () => {
    it('should validate required field', () => {
      const result = validateTextarea('', { label: 'Test', required: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dieses Feld ist erforderlich');
    });

    it('should pass validation for valid input', () => {
      const result = validateTextarea('Valid content', {
        label: 'Test',
        required: true,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate min length', () => {
      const result = validateTextarea('ab', { label: 'Test', minLength: 5 });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Mindestens 5 Zeichen erforderlich');
    });

    it('should validate max length', () => {
      const result = validateTextarea('This is a very long text', {
        label: 'Test',
        maxLength: 10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Maximal 10 Zeichen erlaubt');
    });

    it('should allow empty value when not required', () => {
      const result = validateTextarea('', { label: 'Test', required: false });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Transformer', () => {
    it('should transform from API to UI format', () => {
      expect(TextareaTransformer.fromAPI('API text')).toBe('API text');
      expect(TextareaTransformer.fromAPI(null)).toBe('');
      expect(TextareaTransformer.fromAPI(undefined)).toBe('');
    });

    it('should transform from UI to API format', () => {
      expect(TextareaTransformer.toAPI('UI text')).toBe('UI text');
      expect(TextareaTransformer.toAPI('')).toBe(null);
      expect(TextareaTransformer.toAPI(null as unknown as string)).toBe(null);
      expect(TextareaTransformer.toAPI(undefined as unknown as string)).toBe(null);
    });

    it('should handle numeric values', () => {
      expect(TextareaTransformer.fromAPI(123)).toBe('123');
    });
  });
});
