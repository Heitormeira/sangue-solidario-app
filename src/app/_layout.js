import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { useAuth } from '../store/useAuth';
import { useTema } from '../hooks/useTema';

// Segura a splash até as fontes e a sessão salva carregarem (chamado fora do componente, como pede a doc)
SplashScreen.preventAutoHideAsync();

// Navegação principal: Stack com as abas e as telas que abrem por cima delas.
export default function Layout() {
  const [fontesProntas, erroFontes] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    ...Ionicons.font,
  });

  const hidratado = useAuth((e) => e.hidratado);
  const logado = useAuth((e) => Boolean(e.usuario && e.sessionToken));
  const restaurarSessao = useAuth((e) => e.restaurarSessao);
  const { cores, fontes, altoContraste } = useTema();

  const pronto = (fontesProntas || erroFontes) && hidratado;

  // Quando o AsyncStorage termina de carregar, confere se a sessão ainda vale (GET /users/me).
  useEffect(() => {
    if (hidratado) restaurarSessao();
  }, [hidratado, restaurarSessao]);

  useEffect(() => {
    if (pronto) SplashScreen.hide();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <>
      <StatusBar style={altoContraste ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          // Cor de fundo no header = cabeçalho opaco (o conteúdo não passa por baixo no iOS 26)
          headerStyle: { backgroundColor: cores.fundo },
          headerTintColor: cores.acento,
          headerTitleStyle: { fontFamily: fontes.forte, color: cores.texto },
          headerBackTitle: 'Voltar',
          headerBackTitleStyle: { fontFamily: fontes.texto },
          headerShadowVisible: true,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        {/* Abas: Início, Buscar, Doadores e Conta */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Início' }} />

        {/* Telas públicas */}
        <Stack.Screen name="sobre" options={{ title: 'Sobre o projeto' }} />
        <Stack.Screen name="doador/[id]" options={{ title: 'Doador' }} />
        <Stack.Screen name="login" options={{ title: 'Entrar' }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />

        {/* Telas que exigem login: sem sessão, o Router manda para /login */}
        <Stack.Protected guard={logado} redirectTo="/login">
          <Stack.Screen name="doador/form" options={{ title: 'Cadastro de doador' }} />
          <Stack.Screen name="doacao/nova" options={{ title: 'Registrar doação' }} />
          <Stack.Screen name="minhas-doacoes" options={{ title: 'Minhas doações' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
