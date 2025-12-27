/**
 * Multiselect Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MultiselectDisplay } from './MultiselectDisplay';
import { MultiselectEdit } from './MultiselectEdit';
import { validateMultiselect } from './Multiselect.validator';
import { MultiselectTransformer } from './Multiselect.transformer';
import { MultiselectConfig } from './Multiselect.types';

describe('Multiselect DataType', () => {
  const mockOptions = [
    { key: 'Option 1', value: '1' },
    { key: 'Option 2', value: '2' },
    { key: 'Option 3', value: '3' },
  ];

  const mockConfig: MultiselectConfig = {
    label: 'Test Multiselect',
    name: 'testMultiselect',
    options: mockOptions,
  };

  describe('MultiselectDisplay', () => {
    it('should display selected values as chips', () => {
      const { getByText } = render(
        <MultiselectDisplay
          value={['1', '2']}
          config={mockConfig}
        />
      );

      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
    });

    it('should show empty state when no values selected', () => {
      const { getByText } = render(
        <MultiselectDisplay
          value={[]}
          config={mockConfig}
        />
      );

      expect(getByText('Keine Auswahl')).toBeTruthy();
    });

    it('should display label', () => {
      const { getByText } = render(
        <MultiselectDisplay
          value={[]}
          config={mockConfig}
        />
      );

      expect(getByText('Test Multiselect')).toBeTruthy();
    });
  });

  describe('MultiselectEdit', () => {
    it('should call onChange when option is toggled', async () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <MultiselectEdit
          value={[]}
          onChange={onChange}
          config={mockConfig}
        />
      );

      // Open modal
      fireEvent.press(getByText('Auswählen...'));

      await waitFor(() => {
        // Select first option
        const option1 = getByText('Option 1');
        fireEvent.press(option1);
      });

      expect(onChange).toHaveBeenCalledWith(['1']);
    });

    it('should display selected values', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <MultiselectEdit
          value={['1', '2']}
          onChange={onChange}
          config={mockConfig}
        />
      );

      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
    });

    it('should show error message', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <MultiselectEdit
          value={[]}
          onChange={onChange}
          config={mockConfig}
          error="Required field"
        />
      );

      expect(getByText('Required field')).toBeTruthy();
    });

    it('should be disabled when readonly', () => {
      const onChange = jest.fn();
      const { getByText } = render(
        <MultiselectEdit
          value={[]}
          onChange={onChange}
          config={mockConfig}
          readonly={true}
        />
      );

      const button = getByText('Auswählen...');
      fireEvent.press(button);

      // Modal should not open (onChange not called)
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should respect maxItems limit', async () => {
      const onChange = jest.fn();
      const configWithMax: MultiselectConfig = {
        ...mockConfig,
        maxItems: 2,
      };

      const { getByText } = render(
        <MultiselectEdit
          value={['1', '2']}
          onChange={onChange}
          config={configWithMax}
        />
      );

      // Open modal
      fireEvent.press(getByText('Option 1'));

      await waitFor(() => {
        // Try to select third option (should be disabled)
        const option3 = getByText('Option 3');
        fireEvent.press(option3);
      });

      // onChange should not be called with third item
      expect(onChange).not.toHaveBeenCalledWith(['1', '2', '3']);
    });
  });

  describe('validateMultiselect', () => {
    it('should validate required field', () => {
      const config: MultiselectConfig = {
        ...mockConfig,
        mandatory: true,
      };

      const result = validateMultiselect([], config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dieses Feld ist erforderlich');
    });

    it('should pass validation with selected values', () => {
      const config: MultiselectConfig = {
        ...mockConfig,
        mandatory: true,
      };

      const result = validateMultiselect(['1', '2'], config);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should validate max items', () => {
      const config: MultiselectConfig = {
        ...mockConfig,
        maxItems: 2,
      };

      const result = validateMultiselect(['1', '2', '3'], config);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Maximal 2 Elemente erlaubt');
    });

    it('should validate that selected values exist in options', () => {
      const config: MultiselectConfig = {
        ...mockConfig,
      };

      const result = validateMultiselect(['1', '999'], config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Ungültige Auswahl erkannt');
    });
  });

  describe('MultiselectTransformer', () => {
    it('should transform from API to UI format', () => {
      const apiValue = ['1', '2', '3'];
      const uiValue = MultiselectTransformer.fromAPI(apiValue);

      expect(uiValue).toEqual(['1', '2', '3']);
    });

    it('should handle null API value', () => {
      const uiValue = MultiselectTransformer.fromAPI(null);
      expect(uiValue).toEqual([]);
    });

    it('should transform from UI to API format', () => {
      const uiValue = ['1', '2'];
      const apiValue = MultiselectTransformer.toAPI(uiValue);

      expect(apiValue).toEqual(['1', '2']);
    });

    it('should transform empty array to null', () => {
      const apiValue = MultiselectTransformer.toAPI([]);
      expect(apiValue).toBeNull();
    });
  });
});
