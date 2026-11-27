import { Pressable, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { alturaToque, raio } from '../constants/theme';

/**
 * Botão grande (mínimo 52px de altura), como os .btn do site.
 * variantes:
 *  principal  -> fundo vermelho (acento), texto branco
 *  secundario -> fundo branco, borda e texto vermelhos
 *  neutro     -> fundo branco, borda cinza escura
 *  verde      -> fundo verde (ações de contato)
 *  perigo     -> como o secundario, usado em "Excluir" e "Sair"
 */
export default function Botao({
  texto,
  icone,
  onPress,
  variante = 'principal',
  grande,
  carregando,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  style,
}) {
  const { cores } = useTema();
  const desativado = disabled || carregando;

  const v = {
    principal: { fundo: cores.acento, borda: cores.acento, cor: cores.sobreAcento },
    secundario: { fundo: cores.fundo, borda: cores.acento, cor: cores.acento },
    neutro: { fundo: cores.fundo, borda: cores.linhaForte, cor: cores.texto },
    verde: { fundo: cores.verde, borda: cores.verde, cor: cores.sobreVerde },
    perigo: { fundo: cores.fundo, borda: cores.acento, cor: cores.acento },
  }[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? texto}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!desativado, busy: !!carregando }}
      style={({ pressed }) => [
        styles.botao,
        grande && styles.grande,
        { backgroundColor: v.fundo, borderColor: v.borda },
        pressed && styles.pressionado,
        desativado && styles.desativado,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={v.cor} />
      ) : (
        <View style={styles.conteudo}>
          {icone && <Ionicons name={icone} size={24} color={v.cor} style={styles.icone} />}
          <Texto forte cor={v.cor} variante={grande ? 'destaque' : 'texto'} style={styles.texto}>
            {texto}
          </Texto>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: alturaToque,
    borderWidth: 3,
    borderRadius: raio,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grande: { minHeight: 60 },
  conteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  icone: { marginRight: 10 },
  texto: { textAlign: 'center', flexShrink: 1 },
  pressionado: { opacity: 0.8, transform: [{ translateY: 1 }] },
  desativado: { opacity: 0.55 },
});
