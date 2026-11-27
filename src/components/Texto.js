import { Text } from 'react-native';
import { useTema } from '../hooks/useTema';

/**
 * Texto do app: já usa a fonte Atkinson, a cor do tema e o tamanho de letra escolhido.
 * variantes: texto | suave | titulo | subtitulo | destaque | pequeno
 */
export default function Texto({ variante = 'texto', forte, cor, style, children, ...resto }) {
  const { cores, fontes, tamanhos, fs } = useTema();

  const config = {
    texto: { tamanho: tamanhos.texto, cor: cores.texto },
    suave: { tamanho: tamanhos.texto, cor: cores.textoSuave },
    pequeno: { tamanho: tamanhos.pequeno, cor: cores.textoSuave },
    destaque: { tamanho: tamanhos.destaque, cor: cores.texto, forte: true },
    subtitulo: { tamanho: tamanhos.subtitulo, cor: cores.texto, forte: true },
    titulo: { tamanho: tamanhos.titulo, cor: cores.texto, forte: true },
  }[variante];

  const ehTitulo = variante === 'titulo' || variante === 'subtitulo';
  const tamanho = fs(config.tamanho);

  return (
    <Text
      accessibilityRole={ehTitulo ? 'header' : undefined}
      style={[
        {
          fontFamily: forte || config.forte ? fontes.forte : fontes.texto,
          fontSize: tamanho,
          lineHeight: Math.round(tamanho * (ehTitulo ? 1.2 : 1.5)),
          color: cor || config.cor,
        },
        style,
      ]}
      {...resto}
    >
      {children}
    </Text>
  );
}
