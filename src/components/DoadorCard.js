import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { raio } from '../constants/theme';
import { doadorDisponivel } from '../lib/regras';
import { descreverTipo } from '../lib/formatar';

/** Selo grande com o tipo sanguíneo (ex.: "O+"). */
export function SeloTipo({ tipo, grande }) {
  const { cores, fontes, fs } = useTema();
  const tamanho = grande ? 76 : 60;
  return (
    <View
      accessible
      accessibilityLabel={`Tipo ${descreverTipo(tipo)}`}
      style={[styles.selo, { width: tamanho, height: tamanho, borderColor: cores.acento, backgroundColor: cores.acentoFundo }]}
    >
      <Texto style={{ fontFamily: fontes.forte, fontSize: fs(grande ? 26 : 21), color: cores.acento }}>{tipo}</Texto>
    </View>
  );
}

/** Situação do doador: "Pode doar agora" (verde) ou "Não pode doar agora". */
export function Situacao({ doador }) {
  const { cores } = useTema();
  const pode = doadorDisponivel(doador);
  return (
    <View style={styles.situacao}>
      <Ionicons
        name={pode ? 'checkmark-circle' : 'time-outline'}
        size={22}
        color={pode ? cores.verde : cores.textoSuave}
        style={styles.situacaoIcone}
      />
      <Texto forte variante="pequeno" cor={pode ? cores.verde : cores.textoSuave}>
        {pode ? 'Pode doar agora' : 'Não pode doar agora'}
      </Texto>
    </View>
  );
}

/**
 * Cartão de um doador na lista. Mostra só o que é público: nome, tipo, bairro, cidade e situação.
 * "children" permite acrescentar ações embaixo (ex.: botão de e-mail na busca).
 */
export default function DoadorCard({ doador, onPress, children }) {
  const { cores } = useTema();
  const local = [doador.bairro, doador.cidade && `${doador.cidade}${doador.uf ? ` - ${doador.uf}` : ''}`]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.cartao, { borderColor: cores.linhaForte, backgroundColor: cores.fundo }]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${doador.nome}, tipo ${descreverTipo(doador.tipoSanguineo)}, ${local}`}
        accessibilityHint={onPress ? 'Abre os detalhes do doador' : undefined}
        style={({ pressed }) => [styles.topo, pressed && { opacity: 0.75 }]}
      >
        <SeloTipo tipo={doador.tipoSanguineo} />
        <View style={styles.textos}>
          <Texto variante="destaque">{doador.nome}</Texto>
          {local ? <Texto variante="suave">{local}</Texto> : null}
          <Situacao doador={doador} />
        </View>
        {onPress ? <Ionicons name="chevron-forward" size={26} color={cores.textoSuave} /> : null}
      </Pressable>
      {children ? <View style={styles.acoes}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { borderWidth: 2, borderRadius: raio, padding: 14, marginBottom: 14 },
  topo: { flexDirection: 'row', alignItems: 'center', minHeight: 60 },
  textos: { flex: 1, marginHorizontal: 14 },
  selo: { borderWidth: 3, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  situacao: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  situacaoIcone: { marginRight: 6 },
  acoes: { marginTop: 12, gap: 10 },
});
