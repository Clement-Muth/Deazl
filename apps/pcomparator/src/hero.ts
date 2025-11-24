import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#d3d3ff",
          "50": "#f3f3ff",
          "100": "#e9e8ff",
          "200": "#d3d3ff",
          "300": "#b6b3ff",
          "400": "#9288fd",
          "500": "#6e58fa",
          "600": "#5a36f1",
          "700": "#4c24dd",
          "800": "#3f1dba",
          "900": "#351a98",
          foreground: "#000000"
        },
        divider: "#E6E6E8"
      }
    },
    dark: {
      colors: {
        // Ton échelle primaire inversée (préservée)
        primary: {
          DEFAULT: "#4c24dd",
          "50": "#351a98",
          "100": "#3f1dba",
          "200": "#4c24dd",
          "300": "#5a36f1",
          "400": "#6e58fa",
          "500": "#9288fd",
          "600": "#b6b3ff",
          "700": "#d3d3ff",
          "800": "#e9e8ff",
          "900": "#f3f3ff",
          foreground: "#ffffff"
        },

        // 🎨 ⬇️ Dark mode “real” tokens
        background: "#0D0D0F", // fond principal
        foreground: "#ffffff", // texte principal

        // surfaces (cards, inputs, menus…)
        content1: "#151518", // surfaces de base
        content2: "#1C1C20", // surfaces élevées (cards)
        content3: "#26262B", // hover
        content4: "#2F2F35", // active / pressed

        // gris cohérents (Linear-like)
        default: {
          "50": "#1A1A1D",
          "100": "#232326",
          "200": "#2C2C30",
          "300": "#3A3A3F",
          "400": "#4A4A51",
          "500": "#5A5A63",
          "600": "#7A7A86",
          "700": "#A3A3AD",
          "800": "#CCCCD1",
          "900": "#E6E6E8",
          foreground: "#ffffff"
        },

        // Bordures + dividers
        divider: "#ffffff",

        // Focus (hérité de ton violet)
        focus: "#6e58fa",

        // Danger (rouge contrôlé pour dark)
        danger: {
          DEFAULT: "#E5484D",
          foreground: "#ffffff"
        },

        // Success (vert lumineux)
        success: {
          DEFAULT: "#4CC38A",
          foreground: "#000000"
        },

        // Warning
        warning: {
          DEFAULT: "#F5A623",
          foreground: "#000000"
        }
      }
    }
  }
});
