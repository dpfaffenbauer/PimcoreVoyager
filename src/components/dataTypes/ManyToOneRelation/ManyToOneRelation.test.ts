/**
 * Tests for Many-to-One Relation Data Type
 */

import { validateManyToOneRelation } from './ManyToOneRelation.validator';
import { ManyToOneRelationTransformer } from './ManyToOneRelation.transformer';
import { ManyToOneRelationValue, ManyToOneRelationConfig } from './ManyToOneRelation.types';

describe('ManyToOneRelation DataType', () => {
  describe('Validator', () => {
    const baseConfig: ManyToOneRelationConfig = {
      name: 'relation',
      title: 'Test Relation',
      type: 'manyToOneRelation',
    };

    it('should validate null value when not mandatory', () => {
      const result = validateManyToOneRelation(null, baseConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when mandatory and value is null', () => {
      const config: ManyToOneRelationConfig = {
        ...baseConfig,
        mandatory: true,
      };
      const result = validateManyToOneRelation(null, config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate correct relation value', () => {
      const value: ManyToOneRelationValue = {
        id: 123,
        type: 'object',
        className: 'Product',
        key: 'test-product',
      };
      const result = validateManyToOneRelation(value, baseConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when class not in allowed list', () => {
      const value: ManyToOneRelationValue = {
        id: 123,
        type: 'object',
        className: 'NotAllowed',
      };
      const config: ManyToOneRelationConfig = {
        ...baseConfig,
        classes: ['Product', 'Category'],
      };
      const result = validateManyToOneRelation(value, config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate when class is in allowed list', () => {
      const value: ManyToOneRelationValue = {
        id: 123,
        type: 'object',
        className: 'Product',
      };
      const config: ManyToOneRelationConfig = {
        ...baseConfig,
        classes: ['Product', 'Category'],
      };
      const result = validateManyToOneRelation(value, config);
      expect(result.valid).toBe(true);
    });
  });

  describe('Transformer', () => {
    describe('fromAPI', () => {
      it('should handle null value', () => {
        const result = ManyToOneRelationTransformer.fromAPI(null);
        expect(result).toBeNull();
      });

      it('should handle undefined value', () => {
        const result = ManyToOneRelationTransformer.fromAPI(undefined);
        expect(result).toBeNull();
      });

      it('should transform API object format', () => {
        const apiValue = {
          id: 123,
          type: 'object',
          className: 'Product',
          key: 'test-product',
          path: '/products',
          published: true,
        };
        const result = ManyToOneRelationTransformer.fromAPI(apiValue);
        expect(result).toEqual({
          id: 123,
          type: 'object',
          className: 'Product',
          key: 'test-product',
          path: '/products',
          published: true,
        });
      });

      it('should handle array format with single object', () => {
        const apiValue = [
          {
            id: 123,
            type: 'object',
            className: 'Product',
            key: 'test-product',
          },
        ];
        const result = ManyToOneRelationTransformer.fromAPI(apiValue);
        expect(result?.id).toBe(123);
        expect(result?.className).toBe('Product');
      });

      it('should handle empty array', () => {
        const result = ManyToOneRelationTransformer.fromAPI([]);
        expect(result).toBeNull();
      });

      it('should handle ID-only format', () => {
        const result = ManyToOneRelationTransformer.fromAPI(456);
        expect(result).toEqual({
          id: 456,
          type: 'object',
        });
      });

      it('should handle string ID format', () => {
        const result = ManyToOneRelationTransformer.fromAPI('789');
        expect(result).toEqual({
          id: 789,
          type: 'object',
        });
      });
    });

    describe('toAPI', () => {
      it('should handle null value', () => {
        const result = ManyToOneRelationTransformer.toAPI(null);
        expect(result).toBeNull();
      });

      it('should transform UI value to API format', () => {
        const uiValue: ManyToOneRelationValue = {
          id: 123,
          type: 'object',
          className: 'Product',
          key: 'test-product',
          path: '/products',
          published: true,
        };
        const result = ManyToOneRelationTransformer.toAPI(uiValue);
        expect(result).toEqual({
          id: 123,
          type: 'object',
        });
      });

      it('should only include id and type in API format', () => {
        const uiValue: ManyToOneRelationValue = {
          id: 456,
          type: 'asset',
          className: 'Image',
          key: 'photo.jpg',
        };
        const result = ManyToOneRelationTransformer.toAPI(uiValue);
        expect(result).toEqual({
          id: 456,
          type: 'asset',
        });
        expect(result).not.toHaveProperty('className');
        expect(result).not.toHaveProperty('key');
      });
    });
  });
});
