/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Esto le dice a Tailwind que escanee todos los archivos .html y .ts dentro de la carpeta src
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'), // Añade DaisyUI como plugin
  ],
  // (Opcional) Configuración específica de DaisyUI para temas, etc.
  // Si no la pones, usará los temas por defecto (light y dark según el sistema)
  daisyui: {
    themes: [ // Puedes elegir los temas que quieres o poner 'true' para todos
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
    // styled: true,
    // base: true, // DaisyUI añade estilos base globales (por defecto true)
    // utils: true, // DaisyUI añade clases de utilidad (por defecto true)
  },
}