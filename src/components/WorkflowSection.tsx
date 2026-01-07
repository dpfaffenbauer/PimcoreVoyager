/**
 * WorkflowSection Component
 * Displays workflow status badges for Pimcore elements
 * Actions are handled in the parent screen's menu
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface } from './ui';
import { WorkflowItem } from '../apis/pimcoreService';

interface WorkflowSectionProps {
  workflows: WorkflowItem[];
}

export function WorkflowSection({ workflows }: WorkflowSectionProps) {
  if (!workflows || workflows.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {workflows.map((workflow, index) => (
        <Surface key={`${workflow.workflowName}-${index}`} style={styles.workflowCard} elevation={2}>
          {/* Workflow Header */}
          <View style={styles.workflowHeader}>
            <MaterialCommunityIcons name="state-machine" size={20} color="#6200ee" />
            <Text style={styles.workflowTitle}>{workflow.workflowLabel}</Text>
          </View>

          {/* Status Badges */}
          {workflow.workflowStatus && workflow.workflowStatus.length > 0 && (
            <View style={styles.statusBadges}>
              {workflow.workflowStatus.map((status, statusIndex) => (
                <View
                  key={`${status.title}-${statusIndex}`}
                  style={[styles.statusBadge, { backgroundColor: status.color }]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: status.colorInverted ? '#fff' : '#000' },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Surface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  workflowCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workflowTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
