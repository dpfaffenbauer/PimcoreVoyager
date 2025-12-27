/**
 * Notifications Placeholder Screen
 * Wrapper for PlaceholderScreen with Notifications-specific props
 */

import React from 'react';
import PlaceholderScreen from './PlaceholderScreen';

export default function NotificationsPlaceholderScreen() {
  return (
    <PlaceholderScreen
      title="Notifications"
      icon="bell"
      description="Notifications functionality will be available in a future version."
    />
  );
}
