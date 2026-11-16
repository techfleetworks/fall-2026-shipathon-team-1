/** Tokens mirror the My Village design system (light theme). */
export default {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        surface: { 100: "#F8F7F5", 200: "#f2efe8", 300: "#e3e1df", inverse: "#29251C" },
        ink: {
          DEFAULT: "#29251C",
          muted: "#5B5850",
          subtle: "#736E65",
          inverse: "#F8F7F5",
          "on-brand": "#29251C",
        },
        brand: {
          DEFAULT: "#EEAF1B",
          hover: "#be8b13",
          disabled: "#90680c",
          subtle: "#fedcb2",
          muted: "#e8d6b0",
        },
        accent: { DEFAULT: "#FF9358", subtle: "#ffcbb9" },
        line: { DEFAULT: "#d4cec2", subtle: "#e3e1df", strong: "#aca79d" },
        success: "#6f6651",
        error: "#B84E00",
        warning: "#be8b13",
      },
      fontFamily: { sans: ['"Kumbh Sans"', "system-ui", "sans-serif"] },
      fontSize: {
        display: ["28px", { lineHeight: "34px", fontWeight: "700" }],
        h1: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        h2: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "22px", fontWeight: "500" }],
        body: ["15px", { lineHeight: "22px" }],
        label: ["14px", { lineHeight: "18px", fontWeight: "500" }],
        btn: ["16px", { lineHeight: "20px", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "16px" }],
        tab: ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
      borderRadius: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg: "0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.04)",
      },
    },
  },
};
