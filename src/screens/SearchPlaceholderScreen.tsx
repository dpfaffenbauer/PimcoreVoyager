/**
 * Search Placeholder Screen
 * Wrapper for PlaceholderScreen with Search-specific props
 */

import React from 'react';
import PlaceholderScreen from './PlaceholderScreen';

export default function SearchPlaceholderScreen() {
  return (
    <PlaceholderScreen
      title="Search"
      icon="magnify"
      description="Search functionality will be available in a future version."
    />
  );
}
