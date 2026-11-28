import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Tela, { Secao } from '../../components/Tela';
import Texto from '../../components/Texto';
import Botao from '../../components/Botao';
import TabelaCompatibilidade from '../../components/TabelaCompatibilidade';
import { useTema } from '../../hooks/useTema';
import { useAuth } from '../../store/useAuth';
import { useDoadores } from '../../store/useDoadores';

const PASSOS = [
  'Escolha o tipo sanguíneo de quem vai receber o sangue.',
  'Veja a lista de pessoas que podem doar.',
  'Envie um e-mail para a pessoa pedindo ajuda.',
];

const BOM_SABER = [
  'Quem doou há pouco tempo não aparece na busca. O intervalo é de 60 dias para homens e de 90 dias para mulheres.',
  'Nem todo tipo sanguíneo pode doar para todos os outros. O app já faz essa conta para você.',
  'Na lista aparecem só o bairro e a cidade. Rua e telefone nunca são mostrados.',
  'O app só aproxima as pessoas. A doação deve ser feita em hemocentros e bancos de sangue credenciados.',
];

// Tela inicial: chamada principal, os dois caminhos e como funciona.
export default function Inicio() {
  const router = useRouter();
  const { cores, fs } = useTema();
  const usuario = useAuth((e) => e.usuario);
  const meuDoador = useDoadores((e) => e.meuDoador);

  // "Quero ser doador": sem conta, cria a conta; com conta, abre o cadastro (ou o próprio, se já tem).
  function queroSerDoador() {
    if (!usuario) router.push('/cadastro');
    else if (meuDoador) router.push(`/doador/${meuDoador.id}`);
    else router.push('/doador/form');
  }

  return (
    <Tela>
      <Texto variante="titulo">Encontre um doador de sangue compatível.</Texto>
      <Texto variante="suave" style={[styles.lede, { fontSize: fs(20), lineHeight: fs(30) }]}>
        Quem precisa de sangue escolhe o tipo sanguíneo e vê quem pode ajudar. Quem quer ajudar faz um cadastro simples.
      </Texto>

      <View style={styles.botoes}>
        <Botao
          grande
          icone="search"
          texto="Preciso de sangue"
          accessibilityHint="Abre a busca de doadores compatíveis"
          onPress={() => router.navigate('/buscar')}
        />
        <Botao
          grande
          variante="secundario"
          icone="heart"
          texto="Quero ser doador"
          accessibilityHint={usuario ? 'Abre o seu cadastro de doador' : 'Abre a tela para criar sua conta'}
          onPress={queroSerDoador}
        />
      </View>

      <Secao titulo="Como funciona">
        {PASSOS.map((passo, i) => (
          <View key={passo} style={styles.passo} accessible accessibilityLabel={`Passo ${i + 1}: ${passo}`}>
            <View style={[styles.numero, { borderColor: cores.acento }]}>
              <Texto forte cor={cores.acento}>
                {i + 1}
              </Texto>
            </View>
            <Texto style={styles.flex}>{passo}</Texto>
          </View>
        ))}
      </Secao>

      <Secao titulo="Bom saber">
        {BOM_SABER.map((item) => (
          <View key={item} style={styles.item}>
            <Texto cor={cores.acento} forte style={styles.marcador}>
              •
            </Texto>
            <Texto style={styles.flex}>{item}</Texto>
          </View>
        ))}
        <TabelaCompatibilidade />
      </Secao>

      <Secao>
        <Botao variante="neutro" icone="information-circle-outline" texto="Sobre o projeto" onPress={() => router.push('/sobre')} />
      </Secao>
    </Tela>
  );
}

const styles = StyleSheet.create({
  lede: { marginTop: 12 },
  botoes: { gap: 14, marginTop: 24 },
  passo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  numero: {
    width: 46,
    height: 46,
    borderWidth: 3,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  item: { flexDirection: 'row', marginBottom: 12 },
  marcador: { width: 22 },
  flex: { flex: 1 },
});
