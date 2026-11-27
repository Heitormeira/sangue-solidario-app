import { View, TextInput, StyleSheet } from 'react-native';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { alturaToque, raio } from '../constants/theme';

/**
 * Campo de texto com rótulo visível em cima (nunca só placeholder),
 * dica opcional e mensagem de erro embaixo.
 */
export default function CampoTexto({ rotulo, dica, erro, style, multiline, ...props }) {
  const { cores, fontes, tamanhos, fs } = useTema();

  return (
    <View style={[styles.campo, style]}>
      <Texto forte style={styles.rotulo}>
        {rotulo}
      </Texto>
      {dica ? (
        <Texto variante="pequeno" style={styles.dica}>
          {dica}
        </Texto>
      ) : null}
      <TextInput
        accessibilityLabel={rotulo}
        accessibilityHint={dica}
        placeholderTextColor={cores.textoSuave}
        multiline={multiline}
        style={[
          styles.entrada,
          {
            fontFamily: fontes.texto,
            fontSize: fs(tamanhos.texto),
            color: cores.texto,
            backgroundColor: cores.fundo,
            borderColor: erro ? cores.acento : cores.linhaForte,
          },
          multiline && styles.multilinha,
        ]}
        {...props}
      />
      {erro ? (
        <Texto forte cor={cores.acento} variante="pequeno" style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { marginBottom: 18 },
  rotulo: { marginBottom: 4 },
  dica: { marginBottom: 6 },
  entrada: {
    minHeight: alturaToque,
    borderWidth: 2,
    borderRadius: raio,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  multilinha: { minHeight: 110, textAlignVertical: 'top' },
  erro: { marginTop: 4 },
});
