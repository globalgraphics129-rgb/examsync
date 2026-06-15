/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {},
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "gutter": "16px",
              "section-gap": "32px",
              "container-margin": "24px",
              "card-padding": "20px",
              "unit": "4px"
      },
      "fontFamily": {
              "display-lg": ["Sora"],
              "body-md": ["Inter"],
              "body-lg": ["Inter"],
              "label-md": ["Inter"],
              "headline-lg": ["Sora"],
              "label-sm": ["Inter"],
              "headline-lg-mobile": ["Sora"],
              "body-sm": ["Inter"],
              "headline-md": ["Sora"]
      },
      "fontSize": {
              "display-lg": ["40px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
              "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
              "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
              "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
              "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "600"}],
              "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
              "headline-lg-mobile": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
              "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
              "headline-md": ["20px", {"lineHeight": "1.4", "fontWeight": "600"}]
      }
    },
  },
  plugins: [],
}
