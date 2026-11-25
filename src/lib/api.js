/**
 * Cliente da API REST do Parse (Back4App) — sem o SDK do Parse, só com fetch.
 * É o MESMO banco do site Sangue Solidário (mesmas chaves NEXT_PUBLIC_ do Vercel).
 *
 * Documentação da API REST: https://docs.parseplatform.org/rest/guide/
 */

const URL_BASE = 'https://parseapi.back4app.com';

// As chaves vêm do .env (EXPO_PUBLIC_ entra no bundle do app no momento do build/update).
const APP_ID = process.env.EXPO_PUBLIC_BACK4APP_APP_ID;
const JS_KEY = process.env.EXPO_PUBLIC_BACK4APP_JAVASCRIPT_KEY;

// Token da sessão do usuário logado. Quem atualiza é a store useAuth
// (no login, no cadastro, no logout e quando o app abre e restaura a sessão).
let tokenSessao = null;

export function definirTokenSessao(token) {
  tokenSessao = token || null;
}

export function chavesConfiguradas() {
  return Boolean(APP_ID && JS_KEY);
}

// Mensagens do Parse traduzidas para português (código -> texto).
// Lista de códigos: https://docs.parseplatform.org/rest/guide/#error-codes
const MENSAGENS = {
  100: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
  101: 'E-mail ou senha incorretos.',
  119: 'Você não tem permissão para fazer isso.',
  125: 'O e-mail informado não é válido.',
  137: 'Já existe um registro com esses dados.',
  141: 'O servidor recusou a operação.',
  155: 'Muitas requisições. Espere um pouco e tente de novo.',
  200: 'Informe o e-mail.',
  201: 'Informe a senha.',
  202: 'Já existe uma conta com este e-mail.',
  203: 'Já existe uma conta com este e-mail.',
  205: 'Nenhuma conta encontrada com este e-mail.',
  206: 'Sessão inválida. Entre de novo na sua conta.',
  209: 'Sua sessão expirou. Entre de novo na sua conta.',
};

/** Erro com código do Parse e mensagem já em português. */
export class ErroApi extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = 'ErroApi';
    this.codigo = codigo;
  }
}

/** Traduz um erro do Parse. O código 101 também significa "objeto não encontrado". */
export function traduzirErro(codigo, mensagemOriginal, contexto) {
  if (codigo === 101 && contexto !== 'login') return 'Registro não encontrado. Ele pode ter sido excluído.';
  return MENSAGENS[codigo] || `Erro no servidor${mensagemOriginal ? `: ${mensagemOriginal}` : '.'}`;
}

/**
 * Faz uma requisição à API do Parse.
 * @param {string} metodo GET, POST, PUT ou DELETE
 * @param {string} caminho ex.: '/classes/Doador'
 * @param {object} [opcoes] { corpo, params, contexto }
 */
export async function requisicao(metodo, caminho, { corpo, params, contexto } = {}) {
  if (!chavesConfiguradas()) {
    throw new ErroApi(0, 'As chaves do Back4App não foram configuradas. Crie o arquivo .env a partir do .env.example.');
  }

  const headers = {
    'X-Parse-Application-Id': APP_ID,
    'X-Parse-JavaScript-Key': JS_KEY,
    'Content-Type': 'application/json',
  };
  if (tokenSessao) headers['X-Parse-Session-Token'] = tokenSessao;

  // Parâmetros de consulta: objetos (como o "where") viram JSON.
  let url = `${URL_BASE}${caminho}`;
  if (params) {
    const partes = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`);
    if (partes.length) url += `?${partes.join('&')}`;
  }

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi(100, MENSAGENS[100]);
  }

  let dados = {};
  try {
    dados = await resposta.json();
  } catch {
    // Resposta sem corpo JSON (raro): segue com objeto vazio.
  }

  if (!resposta.ok || dados.error) {
    const codigo = dados.code ?? resposta.status;
    throw new ErroApi(codigo, traduzirErro(codigo, dados.error, contexto));
  }
  return dados;
}

// ------------------------------------------------ Ajudantes de tipos do Parse

/** Ponteiro para outro objeto (relacionamento). */
export function ponteiro(classe, id) {
  return { __type: 'Pointer', className: classe, objectId: id };
}

/** Data no formato do Parse. Recebe 'AAAA-MM-DD' e grava ao meio-dia UTC (evita mudar de dia pelo fuso). */
export function dataParse(iso) {
  if (!iso) return null;
  return { __type: 'Date', iso: `${String(iso).slice(0, 10)}T12:00:00.000Z` };
}

/** Converte a data do Parse de volta para 'AAAA-MM-DD'. */
export function dataDoParse(valor) {
  if (!valor) return null;
  const iso = typeof valor === 'string' ? valor : valor.iso;
  return iso ? String(iso).slice(0, 10) : null;
}

/** ACL: todo mundo lê, só o dono escreve (edita e exclui). */
export function aclDoDono(usuarioId) {
  return {
    '*': { read: true },
    [usuarioId]: { read: true, write: true },
  };
}
