/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'w-full', 'border', 'border-gray-300', 'rounded', 'px-3', 'py-2', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'transition-colors', 'bg-white',
    'block', 'text-sm', 'font-bold', 'text-gray-700', 'mb-1',
    'p-6', 'rounded-lg', 'shadow-sm', 'border-gray-200',
    'bg-gray-100', 'text-gray-800',
    'bg-blue-100', 'text-blue-800',
    'bg-purple-100', 'text-purple-800',
    'bg-orange-100', 'text-orange-800',
    'bg-green-100', 'text-green-800',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}