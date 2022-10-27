import gradient from 'gradient-string'

const greet = gradient([
  { color: '#00DC82', pos: 0 },
  { color: '#80EEC0', pos: 0.3 },
  { color: '#D6FFEE', pos: 0.7 },
]).multiline(['   ███╗   ██╗██╗   ██╗██╗  ██╗████████╗', '   ████╗  ██║██║   ██║╚██╗██╔╝╚══██╔══╝', '   ██╔██╗ ██║██║   ██║ ╚███╔╝    ██║   ', '   ██║╚██╗██║██║   ██║ ██╔██╗    ██║   ', '   ██║ ╚████║╚██████╔╝██╔╝ ██╗   ██║   - The Hybrid Vue Framework', '   ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝'].join('\n'))

export default greet
