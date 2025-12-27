/**
 * Object Detail Screen
 * Displays detailed information about a Pimcore data object
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Chip, Divider, List, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ObjectDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ObjectDetailScreen({ route, navigation }: ObjectDetailScreenProps) {
  const { object, classDefinition } = route.params;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card with Gradient */}
      <Surface style={styles.headerCard} elevation={2}>
        <LinearGradient
          colors={object.type === 'folder' ? ['#FFB300', '#FF6F00'] : ['#2196F3', '#1565C0']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name={object.type === 'folder' ? 'folder' : 'file-document-outline'}
                size={48}
                color="#fff"
              />
            </View>
            <View style={styles.headerText}>
              <Title style={styles.headerTitle}>{object.key}</Title>
              <Paragraph style={styles.headerSubtitle}>
                {object.className || 'Data Object'}
              </Paragraph>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statusContainer}>
          <Chip
            icon={object.published ? 'check-circle' : 'clock-outline'}
            style={[
              styles.statusChip,
              object.published ? styles.publishedChip : styles.draftChip,
            ]}
            textStyle={styles.statusChipText}
          >
            {object.published ? 'Published' : 'Draft'}
          </Chip>
          {object.isLocked && (
            <Chip icon="lock" style={styles.lockedChip} textStyle={styles.statusChipText}>
              Locked
            </Chip>
          )}
        </View>
      </Surface>

      {/* General Information */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#6200ee" />
            <Title style={styles.sectionTitle}>General Information</Title>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="pound" size={20} color="#6200ee" />
              </View>
              <View style={styles.infoContent}>
                <Paragraph style={styles.infoLabel}>ID</Paragraph>
                <Paragraph style={styles.infoValue}>{object.id?.toString()}</Paragraph>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="tag-outline" size={20} color="#6200ee" />
              </View>
              <View style={styles.infoContent}>
                <Paragraph style={styles.infoLabel}>Type</Paragraph>
                <Paragraph style={styles.infoValue}>{object.type}</Paragraph>
              </View>
            </View>

            {object.filename && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name="file-outline" size={20} color="#6200ee" />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Filename</Paragraph>
                  <Paragraph style={styles.infoValue}>{object.filename}</Paragraph>
                </View>
              </View>
            )}

            <View style={[styles.infoItem, styles.infoItemFull]}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="folder-open-outline" size={20} color="#6200ee" />
              </View>
              <View style={styles.infoContent}>
                <Paragraph style={styles.infoLabel}>Full Path</Paragraph>
                <Paragraph style={styles.infoValue} numberOfLines={2}>{object.fullPath}</Paragraph>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Metadata */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#6200ee" />
            <Title style={styles.sectionTitle}>Metadata</Title>
          </View>

          <View style={styles.infoGrid}>
            {object.creationDate && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name="calendar-plus" size={20} color="#4caf50" />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Created</Paragraph>
                  <Paragraph style={styles.infoValue}>{formatDate(object.creationDate)}</Paragraph>
                </View>
              </View>
            )}

            {object.modificationDate && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name="calendar-edit" size={20} color="#ff9800" />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Modified</Paragraph>
                  <Paragraph style={styles.infoValue}>{formatDate(object.modificationDate)}</Paragraph>
                </View>
              </View>
            )}

            {object.userOwner !== undefined && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#2196f3" />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Owner</Paragraph>
                  <Paragraph style={styles.infoValue}>User #{object.userOwner}</Paragraph>
                </View>
              </View>
            )}

            {object.userModification !== undefined && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name="account-edit-outline" size={20} color="#9c27b0" />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Modified By</Paragraph>
                  <Paragraph style={styles.infoValue}>User #{object.userModification}</Paragraph>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Hierarchy */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="file-tree-outline" size={24} color="#6200ee" />
            <Title style={styles.sectionTitle}>Hierarchy</Title>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="folder-arrow-up-outline" size={20} color="#6200ee" />
              </View>
              <View style={styles.infoContent}>
                <Paragraph style={styles.infoLabel}>Parent ID</Paragraph>
                <Paragraph style={styles.infoValue}>{object.parentId?.toString()}</Paragraph>
              </View>
            </View>

            {object.hasChildren !== undefined && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons 
                    name={object.hasChildren ? 'folder-multiple-outline' : 'folder-outline'} 
                    size={20} 
                    color={object.hasChildren ? '#4caf50' : '#999'} 
                  />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Has Children</Paragraph>
                  <Paragraph style={styles.infoValue}>{object.hasChildren ? 'Yes' : 'No'}</Paragraph>
                </View>
              </View>
            )}

            <View style={[styles.infoItem, styles.infoItemFull]}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons name="file-tree" size={20} color="#6200ee" />
              </View>
              <View style={styles.infoContent}>
                <Paragraph style={styles.infoLabel}>Path</Paragraph>
                <Paragraph style={styles.infoValue} numberOfLines={2}>{object.path}</Paragraph>
              </View>
            </View>

            {object.childrenSortBy && (
              <View style={[styles.infoItem, styles.infoItemFull]}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons name="sort" size={20} color="#6200ee" />
                </View>
                <View style={styles.infoContent}>
                  <Paragraph style={styles.infoLabel}>Sort Order</Paragraph>
                  <Paragraph style={styles.infoValue}>
                    {object.childrenSortBy} ({object.childrenSortOrder})
                  </Paragraph>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Permissions */}
      {object.permissions && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="shield-check-outline" size={24} color="#6200ee" />
              <Title style={styles.sectionTitle}>Permissions</Title>
            </View>
            
            <View style={styles.permissionsGrid}>
              {Object.entries(object.permissions).map(([key, value]) => {
                if (typeof value === 'boolean') {
                  return (
                    <Surface
                      key={key}
                      style={[
                        styles.permissionCard,
                        value ? styles.permissionEnabled : styles.permissionDisabled,
                      ]}
                      elevation={0}
                    >
                      <MaterialCommunityIcons
                        name={value ? 'check-circle' : 'close-circle'}
                        size={20}
                        color={value ? '#4caf50' : '#f44336'}
                      />
                      <Paragraph style={styles.permissionText}>{key}</Paragraph>
                    </Surface>
                  );
                }
                return null;
              })}
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  statusChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  publishedChip: {
    backgroundColor: '#4caf50',
  },
  draftChip: {
    backgroundColor: '#ff9800',
  },
  lockedChip: {
    backgroundColor: '#f44336',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0e7ff',
  },
  sectionTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    padding: 8,
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItemFull: {
    width: '100%',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
  },
  permissionEnabled: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  permissionDisabled: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  permissionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
