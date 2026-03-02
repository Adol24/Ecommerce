export interface ColorPalette {
  primary: string
  primaryForeground: string
  ring: string
}

export interface ColorTheme {
  id: string
  name: string
  description: string
  swatch: string          // hex approx for UI preview only
  light: ColorPalette
  dark: ColorPalette
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "emerald",
    name: "Esmeralda",
    description: "Verde vibrante y profesional",
    swatch: "#059669",
    light: {
      primary: "oklch(0.627 0.194 149.9)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.75 0.13 149.9)",
    },
    dark: {
      primary: "oklch(0.627 0.194 149.9)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.5 0.15 149.9)",
    },
  },
  {
    id: "blue",
    name: "Azul",
    description: "Azul clásico y confiable",
    swatch: "#2563EB",
    light: {
      primary: "oklch(0.546 0.219 262.4)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.7 0.14 262.4)",
    },
    dark: {
      primary: "oklch(0.623 0.214 259.8)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.48 0.17 262.4)",
    },
  },
  {
    id: "violet",
    name: "Violeta",
    description: "Morado elegante y creativo",
    swatch: "#7C3AED",
    light: {
      primary: "oklch(0.558 0.239 283.5)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.72 0.15 283.5)",
    },
    dark: {
      primary: "oklch(0.606 0.248 278.6)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.46 0.19 283.5)",
    },
  },
  {
    id: "pink",
    name: "Rosa",
    description: "Rosa moderno y llamativo",
    swatch: "#DB2777",
    light: {
      primary: "oklch(0.572 0.213 350.6)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.74 0.14 350.6)",
    },
    dark: {
      primary: "oklch(0.656 0.218 354.3)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.48 0.17 350.6)",
    },
  },
  {
    id: "rose",
    name: "Rojo Rosa",
    description: "Rojo rosado intenso",
    swatch: "#E11D48",
    light: {
      primary: "oklch(0.547 0.245 17.4)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.72 0.16 17.4)",
    },
    dark: {
      primary: "oklch(0.637 0.228 14.7)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.46 0.2 17.4)",
    },
  },
  {
    id: "red",
    name: "Rojo",
    description: "Rojo intenso y energético",
    swatch: "#DC2626",
    light: {
      primary: "oklch(0.577 0.245 27.3)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.72 0.16 27.3)",
    },
    dark: {
      primary: "oklch(0.628 0.235 27.0)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.46 0.2 27.3)",
    },
  },
  {
    id: "orange",
    name: "Naranja",
    description: "Naranja cálido y dinámico",
    swatch: "#EA580C",
    light: {
      primary: "oklch(0.631 0.213 43.7)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.76 0.14 43.7)",
    },
    dark: {
      primary: "oklch(0.702 0.209 44.7)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.5 0.17 43.7)",
    },
  },
  {
    id: "amber",
    name: "Ámbar",
    description: "Dorado cálido y premium",
    swatch: "#D97706",
    light: {
      primary: "oklch(0.62 0.17 73.0)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.76 0.12 73.0)",
    },
    dark: {
      primary: "oklch(0.764 0.179 72.1)",
      primaryForeground: "oklch(0.2 0 0)",
      ring: "oklch(0.55 0.14 73.0)",
    },
  },
  {
    id: "teal",
    name: "Teal",
    description: "Verde azulado fresco",
    swatch: "#0D9488",
    light: {
      primary: "oklch(0.567 0.138 193.7)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.72 0.09 193.7)",
    },
    dark: {
      primary: "oklch(0.627 0.142 193.5)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.46 0.11 193.7)",
    },
  },
  {
    id: "indigo",
    name: "Índigo",
    description: "Azul profundo y sofisticado",
    swatch: "#4F46E5",
    light: {
      primary: "oklch(0.543 0.249 265.4)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.7 0.16 265.4)",
    },
    dark: {
      primary: "oklch(0.585 0.236 268.1)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.45 0.2 265.4)",
    },
  },
  {
    id: "fuchsia",
    name: "Fucsia",
    description: "Magenta audaz y moderno",
    swatch: "#C026D3",
    light: {
      primary: "oklch(0.59 0.249 317.5)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.74 0.16 317.5)",
    },
    dark: {
      primary: "oklch(0.65 0.244 318.0)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.48 0.2 317.5)",
    },
  },
  {
    id: "slate",
    name: "Pizarra",
    description: "Gris oscuro neutro y clásico",
    swatch: "#475569",
    light: {
      primary: "oklch(0.446 0.03 264.0)",
      primaryForeground: "oklch(1 0 0)",
      ring: "oklch(0.65 0.02 264.0)",
    },
    dark: {
      primary: "oklch(0.65 0.02 264.0)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.45 0.02 264.0)",
    },
  },
]

export const DEFAULT_COLOR_THEME_ID = "emerald"

export function getColorTheme(id: string | undefined): ColorTheme {
  return (
    COLOR_THEMES.find((t) => t.id === id) ??
    COLOR_THEMES.find((t) => t.id === DEFAULT_COLOR_THEME_ID)!
  )
}

export function buildThemeCss(theme: ColorTheme): string {
  return `
:root {
  --primary: ${theme.light.primary};
  --primary-foreground: ${theme.light.primaryForeground};
  --ring: ${theme.light.ring};
  --sidebar-primary: ${theme.light.primary};
  --sidebar-primary-foreground: ${theme.light.primaryForeground};
}
.dark {
  --primary: ${theme.dark.primary};
  --primary-foreground: ${theme.dark.primaryForeground};
  --ring: ${theme.dark.ring};
  --sidebar-primary: ${theme.dark.primary};
  --sidebar-primary-foreground: ${theme.dark.primaryForeground};
}`.trim()
}
