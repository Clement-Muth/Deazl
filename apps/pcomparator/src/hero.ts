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
        }
      }
    },
    dark: {
      colors: {
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
        }
      }
    }
  }
});
