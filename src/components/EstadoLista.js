import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import Botao from './Botao';
import { useTema } from '../hooks/useTema';

/**
 * Mostra o que a lista está fazendo quando não há itens:
 * carregando, erro (com "Tentar de novo") ou vazia.
 */
export default function EstadoLista({ carregando, erro, vazio, mensagemVazia, onTentarDeNovo }) {
  const { cores } = useTema();

  if (carregando) {
    return (
      <View style={styles.caixa} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color={cores.acento} />
        <Texto variante="suave" style={styles.texto}>
          Carregando...
        </Texto>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.caixa} accessibilityRole="alert">
        <Ionicons name="cloud-offline-outline" size={48} color={cores.acento} />
        <Texto forte style={styles.texto}>
          {erro}
        </Texto>
        {onTentarDeNovo ? <Botao texto="Tentar de novo" icone="refresh" variante="secundario" onPress={onTentarDeNovo} /> : null}
      </View>
    );
  }

  if (vazio) {
    return (
      <View style={styles.caixa}>
        <Ionicons name="search-outline" size={48} color={cores.textoSuave} />
        <Texto variante="suave" style={styles.texto}>
          {mensagemVazia || 'Nada encontrado.'}
        </Texto>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  caixa: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 12, gap: 14 },
  texto: { textAlign: 'center' },
});
