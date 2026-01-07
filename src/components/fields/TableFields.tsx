/**
 * Table field renderers
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';

// Table field
export const TableField: React.FC<FieldRendererProps> = ({ value, title, mandatory }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // Handle array of arrays (simple table)
  if (Array.isArray(value)) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {value.map((row: any[], rowIdx: number) => (
              <View key={rowIdx} style={[styles.tableRow, rowIdx === 0 && styles.tableHeaderRow]}>
                {Array.isArray(row) ? (
                  row.map((cell, cellIdx) => (
                    <Text
                      key={cellIdx}
                      style={[styles.tableCell, rowIdx === 0 && styles.tableHeaderCell]}
                      selectable
                    >
                      {cell ?? '-'}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.tableCell} selectable>
                    {String(row)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </FieldWrapper>
    );
  }

  // Handle structured table (object with rows)
  if (typeof value === 'object' && value !== null) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.tableContainer}>
          {Object.entries(value).map(([key, val]: [string, any], idx: number) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCellHeader} selectable>
                {key}
              </Text>
              <Text style={styles.tableCell} selectable>
                {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
              </Text>
            </View>
          ))}
        </View>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>{JSON.stringify(value)}</Text>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderRow: {
    backgroundColor: '#f5f5f5',
  },
  tableCell: {
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  tableHeaderCell: {
    fontWeight: '600',
    color: '#666',
  },
  tableCellHeader: {
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
});

// Register table field types
export const tableFieldTypes = {
  table: TableField,
  structuredTable: TableField,
};
