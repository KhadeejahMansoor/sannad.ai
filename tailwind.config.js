/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'orange-inline': '#f97316',
        'green-inline': '#523230',
        'main-color': '#1f2937',
        'purple': '#8b5cf6',
        'secondary-dark': '#374151',
        'variable-collection-button-green': '#059669',
        'variable-collection-unclicked-green': '#523230',
        'variable-collection-clicked-green': '#047857',
      },
      boxShadow: {
        'button-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'drop-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'toggle-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
module.exports = {
  // ...
  plugins: [require('tailwind-scrollbar-hide')],
}

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
};
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // or wherever your files are
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
};

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
      }
    }
  }
}