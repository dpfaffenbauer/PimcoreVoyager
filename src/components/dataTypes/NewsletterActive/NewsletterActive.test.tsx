/**
 * Newsletter Active Data Type Tests
 * Tests for Newsletter Active field components, validator, and transformer
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NewsletterActiveDisplay } from './NewsletterActiveDisplay';
import { NewsletterActiveEdit } from './NewsletterActiveEdit';
import { validateNewsletterActive } from './NewsletterActive.validator';
import { NewsletterActiveTransformer } from './NewsletterActive.transformer';

describe('NewsletterActive DataType', () => {
  describe('NewsletterActiveDisplay', () => {
    it('should display active status correctly', () => {
      const { getByText } = render(
        <NewsletterActiveDisplay 
          value={true} 
          config={{ label: 'Newsletter Active' }} 
        />
      );
      expect(getByText('Newsletter Active')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
    });

    it('should display inactive status correctly', () => {
      const { getByText } = render(
        <NewsletterActiveDisplay 
          value={false} 
          config={{ label: 'Newsletter Active' }} 
        />
      );
      expect(getByText('Newsletter Active')).toBeTruthy();
      expect(getByText('Inactive')).toBeTruthy();
    });

    it('should treat undefined as inactive', () => {
      const { getByText } = render(
        <NewsletterActiveDisplay 
          value={undefined as any} 
          config={{ label: 'Newsletter Active' }} 
        />
      );
      expect(getByText('Inactive')).toBeTruthy();
    });
  });

  describe('NewsletterActiveEdit', () => {
    it('should render with initial value', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <NewsletterActiveEdit
          value={true}
          onChange={onChange}
          config={{ label: 'Newsletter Active' }}
        />
      );
      
      expect(getByText('Newsletter Active')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
    });

    it('should call onChange when toggled', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <NewsletterActiveEdit
          value={false}
          onChange={onChange}
          config={{ label: 'Newsletter Active' }}
        />
      );
      
      const switchElement = getByRole('switch');
      fireEvent(switchElement, 'valueChange', true);
      
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should display error message', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <NewsletterActiveEdit
          value={false}
          onChange={onChange}
          config={{ label: 'Newsletter Active', mandatory: true }}
          error="This field is required"
        />
      );
      
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should show mandatory indicator', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <NewsletterActiveEdit
          value={false}
          onChange={onChange}
          config={{ label: 'Newsletter Active', mandatory: true }}
        />
      );
      
      // Check for asterisk in the label
      expect(getByText('Newsletter Active')).toBeTruthy();
      expect(getByText('*', { exact: false })).toBeTruthy();
    });

    it('should be disabled in readonly mode', () => {
      const onChange = jest.fn();
      const { getByText, getByRole } = render(
        <NewsletterActiveEdit
          value={false}
          onChange={onChange}
          config={{ label: 'Newsletter Active' }}
          readonly={true}
        />
      );
      
      expect(getByText('Read-only')).toBeTruthy();
      
      const switchElement = getByRole('switch');
      expect(switchElement.props.disabled).toBe(true);
    });

    it('should not call onChange in readonly mode', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <NewsletterActiveEdit
          value={false}
          onChange={onChange}
          config={{ label: 'Newsletter Active' }}
          readonly={true}
        />
      );
      
      const switchElement = getByRole('switch');
      fireEvent(switchElement, 'valueChange', true);
      
      // onChange should not be called due to readonly
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should display help text when not readonly', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <NewsletterActiveEdit
          value={false}
          onChange={onChange}
          config={{ label: 'Newsletter Active' }}
        />
      );
      
      expect(getByText('Toggle to activate newsletter subscription')).toBeTruthy();
    });
  });

  describe('validateNewsletterActive', () => {
    it('should pass validation for non-mandatory field with no value', () => {
      const result = validateNewsletterActive(undefined, { label: 'Test' });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for mandatory field with false value', () => {
      const result = validateNewsletterActive(false, { 
        label: 'Test', 
        mandatory: true 
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for mandatory field with true value', () => {
      const result = validateNewsletterActive(true, { 
        label: 'Test', 
        mandatory: true 
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for mandatory field with null value', () => {
      const result = validateNewsletterActive(null, { 
        label: 'Test', 
        mandatory: true 
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should fail validation for mandatory field with undefined value', () => {
      const result = validateNewsletterActive(undefined, { 
        label: 'Test', 
        mandatory: true 
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });
  });

  describe('NewsletterActiveTransformer', () => {
    describe('fromAPI', () => {
      it('should transform boolean true correctly', () => {
        expect(NewsletterActiveTransformer.fromAPI(true)).toBe(true);
      });

      it('should transform boolean false correctly', () => {
        expect(NewsletterActiveTransformer.fromAPI(false)).toBe(false);
      });

      it('should transform null to false', () => {
        expect(NewsletterActiveTransformer.fromAPI(null)).toBe(false);
      });

      it('should transform undefined to false', () => {
        expect(NewsletterActiveTransformer.fromAPI(undefined)).toBe(false);
      });

      it('should transform number 1 to true', () => {
        expect(NewsletterActiveTransformer.fromAPI(1)).toBe(true);
      });

      it('should transform number 0 to false', () => {
        expect(NewsletterActiveTransformer.fromAPI(0)).toBe(false);
      });

      it('should transform string "true" to true', () => {
        expect(NewsletterActiveTransformer.fromAPI('true')).toBe(true);
      });

      it('should transform string "TRUE" to true', () => {
        expect(NewsletterActiveTransformer.fromAPI('TRUE')).toBe(true);
      });

      it('should transform string "1" to true', () => {
        expect(NewsletterActiveTransformer.fromAPI('1')).toBe(true);
      });

      it('should transform string "yes" to true', () => {
        expect(NewsletterActiveTransformer.fromAPI('yes')).toBe(true);
      });

      it('should transform string "active" to true', () => {
        expect(NewsletterActiveTransformer.fromAPI('active')).toBe(true);
      });

      it('should transform string "false" to false', () => {
        expect(NewsletterActiveTransformer.fromAPI('false')).toBe(false);
      });

      it('should transform string "0" to false', () => {
        expect(NewsletterActiveTransformer.fromAPI('0')).toBe(false);
      });

      it('should transform string "no" to false', () => {
        expect(NewsletterActiveTransformer.fromAPI('no')).toBe(false);
      });

      it('should transform unknown types to false', () => {
        expect(NewsletterActiveTransformer.fromAPI({})).toBe(false);
        expect(NewsletterActiveTransformer.fromAPI([])).toBe(false);
        expect(NewsletterActiveTransformer.fromAPI(() => {})).toBe(false);
      });
    });

    describe('toAPI', () => {
      it('should transform true to boolean true', () => {
        expect(NewsletterActiveTransformer.toAPI(true)).toBe(true);
      });

      it('should transform false to boolean false', () => {
        expect(NewsletterActiveTransformer.toAPI(false)).toBe(false);
      });

      it('should ensure boolean type for truthy values', () => {
        expect(NewsletterActiveTransformer.toAPI(1 as any)).toBe(false);
        expect(NewsletterActiveTransformer.toAPI('true' as any)).toBe(false);
      });
    });
  });
});
