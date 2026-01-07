/**
 * Media field renderers (image, video, etc.)
 * Supports both view and edit modes
 */

import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInstanceStore } from '../../store/instanceStore';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';
import { ElementPickerModal, SelectedElement } from '../pickers/ElementPickerModal';

// Image field - supports both view and edit modes
export const ImageField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
}) => {
  const { activeInstance } = useInstanceStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const isDisabled = field?.noteditable;

  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';

  const getImageUrl = (): string | null => {
    if (!value) return null;

    // Handle Pimcore structure: { image: { id, type }, hotspots, marker, crop }
    const imageData = value.image || value;
    if (!imageData || (!imageData.id && !imageData.fullPath && !imageData.path)) return null;

    const path = imageData.fullPath || imageData.path || imageData.fullpath || imageData.src || imageData.filename;
    if (path) return `${baseUrl}${decodeURIComponent(path)}`;
    if (imageData.id) return `${baseUrl}/pimcore-studio/api/assets/${imageData.id}/image/stream/preview`;
    return null;
  };

  const handleSelect = (element: SelectedElement) => {
    // Pimcore expects: { image: { type: "asset", id: X }, hotspots: [], marker: [], crop: {} }
    onFieldChange?.({
      image: {
        type: 'asset',
        id: element.id,
      },
      hotspots: [],
      marker: [],
      crop: {},
    });
    setPickerVisible(false);
  };

  const handleClear = () => {
    // Clear with empty structure
    onFieldChange?.({
      image: null,
      hotspots: [],
      marker: [],
      crop: {},
    });
  };

  const imageUrl = getImageUrl();

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        {imageUrl ? (
          <View style={styles.imageEditorPreview}>
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
            <View style={styles.imageEditorActions}>
              {!isDisabled && (
                <>
                  <Pressable onPress={() => setPickerVisible(true)} style={styles.imageEditorButton}>
                    <MaterialCommunityIcons name="swap-horizontal" size={20} color="#6200ee" />
                    <Text style={styles.imageEditorButtonText}>Ändern</Text>
                  </Pressable>
                  <Pressable onPress={handleClear} style={styles.imageEditorButton}>
                    <MaterialCommunityIcons name="close" size={20} color="#f44336" />
                    <Text style={[styles.imageEditorButtonText, { color: '#f44336' }]}>Entfernen</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => !isDisabled && setPickerVisible(true)}
            style={[styles.imageEditorPlaceholder, isDisabled && { opacity: 0.5 }]}
          >
            <MaterialCommunityIcons name="image-plus" size={40} color="#999" />
            <Text style={styles.imageEditorPlaceholderText}>Bild auswählen</Text>
          </Pressable>
        )}

        <ElementPickerModal
          visible={pickerVisible}
          onDismiss={() => setPickerVisible(false)}
          onSelect={handleSelect}
          title="Bild auswählen"
          allowedTypes={['asset']}
          filterAssetTypes={['image']}
        />
      </FieldWrapper>
    );
  }

  // View mode
  if (!imageUrl) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const imageData = value?.image || value;
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View>
        <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
        {imageData?.id && <Text style={styles.imageIdLabel}>ID: {imageData.id}</Text>}
      </View>
    </FieldWrapper>
  );
};

// Image Gallery field - supports both view and edit modes
export const ImageGalleryField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
}) => {
  const { activeInstance } = useInstanceStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const isDisabled = field?.noteditable;

  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';
  const images = Array.isArray(value) ? value : [];

  const handleMultiSelect = (elements: SelectedElement[]) => {
    // Each gallery item follows same structure as single image
    const newImages = elements.map(element => ({
      image: {
        type: 'asset',
        id: element.id,
      },
      hotspots: [],
      marker: [],
      crop: {},
    }));

    // Filter out images that are already in the gallery
    const existingIds = new Set(images.map(i => i.image?.id).filter(Boolean));
    const uniqueNewImages = newImages.filter(img => !existingIds.has(img.image.id));

    // Append new images to existing gallery
    const combinedImages = [...images, ...uniqueNewImages];
    onFieldChange?.(combinedImages);
    setPickerVisible(false);
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onFieldChange?.(newImages);
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.galleryScrollEdit}
          contentContainerStyle={styles.galleryScrollContent}
        >
          {images.map((item, index) => {
            const image = item.image;
            if (!image || !image.id) return null;
            const imageUrl = image.fullPath
              ? `${baseUrl}${decodeURIComponent(image.fullPath)}`
              : `${baseUrl}/pimcore-studio/api/assets/${image.id}/image/stream/preview`;
            return (
              <View key={index} style={styles.galleryEditItem}>
                <Image source={{ uri: imageUrl }} style={styles.galleryImageEdit} resizeMode="cover" />
                {!isDisabled && (
                  <Pressable
                    onPress={() => handleRemove(index)}
                    style={styles.galleryRemoveButton}
                  >
                    <MaterialCommunityIcons name="close-circle" size={22} color="#fff" />
                  </Pressable>
                )}
              </View>
            );
          })}
          {!isDisabled && (
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={styles.galleryAddButton}
            >
              <MaterialCommunityIcons name="plus" size={32} color="#999" />
            </Pressable>
          )}
        </ScrollView>

        <ElementPickerModal
          visible={pickerVisible}
          onDismiss={() => setPickerVisible(false)}
          onSelect={() => {}}
          onMultiSelect={handleMultiSelect}
          title="Bilder auswählen"
          allowedTypes={['asset']}
          filterAssetTypes={['image']}
          multiSelect
          selectedIds={images.map(i => i.image?.id).filter(Boolean)}
        />
      </FieldWrapper>
    );
  }

  // View mode
  if (images.length === 0) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
        {images.map((item, index) => {
          const image = item.image;
          if (!image || !image.id) return null;
          const imageUrl = image.fullPath
            ? `${baseUrl}${decodeURIComponent(image.fullPath)}`
            : `${baseUrl}/pimcore-studio/api/assets/${image.id}/image/stream/preview`;
          return (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={styles.galleryImage}
              resizeMode="cover"
            />
          );
        })}
      </ScrollView>
    </FieldWrapper>
  );
};

