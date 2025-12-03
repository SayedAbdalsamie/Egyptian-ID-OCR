/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1E2A38',  // dark blue-gray background
        surface: '#2C3E50',     // medium blue-gray for cards/surfaces
        primary: '#4A90E2',     // bright blue for primary actions
        secondary: '#357ABD',   // medium blue for secondary actions
        accent: '#1C5980',      // dark blue for accents
        success: '#2ECC71',     // green for success states
        error: '#E74C3C',       // red for error states
      },
    },
  },


  plugins: [],
}
