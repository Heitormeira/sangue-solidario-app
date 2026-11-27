import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { alturaToque, raio } from '../constants/theme';
import { TIPOS_SANGUINEOS } from '../lib/regras';
import { descreverTipo } from '../lib/formatar';

/**
 * Grupo de opções em "chips" (escolha única).
 * opcoes: [{ valor, rotulo, rotuloAcessivel? }]
 * coluna: true mostra uma opção por linha (usado no sexo, com texto mais longo).
 */
export default function Chips({ opcoes, valor, onChange, rotulo, coluna }) {
  const { cores } = useTema();

  return (
    <View style={styles.grupo}>
      {rotulo ? (
        <Texto forte style={styles.rotulo}>
          {rotulo}
        </Texto>
      ) : null}
      <View style={[styles.linha, coluna && styles.coluna]} accessibilityRole="radiogroup">
        {opcoes.map((o) => {
          const marcado = o.valor === valor;
          return (
            <Pressable
              key={String(o.valor)}
              onPress={() => onChange(o.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: marcado }}
              accessibilityLabel={o.rotuloAcessivel || o.rotulo}
              style={({ pressed }) => [
                styles.chip,
                coluna && styles.chipColuna,
                {
                  backgroundColor: marcado ? cores.texto : cores.fundo,
                  borderColor: marcado ? cores.texto : cores.linhaForte,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              {coluna ? (
                <Ionicons
                  name={marcado ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={marcado ? cores.fundo : cores.texto}
                  style={styles.icone}
                />
              ) : null}
              <Texto forte cor={marcado ? cores.fundo : cores.texto}>
                {o.rotulo}
              </Texto>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Chips com os 8 tipos sanguíneos (opcional: "Todos"). */
export function SeletorTipo({ valor, onChange, rotulo, comTodos }) {
  const opcoes = TIPOS_SANGUINEOS.map((t) => ({ valor: t, rotulo: t, rotuloAcessivel: descreverTipo(t) }));
  if (comTodos) opcoes.unshift({ valor: '', rotulo: 'Todos', rotuloAcessivel: 'Todos os tipos' });
  return <Chips opcoes={opcoes} valor={valor} onChange={onChange} rotulo={rotulo} />;
}

const styles = StyleSheet.create({
  grupo: { marginBottom: 18 },
  rotulo: { marginBottom: 8 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  coluna: { flexDirection: 'column' },
  chip: {
    minHeight: alturaToque,
    minWidth: 64,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderRadius: raio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipColuna: { flexDirection: 'row', justifyContent: 'flex-start' },
  icone: { marginRight: 10 },
});
