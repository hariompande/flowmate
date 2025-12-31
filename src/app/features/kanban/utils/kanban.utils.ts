/**
 * Generate dark text color matching the background color shade
 * Converts a light background color to a dark text color of the same hue
 *
 * @param backgroundColor - Hex color string (e.g., '#C0D5FF')
 * @returns Hex color string for dark text (e.g., '#1e3a8a')
 */
export function getTextColor(backgroundColor: string): string {
  if (!backgroundColor) {
    backgroundColor = '#000000';
  }
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  // Create dark version: keep hue and saturation, reduce lightness to 20-30%
  const darkL = Math.max(0.2, Math.min(0.3, l * 0.4));

  // Convert HSL back to RGB
  const c = (1 - Math.abs(2 * darkL - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = darkL - c / 2;

  let darkR = 0;
  let darkG = 0;
  let darkB = 0;

  if (h < 1 / 6) {
    darkR = c;
    darkG = x;
    darkB = 0;
  } else if (h < 2 / 6) {
    darkR = x;
    darkG = c;
    darkB = 0;
  } else if (h < 3 / 6) {
    darkR = 0;
    darkG = c;
    darkB = x;
  } else if (h < 4 / 6) {
    darkR = 0;
    darkG = x;
    darkB = c;
  } else if (h < 5 / 6) {
    darkR = x;
    darkG = 0;
    darkB = c;
  } else {
    darkR = c;
    darkG = 0;
    darkB = x;
  }

  const finalR = Math.round((darkR + m) * 255);
  const finalG = Math.round((darkG + m) * 255);
  const finalB = Math.round((darkB + m) * 255);

  // Convert to hex
  return `#${[finalR, finalG, finalB]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('')}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
