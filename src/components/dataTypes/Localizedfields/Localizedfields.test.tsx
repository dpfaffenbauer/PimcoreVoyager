/**
 * Tests for Localizedfields data type
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LocalizedfieldsDisplay } from './LocalizedfieldsDisplay';
import { LocalizedfieldsEdit } from './LocalizedfieldsEdit';
import { validateLocalizedfields } from './Localizedfields.validator';
import { LocalizedfieldsTransformer } from './Localizedfields.transformer';
import { LocalizedValue, LocalizedfieldsConfig } from './Localizedfields.types';

describe('Localizedfields DataType', () => {
  const mockConfig: LocalizedfieldsConfig = {
    name: 'content',
    title: 'Content',
    type: 'localizedfields',
    fieldDefinitions: [
      {
        name: 'title',
        title: 'Title',
        fieldtype: 'input',
        mandatory: true,
      },
      {
        name: 'description',
        title: 'Description',
        fieldtype: 'textarea',
      },
    ],
  };

  const mockValue: LocalizedValue = {
    de: {
      title: 'Deutscher Titel',
      description: 'Deutsche Beschreibung',
    },
    en: {
      title: 'English Title',
      description: 'English Description',
    },
  };

  describe('LocalizedfieldsDisplay', () => {
    it('should render with localized values', () => {
      const { getByText } = render(
        <LocalizedfieldsDisplay value={mockValue} config={mockConfig} />
      );
      
      expect(getByText('Content')).toBeTruthy();
      expect(getByText('DE')).toBeTruthy();
      expect(getByText('EN')).toBeTruthy();
    });

    it('should show empty state when no values', () => {
      const { getByText } = render(
        <LocalizedfieldsDisplay value={{}} config={mockConfig} />
      );
      
      expect(getByText('Keine lokalisierten Daten vorhanden')).toBeTruthy();
    });

    it('should switch between languages', () => {
      const { getByText } = render(
        <LocalizedfieldsDisplay value={mockValue} config={mockConfig} />
      );
      
      // Default shows first language (DE)
      expect(getByText('Deutscher Titel')).toBeTruthy();
      
      // Switch to EN
      fireEvent.press(getByText('EN'));
      expect(getByText('English Title')).toBeTruthy();
    });

    it('should display field labels from config', () => {
      const { getByText } = render(
        <LocalizedfieldsDisplay value={mockValue} config={mockConfig} />
      );
      
      expect(getByText('Title', { exact: false })).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });
  });

  describe('LocalizedfieldsEdit', () => {
    it('should render edit form with language tabs', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <LocalizedfieldsEdit
          value={mockValue}
          onChange={onChange}
          config={mockConfig}
        />
      );
      
      expect(getByText('Content')).toBeTruthy();
      expect(getByText('DE')).toBeTruthy();
      expect(getByText('EN')).toBeTruthy();
    });

    it('should call onChange when field value changes', () => {
      const onChange = jest.fn();
      const { getByPlaceholderText } = render(
        <LocalizedfieldsEdit
          value={mockValue}
          onChange={onChange}
          config={mockConfig}
        />
      );
      
      const input = getByPlaceholderText('Title eingeben...');
      fireEvent.changeText(input, 'Neuer Titel');
      
      expect(onChange).toHaveBeenCalled();
      const newValue = onChange.mock.calls[0][0];
      expect(newValue.de.title).toBe('Neuer Titel');
    });

    it('should show mandatory indicator', () => {
      const onChange = jest.fn();
      const { getAllByText } = render(
        <LocalizedfieldsEdit
          value={mockValue}
          onChange={onChange}
          config={mockConfig}
        />
      );
      
      // Should show asterisk for mandatory field
      const mandatoryIndicators = getAllByText('*', { exact: false });
      expect(mandatoryIndicators.length).toBeGreaterThan(0);
    });

    it('should be readonly when readonly prop is true', () => {
      const onChange = jest.fn();
      const { getByPlaceholderText } = render(
        <LocalizedfieldsEdit
          value={mockValue}
          onChange={onChange}
          config={mockConfig}
          readonly={true}
        />
      );
      
      const input = getByPlaceholderText('Title eingeben...');
      expect(input.props.editable).toBe(false);
    });

    it('should display error message', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <LocalizedfieldsEdit
          value={mockValue}
          onChange={onChange}
          config={mockConfig}
          error="Validation error"
        />
      );
      
      expect(getByText('Validation error')).toBeTruthy();
    });

    it('should show data indicator for languages with data', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <LocalizedfieldsEdit
          value={mockValue}
          onChange={onChange}
          config={mockConfig}
        />
      );
      
      // Both DE and EN have data, so they should show indicators
      expect(getByText('DE')).toBeTruthy();
      expect(getByText('EN')).toBeTruthy();
    });
  });

  describe('Validator', () => {
    it('should pass validation for valid data', () => {
      const result = validateLocalizedfields(mockValue, mockConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when mandatory and empty', () => {
      const mandatoryConfig: LocalizedfieldsConfig = {
        ...mockConfig,
        mandatory: true,
      };
      
      const result = validateLocalizedfields({}, mandatoryConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when mandatory field is empty', () => {
      const valueWithEmptyMandatory: LocalizedValue = {
        de: {
          title: '', // Empty mandatory field
          description: 'Description',
        },
      };
      
      const result = validateLocalizedfields(valueWithEmptyMandatory, mockConfig);
      expect(result.valid).toBe(false);
    });

    it('should pass validation when at least one language has mandatory field', () => {
      const valueWithOneLang: LocalizedValue = {
        de: {
          title: 'Titel',
          description: '',
        },
      };
      
      const result = validateLocalizedfields(valueWithOneLang, mockConfig);
      expect(result.valid).toBe(true);
    });
  });

  describe('Transformer', () => {
    it('should transform from API format correctly', () => {
      const apiValue = {
        de: { title: 'Test', description: 'Beschreibung' },
        en: { title: 'Test', description: 'Description' },
      };
      
      const result = LocalizedfieldsTransformer.fromAPI(apiValue);
      expect(result).toEqual(apiValue);
    });

    it('should handle null API value', () => {
      const result = LocalizedfieldsTransformer.fromAPI(null);
      expect(result).toEqual({});
    });

    it('should transform to API format correctly', () => {
      const result = LocalizedfieldsTransformer.toAPI(mockValue);
      expect(result).toEqual(mockValue);
    });

    it('should return null for empty UI value', () => {
      const result = LocalizedfieldsTransformer.toAPI({});
      expect(result).toBeNull();
    });

    it('should clean empty language objects', () => {
      const valueWithEmpty: LocalizedValue = {
        de: { title: 'Test' },
        en: {}, // Empty language object
      };
      
      const result = LocalizedfieldsTransformer.toAPI(valueWithEmpty);
      expect(result).toEqual({ de: { title: 'Test' } });
      expect(result.en).toBeUndefined();
    });
  });
});
