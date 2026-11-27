/**
 * Tema do app, com as mesmas cores do app/globals.css do site.
 * Pensado para pessoas idosas: letra grande, contraste alto e botões grandes.
 */

// Cores normais (iguais ao :root do site)
const normal = {
  fundo: '#ffffff',
  faixa: '#f2f2f2',
  texto: '#111111',
  textoSuave: '#3d3d3d',
  linha: '#c4c4c4',
  linhaForte: '#5c5c5c',

  acento: '#a01717',
  acentoEscuro: '#780f0f',
  sobreAcento: '#ffffff',
  acentoFundo: '#fbeeee',

  verde: '#1b5e20',
  sobreVerde: '#ffffff',
  verdeFundo: '#e8f3e9',

  alertaFundo: '#fff6d6',
  alertaBorda: '#8a6a00',

  foco: '#0b57d0',
};

// Alto contraste (igual ao html[data-contraste='alto'] do site): fundo preto e destaque amarelo
const altoContraste = {
  fundo: '#000000',
  faixa: '#000000',
  texto: '#ffffff',
  textoSuave: '#f2f2f2',
  linha: '#ffffff',
  linhaForte: '#ffffff',

  acento: '#ffd400',
  acentoEscuro: '#ffe770',
  sobreAcento: '#000000',
  acentoFundo: '#1a1a1a',

  verde: '#39ff7a',
  sobreVerde: '#000000',
  verdeFundo: '#0b2a14',

  alertaFundo: '#1a1a1a',
  alertaBorda: '#ffd400',

  foco: '#4dc3ff',
};

export const paletas = { normal, altoContraste };

// Nomes registrados no useFonts do _layout (Atkinson Hyperlegible, a mesma fonte do site)
export const fontes = {
  texto: 'AtkinsonHyperlegible_400Regular',
  forte: 'AtkinsonHyperlegible_700Bold',
};

// Os 3 tamanhos de letra do site (20px, 24px e 28px) viram multiplicadores
export const escalas = { 1: 1, 2: 1.2, 3: 1.4 };

// Tamanhos base de texto (multiplicados pela escala)
export const tamanhos = {
  pequeno: 16,
  texto: 18,
  destaque: 20,
  subtitulo: 23,
  titulo: 30,
};

export const espaco = {
  p: 8,
  m: 16,
  g: 24,
  tela: 20,
};

export const raio = 8;

// Altura mínima de qualquer área de toque (o pedido é 48; usamos um pouco mais)
export const alturaToque = 52;
