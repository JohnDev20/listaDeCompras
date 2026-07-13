/**
 * Semantic design tokens for Lista de Compras.
 *
 * Palette: fresh market green with warm cream surfaces — evokes a produce
 * aisle chalkboard, not a generic productivity app.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1C2321',
    tint: '#16A34A',

    // Core surfaces
    background: '#FAF7F0',
    foreground: '#1C2321',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#1C2321',

    // Primary action color (buttons, links, active states)
    primary: '#16A34A',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#EFEAE0',
    secondaryForeground: '#1C2321',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F1EDE3',
    mutedForeground: '#8A8477',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FDECC8',
    accentForeground: '#7A4A00',

    // Destructive actions (delete, error states)
    destructive: '#DC4C3E',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#E7E1D3',
    input: '#E7E1D3',

    // Success / checked state
    success: '#16A34A',

    // WhatsApp brand accent for the share action
    whatsapp: '#25D366',
  },

  dark: {
    text: '#F4F1E8',
    tint: '#34D399',

    background: '#14181A',
    foreground: '#F4F1E8',

    card: '#1D2321',
    cardForeground: '#F4F1E8',

    primary: '#34D399',
    primaryForeground: '#0B1210',

    secondary: '#232A27',
    secondaryForeground: '#F4F1E8',

    muted: '#232A27',
    mutedForeground: '#9AA39C',

    accent: '#3A3020',
    accentForeground: '#FDECC8',

    destructive: '#F2685A',
    destructiveForeground: '#14181A',

    border: '#2A3230',
    input: '#2A3230',

    success: '#34D399',
    whatsapp: '#25D366',
  },

  // Border radius (in px). Applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
