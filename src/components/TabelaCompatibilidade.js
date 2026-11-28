import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { alturaToque, raio } from '../constants/theme';
import { COMPATIBILIDADE_RECEPTOR } from '../lib/regras';
import { descreverTipo } from '../lib/formatar';

/** Tabela "quem pode doar para quem", recolhível (como o <details> do site). */
export default function TabelaCompatibilidade() {
  const { cores } = useTema();
  const [aberta, setAberta] = useState(false);

  return (
    <View style={[styles.caixa, { borderColor: cores.linhaForte }]}>
      <Pressable
        onPress={() => setAberta(!aberta)}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberta }}
        accessibilityLabel="Ver quem pode doar para quem"
        style={[styles.cabecalho, { backgroundColor: cores.faixa }]}
      >
        <Texto forte style={styles.flex}>
          Ver quem pode doar para quem
        </Texto>
        <Ionicons name={aberta ? 'chevron-up' : 'chevron-down'} size={26} color={cores.texto} />
      </Pressable>

      {aberta ? (
        <View>
          <View style={[styles.linha, { borderColor: cores.linha }]}>
            <Texto forte variante="pequeno" cor={cores.texto} style={styles.colTipo}>
              Quem vai receber
            </Texto>
            <Texto forte variante="pequeno" cor={cores.texto} style={styles.flex}>
              Pode receber sangue de
            </Texto>
          </View>
          {Object.entries(COMPATIBILIDADE_RECEPTOR).map(([receptor, doadores]) => (
            <View
              key={receptor}
              accessible
              accessibilityLabel={`${descreverTipo(receptor)} pode receber de ${doadores.map(descreverTipo).join(', ')}`}
              style={[styles.linha, { borderColor: cores.linha }]}
            >
              <Texto variante="destaque" cor={cores.acento} style={styles.colTipo}>
                {receptor}
              </Texto>
              <Texto style={styles.flex}>{doadores.join(', ')}</Texto>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { borderWidth: 2, borderRadius: raio, overflow: 'hidden', marginTop: 12 },
  cabecalho: { minHeight: alturaToque + 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  linha: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  colTipo: { width: 110 },
  flex: { flex: 1 },
});