// Video field - supports both view and edit modes
export const VideoField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
}) => {
  const { activeInstance } = useInstanceStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const isDisabled = field?.noteditable;

  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';
  const videoData = value?.data || value;
  const hasVideo = videoData && (videoData.id || value?.id);

  const handleSelect = (element: SelectedElement) => {
    onFieldChange?.({
      type: 'asset',
      data: {
        id: element.id,
        type: 'asset',
        fullPath: element.fullpath || element.fullPath,
        filename: element.filename,
      },
    });
    setPickerVisible(false);
  };

  const handleClear = () => {
    onFieldChange?.(null);
  };

  // Edit mode
  if (isEditing) {
    const videoName = videoData?.filename || videoData?.fullPath || `Video ID: ${videoData?.id || value?.id}`;

    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        {hasVideo ? (
          <View style={styles.videoEditorPreview}>
            <View style={styles.videoEditorInfo}>
              <MaterialCommunityIcons name="video" size={32} color="#f44336" />
              <Text style={styles.videoEditorName} numberOfLines={1}>{videoName}</Text>
            </View>
            <View style={styles.imageEditorActions}>
              {!isDisabled && (
                <>
                  <Pressable onPress={() => setPickerVisible(true)} style={styles.imageEditorButton}>
                    <MaterialCommunityIcons name="swap-horizontal" size={20} color="#6200ee" />
                    <Text style={styles.imageEditorButtonText}>Ändern</Text>
                  </Pressable>
                  <Pressable onPress={handleClear} style={styles.imageEditorButton}>
                    <MaterialCommunityIcons name="close" size={20} color="#f44336" />
                    <Text style={[styles.imageEditorButtonText, { color: '#f44336' }]}>Entfernen</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => !isDisabled && setPickerVisible(true)}
            style={[styles.imageEditorPlaceholder, isDisabled && { opacity: 0.5 }]}
          >
            <MaterialCommunityIcons name="video-plus" size={40} color="#999" />
            <Text style={styles.imageEditorPlaceholderText}>Video auswählen</Text>
          </Pressable>
        )}

        <ElementPickerModal
          visible={pickerVisible}
          onDismiss={() => setPickerVisible(false)}
          onSelect={handleSelect}
          title="Video auswählen"
          allowedTypes={['asset']}
          filterAssetTypes={['video']}
        />
      </FieldWrapper>
    );
  }

  // View mode
  if (!hasVideo) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const posterPath = videoData?.poster?.fullPath || videoData?.posterAsset?.fullPath;
  const videoType = videoData?.type || 'asset';
  const videoId = videoData?.id || value?.id;

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.videoContainer}>
        {posterPath ? (
          <Image
            source={{ uri: `${baseUrl}${decodeURIComponent(posterPath)}` }}
            style={styles.videoPoster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <MaterialCommunityIcons name="video" size={48} color="#999" />
          </View>
        )}
        <View style={styles.videoOverlay}>
          <MaterialCommunityIcons name="play-circle" size={48} color="#fff" />
        </View>
        <View style={styles.videoInfoBadge}>
          <Text style={styles.videoType}>{videoType}</Text>
          {videoId && <Text style={styles.videoId}>ID: {videoId}</Text>}
        </View>
      </View>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  // View mode styles
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageIdLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  galleryScroll: {
    marginHorizontal: -4,
  },
  galleryScrollEdit: {
    marginHorizontal: -4,
  },
  galleryScrollContent: {
    paddingVertical: 4,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  galleryImageEdit: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  videoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPoster: {
    width: '100%',
    height: 200,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoInfoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 8,
  },
  videoType: {
    fontSize: 11,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  videoId: {
    fontSize: 11,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // Edit mode styles
  imageEditorPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  imageEditorActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  imageEditorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageEditorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200ee',
  },
  imageEditorPlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  imageEditorPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  videoEditorPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  videoEditorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  videoEditorName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  // Gallery edit styles
  galleryEditItem: {
    position: 'relative',
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  galleryAddButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Register media field types
export const mediaFieldTypes = {
  image: ImageField,
  hotspotimage: ImageField,
  imageGallery: ImageGalleryField,
  video: VideoField,
};
