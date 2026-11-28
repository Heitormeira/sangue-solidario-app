import { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Tela from '../components/Tela';
import Texto from '../components/Texto';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';
import Aviso from '../components/Aviso';
import { useAuth } from '../store/useAuth';
import { useDoadores } from '../store/useDoadores';

// Criação de conta (POST /users no Parse). O e-mail vira o "username".
export default function Cadastro() {
  const router = useRouter();
  const cadastrar = useAuth((e) => e.cadastrar);
  const carregando = useAuth((e) => e.carregando);
  const erro = useAuth((e) => e.erro);
  const limparErro = useAuth((e) => e.limparErro);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erroLocal, setErroLocal] = useState(null);

  useEffect(() => limparErro, [limparErro]);

  async function enviar() {
    setErroLocal(null);
    if (senha !== confirmacao) {
      setErroLocal('As duas senhas não são iguais.');
      return;
    }
    const ok = await cadastrar(nome, email, senha);
    if (!ok) return;
    useDoadores.getState().limparMeu(); // conta nova ainda não tem cadastro de doador

    // Conta criada: oferece já fazer o cadastro de doador.
    router.dismissAll();
    Alert.alert('Conta criada!', 'Quer se cadastrar agora como doador de sangue?', [
      { text: 'Agora não', style: 'cancel', onPress: () => router.navigate('/conta') },
      { text: 'Sim, cadastrar', onPress: () => router.push('/doador/form') },
    ]);
  }

  return (
    <Tela titulo="Criar conta" subtitulo="Com a conta você pode se cadastrar como doador e falar com doadores.">
      <CampoTexto rotulo="Seu nome" value={nome} onChangeText={setNome} autoCapitalize="words" autoComplete="name" />
      <CampoTexto
        rotulo="E-mail"
        dica="Será o seu login."
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <CampoTexto
        rotulo="Senha"
        dica="Pelo menos 6 caracteres."
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <CampoTexto
        rotulo="Repita a senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={enviar}
      />

      <Aviso tipo="erro">{erroLocal || erro}</Aviso>

      <View style={styles.botoes}>
        <Botao grande icone="person-add-outline" texto="Criar conta" carregando={carregando} onPress={enviar} />
        <Texto variante="suave" style={styles.centro}>
          Já tem conta?
        </Texto>
        <Botao variante="secundario" icone="log-in-outline" texto="Entrar" onPress={() => router.replace('/login')} />
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  botoes: { gap: 14, marginTop: 8 },
  centro: { textAlign: 'center', marginTop: 12 },
});
