/**
 * Tests for Many-to-Many Object Relation components
 */

import { validateManyToManyObjectRelation } from './ManyToManyObjectRelation.validator';
import { ManyToManyObjectRelationTransformer } from './ManyToManyObjectRelation.transformer';
import type { ManyToManyObjectRelationConfig, RelatedObject } from './ManyToManyObjectRelation.types';

describe('ManyToManyObjectRelation', () => {
  describe('Validator', () => {
    const config: ManyToManyObjectRelationConfig = {
      label: 'Related Objects',
      name: 'relatedObjects',
    };

    it('should pass validation for empty non-mandatory field', () => {
      const result = validateManyToManyObjectRelation([], config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty mandatory field', () => {
      const mandatoryConfig = { ...config, mandatory: true };
      const result = validateManyToManyObjectRelation([], mandatoryConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Mindestens eine Relation ist erforderlich');
    });

    it('should fail validation for invalid object ID', () => {
      const value: RelatedObject[] = [
        {
          id: 0,
          key: 'test',
          path: '/test',
          fullPath: '/test',
          type: 'object',
        },
      ];
      const result = validateManyToManyObjectRelation(value, config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass validation for valid relations', () => {
      const value: RelatedObject[] = [
        {
          id: 123,
          key: 'product-1',
          path: '/products/product-1',
          fullPath: '/products/product-1',
          type: 'object',
          className: 'Product',
          published: true,
        },
      ];
      const result = validateManyToManyObjectRelation(value, config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate allowed classes', () => {
      const classConfig = { ...config, classes: ['Product', 'Category'] };
      const value: RelatedObject[] = [
        {
          id: 123,
          key: 'product-1',
          path: '/products/product-1',
          fullPath: '/products/product-1',
          type: 'object',
          className: 'InvalidClass',
        },
      ];
      const result = validateManyToManyObjectRelation(value, classConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('nicht erlaubt'))).toBe(true);
    });

    it('should validate single allowed class', () => {
      const classConfig = { ...config, allowedClassId: 'Product' };
      const value: RelatedObject[] = [
        {
          id: 123,
          key: 'category-1',
          path: '/categories/category-1',
          fullPath: '/categories/category-1',
          type: 'object',
          className: 'Category',
        },
      ];
      const result = validateManyToManyObjectRelation(value, classConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Nur Objekte der Klasse'))).toBe(true);
    });
  });

  describe('Transformer', () => {
    describe('fromAPI', () => {
      it('should transform empty array', () => {
        const result = ManyToManyObjectRelationTransformer.fromAPI([]);
        expect(result).toEqual([]);
      });

      it('should transform null/undefined to empty array', () => {
        expect(ManyToManyObjectRelationTransformer.fromAPI(null)).toEqual([]);
        expect(ManyToManyObjectRelationTransformer.fromAPI(undefined)).toEqual([]);
      });

      it('should transform API array to UI format', () => {
        const apiValue = [
          {
            id: 123,
            key: 'product-1',
            path: '/products',
            fullpath: '/products/product-1',
            type: 'object',
            classname: 'Product',
            published: true,
          },
        ];
        const result = ManyToManyObjectRelationTransformer.fromAPI(apiValue);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: 123,
          key: 'product-1',
          path: '/products',
          fullPath: '/products/product-1',
          type: 'object',
          className: 'Product',
          published: true,
        });
      });

      it('should handle alternative property names', () => {
        const apiValue = [
          {
            objectId: 456,
            name: 'test-object',
            fullpath: '/test',
            class: 'TestClass',
          },
        ];
        const result = ManyToManyObjectRelationTransformer.fromAPI(apiValue);
        expect(result[0].id).toBe(456);
        expect(result[0].key).toBe('test-object');
        expect(result[0].className).toBe('TestClass');
      });

      it('should convert single object to array', () => {
        const apiValue = {
          id: 789,
          key: 'single-object',
          path: '/single',
        };
        const result = ManyToManyObjectRelationTransformer.fromAPI(apiValue);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(789);
      });
    });

    describe('toAPI', () => {
      it('should transform empty array', () => {
        const result = ManyToManyObjectRelationTransformer.toAPI([]);
        expect(result).toEqual([]);
      });

      it('should transform UI format to API format', () => {
        const uiValue: RelatedObject[] = [
          {
            id: 123,
            key: 'product-1',
            path: '/products',
            fullPath: '/products/product-1',
            type: 'object',
            className: 'Product',
            published: true,
          },
        ];
        const result = ManyToManyObjectRelationTransformer.toAPI(uiValue);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: 123,
          type: 'object',
          className: 'Product',
        });
      });

      it('should handle multiple objects', () => {
        const uiValue: RelatedObject[] = [
          {
            id: 123,
            key: 'obj-1',
            path: '/obj-1',
            fullPath: '/obj-1',
            type: 'object',
            className: 'Class1',
          },
          {
            id: 456,
            key: 'obj-2',
            path: '/obj-2',
            fullPath: '/obj-2',
            type: 'object',
            className: 'Class2',
          },
        ];
        const result = ManyToManyObjectRelationTransformer.toAPI(uiValue);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(123);
        expect(result[1].id).toBe(456);
      });

      it('should handle null/undefined', () => {
        expect(ManyToManyObjectRelationTransformer.toAPI(null as any)).toEqual([]);
        expect(ManyToManyObjectRelationTransformer.toAPI(undefined as any)).toEqual([]);
      });
    });

    describe('Round-trip transformation', () => {
      it('should maintain data integrity through round-trip', () => {
        const originalApi = [
          {
            id: 123,
            key: 'test-object',
            path: '/test',
            fullpath: '/test/test-object',
            type: 'object',
            classname: 'TestClass',
            published: true,
          },
        ];

        // API -> UI
        const ui = ManyToManyObjectRelationTransformer.fromAPI(originalApi);
        
        // UI -> API
        const api = ManyToManyObjectRelationTransformer.toAPI(ui);

        expect(api[0].id).toBe(originalApi[0].id);
        expect(api[0].type).toBe(originalApi[0].type);
        expect(api[0].className).toBe(originalApi[0].classname);
      });
    });
  });
});
