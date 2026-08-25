/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16281D",
        ink2: "#1D3527",
        ink3: "#274633",
        brass: "#B8874C",
        brassLight: "#DDB37F",
        linen: "#EAEDE1",
        linen2: "#DFE4D2",
        paper: "#F7F8F1",
        moss: "#3F7A56",
        mossLight: "#DCEEE1",
        inkText: "#142019",
        slateSoft: "#5B6B60",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        body: ['"Inter"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,26,46,0.06), 0 10px 28px -10px rgba(20,26,46,0.16)",
        cardHover: "0 6px 14px rgba(20,26,46,0.10), 0 20px 44px -14px rgba(20,26,46,0.24)",
        panel: "0 24px 70px -24px rgba(20,26,46,0.35)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 32s) linear infinite",
        floatSlow: "floatSlow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
