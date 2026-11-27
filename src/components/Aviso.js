import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { raio } from '../constants/theme';

/**
 * Caixa de aviso (erro, sucesso ou informação), como o componente Aviso do site.
 * accessibilityLiveRegion faz o leitor de tela anunciar a mensagem quando ela aparece.
 */
export default function Aviso({ tipo = 'info', children, style }) {
  const { cores } = useTema();

  const v = {
    erro: { fundo: cores.acentoFundo, borda: cores.acento, icone: 'alert-circle' },
    sucesso: { fundo: cores.verdeFundo, borda: cores.verde, icone: 'checkmark-circle' },
    info: { fundo: cores.alertaFundo, borda: cores.alertaBorda, icone: 'information-circle' },
  }[tipo];

  if (!children) return null;

  return (
    <View
      accessibilityRole={tipo === 'erro' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
      style={[styles.caixa, { backgroundColor: v.fundo, borderColor: v.borda }, style]}
    >
      <Ionicons name={v.icone} size={26} color={v.borda} style={styles.icone} />
      <Texto style={styles.texto}>{children}</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderLeftWidth: 8,
    borderRadius: raio,
    padding: 14,
    marginVertical: 12,
  },
  icone: { marginRight: 10, marginTop: 1 },
  texto: { flex: 1 },
});
