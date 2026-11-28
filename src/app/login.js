import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Tela from '../components/Tela';
import Texto from '../components/Texto';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import Aviso from '../components/Aviso';
import { useAuth } from '../store/useAuth';
import { useDoadores } from '../store/useDoadores';

// Tela de login (POST /login no Parse).
export default function Login() {
  const router = useRouter();
  const entrar = useAuth((e) => e.entrar);
  const carregando = useAuth((e) => e.carregando);
  const erro = useAuth((e) => e.erro);
  const limparErro = useAuth((e) => e.limparErro);
  const carregarMeu = useDoadores((e) => e.carregarMeu);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Não mostra o erro de uma tentativa anterior ao abrir a tela
  useEffect(() => limparErro, [limparErro]);

  async function enviar() {
    const ok = await entrar(email, senha);
    if (!ok) return;
    await carregarMeu(useAuth.getState().usuario?.id);
    if (router.canGoBack()) router.back();
    else router.replace('/conta');
  }

  return (
    <Tela titulo="Entrar" subtitulo="Use o e-mail e a senha da sua conta.">
      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <CampoTexto
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={enviar}
      />

      <Aviso tipo="erro">{erro}</Aviso>

      <View style={styles.botoes}>
        <Botao grande icone="log-in-outline" texto="Entrar" carregando={carregando} onPress={enviar} />
        <Texto variante="suave" style={styles.centro}>
          Ainda não tem conta?
        </Texto>
        <Botao variante="secundario" icone="person-add-outline" texto="Criar conta" onPress={() => router.replace('/cadastro')} />
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  botoes: { gap: 14, marginTop: 8 },
  centro: { textAlign: 'center', marginTop: 12 },
});
