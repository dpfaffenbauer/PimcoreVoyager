/**
 * Ant Design Mobile RN Theme Configuration
 * Based on existing THEME constants from constants.ts
 */

import { THEME } from './constants';

export const antTheme = {
  // Primary colors
  brand_primary: THEME.PRIMARY_COLOR,           // #6200ee
  brand_primary_tap: '#4a00b4',                 // Darker variant for pressed state

  // Text colors
  color_text_base: THEME.TEXT_PRIMARY,          // #333
  color_text_caption: THEME.TEXT_SECONDARY,     // #666
  color_text_disabled: THEME.TEXT_DISABLED,     // #999
  color_text_placeholder: THEME.TEXT_DISABLED,  // #999

  // Background colors
  fill_base: THEME.BACKGROUND_WHITE,            // #fff
  fill_body: THEME.BACKGROUND_LIGHT_GRAY,       // #f5f5f5
  fill_tap: '#f0f0f0',
  fill_disabled: '#ddd',
  fill_mask: 'rgba(0, 0, 0, 0.4)',

  // Border colors
  border_color_base: '#e0e0e0',

  // Button specific
  primary_button_fill: THEME.PRIMARY_COLOR,
  primary_button_fill_tap: '#4a00b4',
  ghost_button_color: THEME.PRIMARY_COLOR,
  ghost_button_fill_tap: `${THEME.PRIMARY_COLOR}10`,

  // Input specific
  input_color_icon: THEME.PRIMARY_COLOR,
  input_color_icon_tap: THEME.PRIMARY_COLOR,

  // Switch
  switch_fill: THEME.PRIMARY_COLOR,
  switch_unchecked: '#e5e5e5',

  // Checkbox
  brand_important: THEME.PRIMARY_COLOR,

  // Activity indicator
  activity_indicator_color: THEME.PRIMARY_COLOR,

  // Tag colors
  tag_height: 28,
  tag_small_height: 20,

  // Spacing
  h_spacing_sm: 8,
  h_spacing_md: 16,
  h_spacing_lg: 24,
  v_spacing_sm: 8,
  v_spacing_md: 16,
  v_spacing_lg: 24,

  // Border radius
  radius_xs: 4,
  radius_sm: 8,
  radius_md: 12,
  radius_lg: 20,

  // Font sizes
  font_size_icontext: 10,
  font_size_caption_sm: 12,
  font_size_base: 14,
  font_size_subhead: 15,
  font_size_caption: 16,
  font_size_heading: 17,
};
