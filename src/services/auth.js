/**
 * Autenticação com a classe _User do Parse (API REST).
 *   cadastro  -> POST /users
 *   login     -> POST /login
 *   logout    -> POST /logout
 *   restaurar -> GET  /users/me
 */
import { requisicao, definirTokenSessao } from '../lib/api';
import { emailEhValido, normalizarEmail } from '../lib/formatar';

// Só os campos que o app usa (nunca guardamos a senha).
// O _User do Back4App não aceita colunas novas pelo app (permissão "Add Field" fechada),
// então o nome não fica no servidor: ele vem do cadastro de doador ou do que a pessoa digitou ao criar a conta.
function paraUsuario(dados, nome = '') {
  return {
    id: dados.objectId,
    nome,
    email: dados.email || dados.username || '',
  };
}

function validarCredenciais(email, senha) {
  if (!emailEhValido(email)) throw new Error('Informe um e-mail válido. Exemplo: nome@exemplo.com');
  if (!senha || senha.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
}

/** Cria a conta. O e-mail é usado também como "username". O nome fica só no aparelho (ver paraUsuario). */
export async function cadastrar({ nome, email, senha }) {
  const nomeLimpo = String(nome || '').trim();
  const emailLimpo = normalizarEmail(email);
  if (nomeLimpo.length < 3) throw new Error('Informe seu nome (mínimo 3 letras).');
  validarCredenciais(emailLimpo, senha);

  const dados = await requisicao('POST', '/users', {
    corpo: { username: emailLimpo, email: emailLimpo, password: senha },
    contexto: 'cadastro',
  });
  definirTokenSessao(dados.sessionToken);
  return {
    usuario: { id: dados.objectId, nome: nomeLimpo, email: emailLimpo },
    sessionToken: dados.sessionToken,
  };
}

/** Entra com e-mail e senha. */
export async function entrar({ email, senha }) {
  const emailLimpo = normalizarEmail(email);
  validarCredenciais(emailLimpo, senha);

  const dados = await requisicao('POST', '/login', {
    corpo: { username: emailLimpo, password: senha },
    contexto: 'login',
  });
  definirTokenSessao(dados.sessionToken);
  return { usuario: paraUsuario(dados), sessionToken: dados.sessionToken };
}

/** Encerra a sessão no servidor. Mesmo se falhar (sem internet), o app esquece o token. */
export async function sair() {
  try {
    await requisicao('POST', '/logout');
  } catch {
    // A sessão local é apagada de qualquer jeito.
  } finally {
    definirTokenSessao(null);
  }
}

/** Confere se o token salvo ainda vale e devolve o usuário atualizado. */
export async function usuarioAtual(token) {
  definirTokenSessao(token);
  const dados = await requisicao('GET', '/users/me');
  return paraUsuario(dados);
}
