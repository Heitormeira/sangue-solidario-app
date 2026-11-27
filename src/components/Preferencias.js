import { View } from 'react-native';
import Texto from './Texto';
import Chips from './Chips';
import LinhaSwitch from './LinhaSwitch';
import { usePreferencias, TAMANHOS } from '../store/usePreferencias';

/** Painel de acessibilidade (tamanho da letra e contraste alto), como a barra do site. */
export default function Preferencias() {
  const tamanho = usePreferencias((e) => e.tamanho);
  const altoContraste = usePreferencias((e) => e.altoContraste);
  const definirTamanho = usePreferencias((e) => e.definirTamanho);
  const alternarContraste = usePreferencias((e) => e.alternarContraste);

  return (
    <View>
      <Chips
        rotulo="Tamanho da letra"
        opcoes={TAMANHOS.map((t) => ({ valor: t.valor, rotulo: t.rotulo, rotuloAcessivel: `Letra ${t.rotulo}` }))}
        valor={tamanho}
        onChange={definirTamanho}
      />
      <LinhaSwitch
        rotulo="Contraste alto"
        dica="Fundo preto, letras brancas e destaque amarelo."
        valor={altoContraste}
        onChange={alternarContraste}
      />
      <Texto variante="pequeno">As preferências ficam salvas neste aparelho.</Texto>
    </View>
  );
}
