import { ScrollView, View, StyleSheet } from 'react-native';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { espaco } from '../constants/theme';

/**
 * Container das telas com rolagem.
 * contentInsetAdjustmentBehavior="automatic": no iOS (SDK 58) o conteúdo
 * não fica escondido atrás do cabeçalho.
 */
export default function Tela({ titulo, subtitulo, children, refreshControl }) {
  const { cores } = useTema();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={styles.conteudo}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      refreshControl={refreshControl}
    >
      {titulo ? (
        <View style={styles.cabecalho}>
          <Texto variante="titulo">{titulo}</Texto>
          {subtitulo ? (
            <Texto variante="suave" style={styles.subtitulo}>
              {subtitulo}
            </Texto>
          ) : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

/** Título de seção, com a linha de separação do site (.secao). */
export function Secao({ titulo, children, primeira }) {
  const { cores } = useTema();
  return (
    <View style={[styles.secao, !primeira && { borderTopColor: cores.linha, borderTopWidth: 2, paddingTop: espaco.g }]}>
      {titulo ? (
        <Texto variante="subtitulo" style={styles.secaoTitulo}>
          {titulo}
        </Texto>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: espaco.tela, paddingBottom: 48 },
  cabecalho: { marginBottom: espaco.g },
  subtitulo: { marginTop: 6 },
  secao: { marginTop: 28 },
  secaoTitulo: { marginBottom: 14 },
});
