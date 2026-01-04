/**
 * Additional field renderers
 * Slider, Color, URL Slug, Ranges, Consent, etc.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';

// Slider field (displays numeric value)
export const SliderField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <View style={styles.sliderContainer}>
      <MaterialCommunityIcons name="tune-vertical" size={18} color="#666" />
      <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
        {value !== null && value !== undefined ? value.toString() : '-'}
      </Text>
    </View>
  </FieldWrapper>
);

// RGBA Color field
export const RgbaColorField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.colorContainer}>
        <View style={[styles.colorSwatch, { backgroundColor: value }]} />
        <Text style={styles.colorValue} selectable>{value}</Text>
      </View>
    </FieldWrapper>
  );
};

// URL Slug field
export const UrlSlugField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const slugs = Array.isArray(value) ? value : [value];

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.slugList}>
        {slugs.map((slug: any, idx: number) => {
          const slugValue = typeof slug === 'string' ? slug : slug.slug || slug.path;
          const siteId = typeof slug === 'object' ? slug.siteId : null;
          return (
            <View key={idx} style={styles.slugItem}>
              <MaterialCommunityIcons name="link-variant" size={16} color="#2196f3" />
              <Text style={styles.slugText} selectable>{slugValue}</Text>
              {siteId && <Text style={styles.slugSite}>Site: {siteId}</Text>}
            </View>
          );
        })}
      </View>
    </FieldWrapper>
  );
};

// Date Range field
export const DateRangeField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value || !Array.isArray(value) || value.length < 2) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const formatDate = (dateStr: string | number): string => {
    if (!dateStr) return '-';
    const date = typeof dateStr === 'number' ? new Date(dateStr * 1000) : new Date(dateStr);
    return date.toLocaleDateString('de-DE');
  };

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.rangeContainer}>
        <MaterialCommunityIcons name="calendar-range" size={18} color="#666" />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
          {formatDate(value[0])} – {formatDate(value[1])}
        </Text>
      </View>
    </FieldWrapper>
  );
};

// Numeric Range field
export const NumericRangeField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const min = value.minimum ?? value.min ?? value[0];
  const max = value.maximum ?? value.max ?? value[1];

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.rangeContainer}>
        <MaterialCommunityIcons name="arrow-expand-horizontal" size={18} color="#666" />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
          {min ?? '-'} – {max ?? '-'}
        </Text>
      </View>
    </FieldWrapper>
  );
};

// Quantity Value Range field
export const QuantityValueRangeField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const min = value.minimum ?? value.min;
  const max = value.maximum ?? value.max;
  const unit = value.unitId || value.unit || '';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.rangeContainer}>
        <MaterialCommunityIcons name="arrow-expand-horizontal" size={18} color="#666" />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
          {min ?? '-'} – {max ?? '-'} {unit}
        </Text>
      </View>
    </FieldWrapper>
  );
};

// Input Quantity Value (same as quantity value)
export const InputQuantityValueField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const numValue = value.value ?? value;
  const unit = value.unitId || value.unit || '';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>
        {numValue !== null && numValue !== undefined ? `${numValue} ${unit}`.trim() : '-'}
      </Text>
    </FieldWrapper>
  );
};

// Gender field (select-like)
export const GenderField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  const genderLabels: Record<string, string> = {
    male: 'Männlich',
    female: 'Weiblich',
    other: 'Andere',
    m: 'Männlich',
    f: 'Weiblich',
    d: 'Divers',
  };

  const displayValue = value ? (genderLabels[value.toLowerCase()] || value) : '-';
  const iconName = value === 'male' || value === 'm' ? 'gender-male' :
                   value === 'female' || value === 'f' ? 'gender-female' : 'gender-male-female';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.genderContainer}>
        <MaterialCommunityIcons name={iconName} size={18} color="#666" />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>{displayValue}</Text>
      </View>
    </FieldWrapper>
  );
};

// Geopolyline field (array of geopoints forming a line)
export const GeopolylineField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.geoContainer}>
        <MaterialCommunityIcons name="vector-polyline" size={20} color="#ff9800" />
        <View style={styles.geoInfo}>
          <Text style={styles.geoLabel}>{value.length} Punkte</Text>
          {value.slice(0, 3).map((point: any, idx: number) => (
            <Text key={idx} style={styles.geoCoord} selectable>
              {(point.latitude ?? point.lat)?.toFixed(6)}, {(point.longitude ?? point.lng ?? point.lon)?.toFixed(6)}
            </Text>
          ))}
          {value.length > 3 && <Text style={styles.geoMore}>... +{value.length - 3} weitere</Text>}
        </View>
      </View>
    </FieldWrapper>
  );
};

// Password field (masked)
export const PasswordField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <View style={styles.passwordContainer}>
      <MaterialCommunityIcons name="lock" size={18} color="#666" />
      <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
        {value ? '••••••••' : '-'}
      </Text>
    </View>
  </FieldWrapper>
);

// Encrypted field
export const EncryptedField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <View style={styles.encryptedContainer}>
      <MaterialCommunityIcons name="shield-lock" size={18} color="#4caf50" />
      <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
        {value ? 'Verschlüsselt' : '-'}
      </Text>
    </View>
  </FieldWrapper>
);

// External Image field
export const ExternalImageField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value || !value.url) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Image source={{ uri: value.url }} style={styles.externalImage} resizeMode="cover" />
      <Text style={styles.externalImageUrl} selectable numberOfLines={2}>{value.url}</Text>
    </FieldWrapper>
  );
};

// Consent field
export const ConsentField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const hasConsent = value.consent === true;

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.consentContainer}>
        <MaterialCommunityIcons
          name={hasConsent ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={24}
          color={hasConsent ? '#4caf50' : '#999'}
        />
        <View style={styles.consentInfo}>
          <Text style={wrapperStyles.textValue}>
            {hasConsent ? 'Zugestimmt' : 'Nicht zugestimmt'}
          </Text>
          {value.noteContent && (
            <Text style={styles.consentNote}>{value.noteContent}</Text>
          )}
        </View>
      </View>
    </FieldWrapper>
  );
};

// User field
export const UserField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const userName = typeof value === 'object' ? (value.name || value.username || value.id) : value;

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.userContainer}>
        <MaterialCommunityIcons name="account" size={18} color="#666" />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>{userName}</Text>
      </View>
    </FieldWrapper>
  );
};

// Helper to format a classification store value
const formatClassificationValue = (val: any): string => {
  if (val === null || val === undefined) return '-';
  if (typeof val !== 'object') return String(val);

  // Handle QuantityValue: {value, unitId}
  if ('value' in val && 'unitId' in val) {
    return `${val.value ?? ''} ${val.unitId ?? ''}`.trim() || '-';
  }

  // Handle other object types
  if ('value' in val) return String(val.value);

  return JSON.stringify(val);
};

// Classification Store field
export const ClassificationStoreField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // Classification store structure: { groupName: { keyName: value } }
  // or { groupId: { keyId: { value, unitId } } }
  const renderGroup = (groupName: string, groupData: any) => {
    if (!groupData || typeof groupData !== 'object') return null;

    const entries = Object.entries(groupData);
    if (entries.length === 0) return null;

    return (
      <View key={groupName} style={styles.classificationGroup}>
        <Text style={styles.classificationGroupName}>{groupName}</Text>
        {entries.map(([keyName, keyValue]) => (
          <View key={keyName} style={styles.classificationItem}>
            <Text style={styles.classificationKey}>{keyName}</Text>
            <Text style={styles.classificationValue}>
              {formatClassificationValue(keyValue)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Handle array format
  if (Array.isArray(value)) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.classificationContainer}>
          {value.map((item, index) => {
            const groupName = item.groupName || item.group || `Gruppe ${index + 1}`;
            const keyName = item.keyName || item.key || item.name;
            const keyValue = item.value;

            return (
              <View key={index} style={styles.classificationItem}>
                <Text style={styles.classificationKey}>
                  {groupName} / {keyName}
                </Text>
                <Text style={styles.classificationValue}>
                  {formatClassificationValue(keyValue)}
                </Text>
              </View>
            );
          })}
        </View>
      </FieldWrapper>
    );
  }

  // Handle object format (grouped)
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.classificationContainer}>
        {Object.entries(value).map(([groupName, groupData]) =>
          renderGroup(groupName, groupData)
        )}
      </View>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorValue: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  slugList: {
    gap: 8,
  },
  slugItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
  },
  slugText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196f3',
    flex: 1,
  },
  slugSite: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  geoInfo: {
    marginLeft: 10,
    flex: 1,
  },
  geoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  geoCoord: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
  },
  geoMore: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  externalImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  externalImageUrl: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consentInfo: {
    marginLeft: 10,
    flex: 1,
  },
  consentNote: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Classification store styles
  classificationContainer: {
    gap: 12,
  },
  classificationGroup: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#9c27b0',
  },
  classificationGroupName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9c27b0',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  classificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  classificationKey: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  classificationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
});

// Register additional field types
export const additionalFieldTypes = {
  slider: SliderField,
  rgbaColor: RgbaColorField,
  urlSlug: UrlSlugField,
  dateRange: DateRangeField,
  numericRange: NumericRangeField,
  quantityValueRange: QuantityValueRangeField,
  inputQuantityValue: InputQuantityValueField,
  gender: GenderField,
  geopolyline: GeopolylineField,
  password: PasswordField,
  encryptedField: EncryptedField,
  externalImage: ExternalImageField,
  consent: ConsentField,
  user: UserField,
  classificationstore: ClassificationStoreField,
};
