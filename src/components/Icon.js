import React from 'react';
import { Text } from 'react-native';

// The design draws every icon with Material Symbols Rounded and varies two of
// its axes: FILL (outlined vs solid) and wght. Those are variable-font axes,
// which React Native cannot set at runtime — so the four instances the design
// actually uses are bundled as separate subset families and picked here.
// Glyphs are addressed by codepoint rather than by ligature name so rendering
// never depends on the platform text engine applying GSUB substitutions.
const FAMILY = {
  '0-400': 'MaterialSymbolsRounded_F0_W400',
  '0-700': 'MaterialSymbolsRounded_F0_W700',
  '1-400': 'MaterialSymbolsRounded_F1_W400',
  '1-700': 'MaterialSymbolsRounded_F1_W700',
};

export const GLYPHS = {
  account_balance: '\ue84f',
  add: '\ue145',
  apps: '\ue5c3',
  arrow_back: '\ue5c4',
  arrow_forward: '\ue5c8',
  auto_awesome: '\ue65f',
  auto_awesome_motion: '\ue661',
  auto_fix_high: '\ue663',
  balance: '\ueaf6',
  bolt: '\uea0b',
  bookmark: '\ue8e7',
  campaign: '\uef49',
  celebration: '\uea65',
  check: '\ue668',
  check_circle: '\uf0be',
  chevron_right: '\ue5cc',
  close: '\ue5cd',
  corporate_fare: '\uf1d0',
  delete_forever: '\ue92b',
  description: '\ue873',
  draw: '\ue746',
  eco: '\uea35',
  edit_document: '\uf88c',
  emoji_events: '\uea23',
  error: '\uf8b6',
  event_available: '\ue614',
  fingerprint: '\ue90d',
  flag: '\uf0c6',
  flag_circle: '\ueaf8',
  grid_view: '\ue9b0',
  history: '\ue8b3',
  home: '\ue9b2',
  hourglass_bottom: '\uea5c',
  how_to_reg: '\ue174',
  info: '\ue88e',
  insights: '\uf092',
  ios_share: '\ue6b8',
  local_fire_department: '\uef55',
  lock: '\ue899',
  logout: '\ue9ba',
  mail: '\ue159',
  military_tech: '\uea3f',
  monitor_heart: '\ueaa2',
  notifications: '\ue7f5',
  person: '\uf0d3',
  pets: '\ue91d',
  phonelink_lock: '\uf2be',
  photo_camera: '\ue412',
  place: '\uf1db',
  reply: '\ue15e',
  rocket_launch: '\ueb9b',
  school: '\ue80c',
  search: '\uef7a',
  search_off: '\uea76',
  security: '\ue32a',
  shield: '\ue9e0',
  shield_person: '\uf650',
  show_chart: '\ue6e1',
  smartphone: '\ue7ba',
  sms: '\ue625',
  star: '\uf09a',
  task_alt: '\ue2e6',
  travel_explore: '\ue2db',
  trending_up: '\ue8e5',
  verified: '\uef76',
  verified_user: '\uf013',
  visibility: '\ue8f4',
  visibility_off: '\ue8f5',
  vpn_key: '\ue0da',
  undo: '\ue166',
  waves: '\ue176',
};

// `name` is the design's own glyph name and `fill`/`weight` its FILL and wght
// values, so call sites read the same as the markup they came from.
export default function Icon({ name, size = 17, color = '#fff', fill = 0, weight = 400, style }) {
  const glyph = GLYPHS[name];
  if (!glyph) return null;
  const family = FAMILY[`${fill ? 1 : 0}-${weight >= 600 ? 700 : 400}`];
  return (
    <Text
      style={[
        {
          fontFamily: family,
          fontSize: size,
          lineHeight: size,
          color,
          textAlign: 'center',
          // Android otherwise pads the line box and knocks the glyph off centre.
          includeFontPadding: false,
        },
        style,
      ]}
      allowFontScaling={false}
      selectable={false}
    >
      {glyph}
    </Text>
  );
}
