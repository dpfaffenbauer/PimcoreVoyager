/**
 * Tests for Link Data Type
 */

import { validateLink } from './Link.validator';
import { LinkTransformer } from './Link.transformer';
import { LinkValue, LinkConfig } from './Link.types';

describe('Link DataType', () => {
  describe('Validator', () => {
    const config: LinkConfig = {
      label: 'Test Link',
      required: false,
    };

    it('should validate empty non-required field', () => {
      const result = validateLink(null, config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty required field', () => {
      const requiredConfig: LinkConfig = { ...config, required: true };
      const result = validateLink(null, requiredConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should reject direct link without URL', () => {
      const requiredConfig: LinkConfig = { ...config, required: true };
      const value: LinkValue = {
        text: 'Test',
        linktype: 'direct',
        direct: '',
        internal: null,
        internalType: null,
        fullPath: '',
        target: null,
        parameters: '',
        anchor: '',
        title: '',
        accesskey: '',
        rel: '',
        tabindex: '',
        class: '',
      };
      const result = validateLink(value, requiredConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Direct URL is required');
    });

    it('should reject internal link without selection', () => {
      const requiredConfig: LinkConfig = { ...config, required: true };
      const value: LinkValue = {
        text: 'Test',
        linktype: 'internal',
        direct: null,
        internal: null,
        internalType: null,
        fullPath: '',
        target: null,
        parameters: '',
        anchor: '',
        title: '',
        accesskey: '',
        rel: '',
        tabindex: '',
        class: '',
      };
      const result = validateLink(value, requiredConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Internal object selection is required');
    });

    it('should accept valid direct link', () => {
      const value: LinkValue = {
        text: 'Example',
        linktype: 'direct',
        direct: 'https://example.com',
        internal: null,
        internalType: null,
        fullPath: '',
        target: '_blank',
        parameters: '',
        anchor: '',
        title: 'Example Link',
        accesskey: '',
        rel: '',
        tabindex: '',
        class: '',
      };
      const result = validateLink(value, config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid internal link', () => {
      const value: LinkValue = {
        text: 'Internal Page',
        linktype: 'internal',
        direct: null,
        internal: 123,
        internalType: 'document',
        fullPath: '/path/to/page',
        target: null,
        parameters: '',
        anchor: '',
        title: '',
        accesskey: '',
        rel: '',
        tabindex: '',
        class: '',
      };
      const result = validateLink(value, config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Transformer', () => {
    it('should transform null from API', () => {
      const result = LinkTransformer.fromAPI(null);
      expect(result).toBeNull();
    });

    it('should transform null to API', () => {
      const result = LinkTransformer.toAPI(null);
      expect(result).toBeNull();
    });

    it('should transform direct link from API', () => {
      const apiValue = {
        text: 'Example',
        linktype: 'direct',
        direct: 'https://example.com',
        target: '_blank',
        title: 'Example Link',
      };
      const result = LinkTransformer.fromAPI(apiValue);
      expect(result).toBeDefined();
      expect(result?.text).toBe('Example');
      expect(result?.linktype).toBe('direct');
      expect(result?.direct).toBe('https://example.com');
      expect(result?.target).toBe('_blank');
      expect(result?.title).toBe('Example Link');
    });

    it('should transform internal link from API', () => {
      const apiValue = {
        text: 'Internal',
        linktype: 'internal',
        internal: 456,
        internalType: 'document',
        fullPath: '/internal/page',
      };
      const result = LinkTransformer.fromAPI(apiValue);
      expect(result).toBeDefined();
      expect(result?.linktype).toBe('internal');
      expect(result?.internal).toBe(456);
      expect(result?.internalType).toBe('document');
      expect(result?.fullPath).toBe('/internal/page');
    });

    it('should transform direct link to API', () => {
      const uiValue: LinkValue = {
        text: 'Example',
        linktype: 'direct',
        direct: 'https://example.com',
        internal: null,
        internalType: null,
        fullPath: '',
        target: '_blank',
        parameters: '',
        anchor: '#section',
        title: 'Example',
        accesskey: '',
        rel: 'noopener',
        tabindex: '',
        class: '',
      };
      const result = LinkTransformer.toAPI(uiValue);
      expect(result).toBeDefined();
      expect(result.linktype).toBe('direct');
      expect(result.direct).toBe('https://example.com');
      expect(result.target).toBe('_blank');
      expect(result.anchor).toBe('#section');
      expect(result.rel).toBe('noopener');
    });

    it('should transform internal link to API', () => {
      const uiValue: LinkValue = {
        text: 'Internal',
        linktype: 'internal',
        direct: null,
        internal: 789,
        internalType: 'object',
        fullPath: '/some/path',
        target: null,
        parameters: '',
        anchor: '',
        title: '',
        accesskey: '',
        rel: '',
        tabindex: '',
        class: '',
      };
      const result = LinkTransformer.toAPI(uiValue);
      expect(result).toBeDefined();
      expect(result.linktype).toBe('internal');
      expect(result.internal).toBe(789);
      expect(result.internalType).toBe('object');
      expect(result.fullPath).toBe('/some/path');
    });

    it('should only include non-empty optional fields in API format', () => {
      const uiValue: LinkValue = {
        text: 'Test',
        linktype: 'direct',
        direct: 'https://test.com',
        internal: null,
        internalType: null,
        fullPath: '',
        target: null,
        parameters: '',
        anchor: '',
        title: '',
        accesskey: '',
        rel: '',
        tabindex: '',
        class: '',
      };
      const result = LinkTransformer.toAPI(uiValue);
      expect(result).toBeDefined();
      expect(result.text).toBe('Test');
      expect(result.linktype).toBe('direct');
      expect(result.direct).toBe('https://test.com');
      // Empty fields should not be included
      expect(result.target).toBeUndefined();
      expect(result.parameters).toBeUndefined();
      expect(result.anchor).toBeUndefined();
    });
  });
});
