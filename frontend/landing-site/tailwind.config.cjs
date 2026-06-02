module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#010828",
        cream: "#EFF4FF",
        neon: "#6FFF00",
      },
      fontFamily: {
        grotesk: ["Anton", "sans-serif"],
        condiment: ["Condiment", "cursive"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
