/**
 * Object Detail Screen
 * Displays detailed information about a Pimcore data object
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Chip, Divider, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={object.type === 'folder' ? 'folder' : 'file-document'}
              size={32}
              color={object.type === 'folder' ? '#ff9800' : '#2196f3'}
            />
            <Title style={styles.title}>{object.key}</Title>
          </View>

          <View style={styles.chipContainer}>
            <Chip
              icon={object.published ? 'check-circle' : 'circle-outline'}
              style={[
                styles.chip,
                object.published ? styles.publishedChip : styles.draftChip,
              ]}
              textStyle={{ color: '#fff' }}
            >
              {object.published ? 'Published' : 'Draft'}
            </Chip>
            <Chip icon="folder" style={styles.chip}>
              {object.className}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <List.Section>
            <List.Subheader>General Information</List.Subheader>
            
            <List.Item
              title="ID"
              description={object.id?.toString()}
              left={props => <List.Icon {...props} icon="identifier" />}
            />
            
            <List.Item
              title="Type"
              description={object.type}
              left={props => <List.Icon {...props} icon="tag" />}
            />
            
            <List.Item
              title="Full Path"
              description={object.fullPath}
              left={props => <List.Icon {...props} icon="folder-open" />}
            />
            
            {object.filename && (
              <List.Item
                title="Filename"
                description={object.filename}
                left={props => <List.Icon {...props} icon="file" />}
              />
            )}

            <Divider style={styles.divider} />

            <List.Subheader>Metadata</List.Subheader>

            {object.creationDate && (
              <List.Item
                title="Created"
                description={formatDate(object.creationDate)}
                left={props => <List.Icon {...props} icon="calendar-plus" />}
              />
            )}

            {object.modificationDate && (
              <List.Item
                title="Modified"
                description={formatDate(object.modificationDate)}
                left={props => <List.Icon {...props} icon="calendar-edit" />}
              />
            )}

            {object.userOwner !== undefined && (
              <List.Item
                title="Owner ID"
                description={object.userOwner?.toString()}
                left={props => <List.Icon {...props} icon="account" />}
              />
            )}

            {object.userModification !== undefined && (
              <List.Item
                title="Modified By"
                description={object.userModification?.toString()}
                left={props => <List.Icon {...props} icon="account-edit" />}
              />
            )}

            <Divider style={styles.divider} />

            <List.Subheader>Hierarchy</List.Subheader>

            <List.Item
              title="Parent ID"
              description={object.parentId?.toString()}
              left={props => <List.Icon {...props} icon="folder-arrow-up" />}
            />

            <List.Item
              title="Path"
              description={object.path}
              left={props => <List.Icon {...props} icon="file-tree" />}
            />

            {object.hasChildren !== undefined && (
              <List.Item
                title="Has Children"
                description={object.hasChildren ? 'Yes' : 'No'}
                left={props => <List.Icon {...props} icon="folder-multiple" />}
              />
            )}

            {object.childrenSortBy && (
              <List.Item
                title="Sort By"
                description={`${object.childrenSortBy} (${object.childrenSortOrder})`}
                left={props => <List.Icon {...props} icon="sort" />}
              />
            )}

            {object.permissions && (
              <>
                <Divider style={styles.divider} />
                <List.Subheader>Permissions</List.Subheader>
                
                <View style={styles.permissionsGrid}>
                  {Object.entries(object.permissions).map(([key, value]) => {
                    if (typeof value === 'boolean') {
                      return (
                        <Chip
                          key={key}
                          icon={value ? 'check' : 'close'}
                          style={[
                            styles.permissionChip,
                            value ? styles.permissionEnabled : styles.permissionDisabled,
                          ]}
                          textStyle={{ fontSize: 11 }}
                        >
                          {key}
                        </Chip>
                      );
                    }
                    return null;
                  })}
                </View>
              </>
            )}

            {object.locked !== null && object.locked !== undefined && (
              <>
                <Divider style={styles.divider} />
                <List.Item
                  title="Locked"
                  description={object.isLocked ? 'Yes' : 'No'}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={object.isLocked ? 'lock' : 'lock-open'}
                      color={object.isLocked ? '#d32f2f' : '#4caf50'}
                    />
                  )}
                />
              </>
            )}
          </List.Section>
        </Card.Content>
      </Card>

      {classDefinition && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Class Definition</Title>
            <Paragraph>Name: {classDefinition.name}</Paragraph>
            {classDefinition.description && (
              <Paragraph>Description: {classDefinition.description}</Paragraph>
            )}
            {classDefinition.fields && (
              <Paragraph>Fields: {classDefinition.fields.length}</Paragraph>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 12,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  publishedChip: {
    backgroundColor: '#4caf50',
  },
  draftChip: {
    backgroundColor: '#ff9800',
  },
  divider: {
    marginVertical: 16,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  permissionChip: {
    marginBottom: 4,
  },
  permissionEnabled: {
    backgroundColor: '#e8f5e9',
  },
  permissionDisabled: {
    backgroundColor: '#ffebee',
  },
});
