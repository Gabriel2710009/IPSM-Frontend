module.exports = {
  content: [
    './index.html',
    './reglamento.html',
    './pages/**/*.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        institucional: '#002855',
        dorado: '#C5A059',
        confort: '#F8FAFC'
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif']
      }
    }
  },
  plugins: []
};
