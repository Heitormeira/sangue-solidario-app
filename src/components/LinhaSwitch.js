import { Pressable, Switch, StyleSheet, View } from 'react-native';
import Texto from './Texto';
import { useTema } from '../hooks/useTema';
import { alturaToque } from '../constants/theme';

/**
 * Switch com o texto ao lado. A linha inteira é tocável (alvo grande para quem tem pouca precisão).
 */
export default function LinhaSwitch({ rotulo, dica, valor, onChange }) {
  const { cores } = useTema();

  return (
    <Pressable
      onPress={() => onChange(!valor)}
      accessibilityRole="switch"
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      accessibilityState={{ checked: !!valor }}
      style={[styles.linha, { borderColor: cores.linha }]}
    >
      <View style={styles.textos}>
        <Texto forte>{rotulo}</Texto>
        {dica ? <Texto variante="pequeno">{dica}</Texto> : null}
      </View>
      <Switch
        value={!!valor}
        onValueChange={onChange}
        trackColor={{ false: cores.linha, true: cores.verde }}
        thumbColor={cores.fundo === '#000000' ? '#ffffff' : undefined}
        ios_backgroundColor={cores.linha}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    minHeight: alturaToque + 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 18,
  },
  textos: { flex: 1, marginRight: 12 },
});
