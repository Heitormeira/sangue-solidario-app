import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../../hooks/useTema';

// No SDK 58 as abas mostram só as telas declaradas aqui.
// Se um dia existir uma tela neste grupo que não deve virar aba, declare com options={{ href: null }}.
const ABAS = [
  { nome: 'index', titulo: 'Início', icone: 'home', rotuloAcessivel: 'Início' },
  { nome: 'buscar', titulo: 'Buscar', icone: 'search', rotuloAcessivel: 'Buscar doadores compatíveis' },
  { nome: 'doadores', titulo: 'Doadores', icone: 'people', rotuloAcessivel: 'Lista de doadores' },
  { nome: 'conta', titulo: 'Conta', icone: 'person-circle', rotuloAcessivel: 'Minha conta' },
];

export default function LayoutAbas() {
  const { cores, fontes, fs } = useTema();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTitleStyle: { fontFamily: fontes.forte, fontSize: fs(21), color: cores.texto },
        tabBarActiveTintColor: cores.acento,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: { backgroundColor: cores.fundo, borderTopColor: cores.linhaForte, borderTopWidth: 1, minHeight: 64 },
        tabBarLabelStyle: { fontFamily: fontes.forte, fontSize: 14 },
        tabBarItemStyle: { paddingVertical: 4 },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      {ABAS.map((aba) => (
        <Tabs.Screen
          key={aba.nome}
          name={aba.nome}
          options={{
            title: aba.nome === 'index' ? 'Sangue Solidário' : aba.titulo,
            tabBarLabel: aba.titulo,
            tabBarAccessibilityLabel: aba.rotuloAcessivel,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? aba.icone : `${aba.icone}-outline`} size={28} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
