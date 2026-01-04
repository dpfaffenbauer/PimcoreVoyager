/**
 * Geo/Location field renderers
 * Supports both view and edit modes
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';

// Geopoint field - supports both view and edit modes
export const GeopointField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const lat = value?.latitude ?? value?.lat ?? '';
  const lng = value?.longitude ?? value?.lng ?? value?.lon ?? '';

  const handleLatChange = (text: string) => {
    const num = parseFloat(text.replace(',', '.'));
    onFieldChange?.({
      ...value,
      latitude: isNaN(num) ? null : num,
    });
  };

  const handleLngChange = (text: string) => {
    const num = parseFloat(text.replace(',', '.'));
    onFieldChange?.({
      ...value,
      longitude: isNaN(num) ? null : num,
    });
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.geoEditContainer}>
          <View style={styles.geoEditRow}>
            <View style={styles.geoEditField}>
              <Text style={styles.geoEditLabel}>Breitengrad (Lat):</Text>
              <TextInput
                value={lat !== '' && lat !== null ? String(lat) : ''}
                onChangeText={handleLatChange}
                mode="outlined"
                dense
                keyboardType="decimal-pad"
                disabled={isDisabled}
                style={styles.geoEditInput}
                placeholder="z.B. 48.137154"
              />
            </View>
            <View style={styles.geoEditField}>
              <Text style={styles.geoEditLabel}>Längengrad (Lng):</Text>
              <TextInput
                value={lng !== '' && lng !== null ? String(lng) : ''}
                onChangeText={handleLngChange}
                mode="outlined"
                dense
                keyboardType="decimal-pad"
                disabled={isDisabled}
                style={styles.geoEditInput}
                placeholder="z.B. 11.576124"
              />
            </View>
          </View>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode - no value
  if (!value || (lat === '' && lng === '')) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // View mode - with value
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.geoContainer}>
        <MaterialCommunityIcons name="map-marker" size={20} color="#f44336" />
        <View style={styles.geoInfo}>
          <Text style={styles.geoCoord} selectable>
            {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
          </Text>
        </View>
      </View>
    </FieldWrapper>
  );
};

// Geobounds field - supports both view and edit modes
export const GeoboundsField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const ne = value?.northEast || value?.ne || {};
  const sw = value?.southWest || value?.sw || {};

  const handleCoordChange = (corner: 'northEast' | 'southWest', coord: 'latitude' | 'longitude', text: string) => {
    const num = parseFloat(text.replace(',', '.'));
    onFieldChange?.({
      ...value,
      [corner]: {
        ...(value?.[corner] || {}),
        [coord]: isNaN(num) ? null : num,
      },
    });
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.geoBoundsEditContainer}>
          <Text style={styles.geoBoundsCornerLabel}>Nordost (NE):</Text>
          <View style={styles.geoEditRow}>
            <View style={styles.geoEditField}>
              <TextInput
                value={ne.latitude !== undefined ? String(ne.latitude) : ''}
                onChangeText={(text) => handleCoordChange('northEast', 'latitude', text)}
                mode="outlined"
                dense
                keyboardType="decimal-pad"
                disabled={isDisabled}
                style={styles.geoEditInput}
                placeholder="Lat"
              />
            </View>
            <View style={styles.geoEditField}>
              <TextInput
                value={ne.longitude !== undefined ? String(ne.longitude) : ''}
                onChangeText={(text) => handleCoordChange('northEast', 'longitude', text)}
                mode="outlined"
                dense
                keyboardType="decimal-pad"
                disabled={isDisabled}
                style={styles.geoEditInput}
                placeholder="Lng"
              />
            </View>
          </View>

          <Text style={[styles.geoBoundsCornerLabel, { marginTop: 12 }]}>Südwest (SW):</Text>
          <View style={styles.geoEditRow}>
            <View style={styles.geoEditField}>
              <TextInput
                value={sw.latitude !== undefined ? String(sw.latitude) : ''}
                onChangeText={(text) => handleCoordChange('southWest', 'latitude', text)}
                mode="outlined"
                dense
                keyboardType="decimal-pad"
                disabled={isDisabled}
                style={styles.geoEditInput}
                placeholder="Lat"
              />
            </View>
            <View style={styles.geoEditField}>
              <TextInput
                value={sw.longitude !== undefined ? String(sw.longitude) : ''}
                onChangeText={(text) => handleCoordChange('southWest', 'longitude', text)}
                mode="outlined"
                dense
                keyboardType="decimal-pad"
                disabled={isDisabled}
                style={styles.geoEditInput}
                placeholder="Lng"
              />
            </View>
          </View>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode - no value
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // View mode - with value
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.geoContainer}>
        <MaterialCommunityIcons name="vector-square" size={20} color="#4caf50" />
        <View style={styles.geoInfo}>
          {ne.latitude !== undefined && (
            <Text style={styles.geoCoord} selectable>
              NE: {ne.latitude?.toFixed(6)}, {ne.longitude?.toFixed(6)}
            </Text>
          )}
          {sw.latitude !== undefined && (
            <Text style={styles.geoCoord} selectable>
              SW: {sw.latitude?.toFixed(6)}, {sw.longitude?.toFixed(6)}
            </Text>
          )}
        </View>
      </View>
    </FieldWrapper>
  );
};

// Geopolygon field - supports both view and edit modes
export const GeopolygonField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const points = Array.isArray(value) ? value : [];

  // For editing polygons, we use a simplified JSON editor approach
  // A full map-based editor would be more complex

  // Edit mode - show as JSON for now
  if (isEditing) {
    const jsonValue = points.length > 0 ? JSON.stringify(points, null, 2) : '';

    const handleJsonChange = (text: string) => {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          onFieldChange?.(parsed);
        }
      } catch {
        // Invalid JSON, don't update
      }
    };

    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.polygonEditContainer}>
          <Text style={styles.polygonEditHint}>
            {points.length} Punkte definiert
          </Text>
          <TextInput
            value={jsonValue}
            onChangeText={handleJsonChange}
            mode="outlined"
            multiline
            numberOfLines={6}
            disabled={isDisabled}
            style={styles.polygonEditInput}
            placeholder='[{"latitude": 0, "longitude": 0}]'
          />
          <Text style={styles.polygonEditNote}>
            JSON-Format: [{`{"latitude": 48.1, "longitude": 11.5}, ...`}]
          </Text>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode - no value
  if (points.length === 0) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // View mode - with value
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.geoContainer}>
        <MaterialCommunityIcons name="vector-polygon" size={20} color="#9c27b0" />
        <View style={styles.geoInfo}>
          <Text style={styles.geoLabel}>{points.length} Punkte</Text>
          {points.slice(0, 3).map((point: any, idx: number) => (
            <Text key={idx} style={styles.geoCoord} selectable>
              {(point.latitude ?? point.lat)?.toFixed(6)}, {(point.longitude ?? point.lng ?? point.lon)?.toFixed(6)}
            </Text>
          ))}
          {points.length > 3 && <Text style={styles.geoMore}>... +{points.length - 3} weitere</Text>}
        </View>
      </View>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  // View mode styles
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
  // Edit mode styles
  geoEditContainer: {
    gap: 8,
  },
  geoEditRow: {
    flexDirection: 'row',
    gap: 12,
  },
  geoEditField: {
    flex: 1,
  },
  geoEditLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  geoEditInput: {
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  // Geobounds edit styles
  geoBoundsEditContainer: {
    gap: 4,
  },
  geoBoundsCornerLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // Geopolygon edit styles
  polygonEditContainer: {
    gap: 8,
  },
  polygonEditHint: {
    fontSize: 12,
    color: '#666',
  },
  polygonEditInput: {
    backgroundColor: '#fff',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  polygonEditNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});

// Register geo field types
export const geoFieldTypes = {
  geopoint: GeopointField,
  geobounds: GeoboundsField,
  geopolygon: GeopolygonField,
};
