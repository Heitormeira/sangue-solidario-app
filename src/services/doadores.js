/**
 * CRUD da classe Doador no Back4App (API REST do Parse).
 *
 * Relacionamento _User 1:1 Doador: cada usuário tem um único cadastro de doador,
 * ligado pelo campo "usuario" (Pointer para _User).
 * Registros antigos do site não têm "usuario": aparecem na lista, mas ninguém edita pelo app.
 *
 * ACL de cada Doador criado pelo app: leitura pública, escrita só do dono.
 */
import { requisicao, ponteiro, dataParse, dataDoParse, aclDoDono } from '../lib/api';
import { TIPOS_SANGUINEOS, tiposCompativeisCom, doadorDisponivel } from '../lib/regras';
import { cepEhValido, emailEhValido, normalizarEmail, semAcento } from '../lib/formatar';
import { consultarCep } from '../lib/viacep';

const CLASSE = 'Doador';
const LIMITE = 500;

/** Converte o objeto do Parse para o formato usado nas telas. */
export function paraDoador(obj) {
  return {
    id: obj.objectId,
    nome: obj.nome || '',
    tipoSanguineo: obj.tipoSanguineo || '',
    sexo: obj.sexo || '',
    cep: obj.cep || '',
    cidade: obj.cidade || '',
    bairro: obj.bairro || '',
    uf: obj.uf || '',
    email: obj.email || '',
    ultimaDoacao: dataDoParse(obj.ultimaDoacao),
    disponivel: obj.disponivel === true,
    usuarioId: obj.usuario?.objectId || null,
    criadoEm: obj.createdAt || null,
  };
}

/** O usuário logado é o dono deste cadastro? (registros antigos do site não têm dono) */
export function ehDono(doador, usuario) {
  return Boolean(doador?.usuarioId && usuario?.id && doador.usuarioId === usuario.id);
}

// ------------------------------------------------------------------ READ

/**
 * Lista doadores com filtros opcionais.
 * @param {object} filtros { tipo, cidade, soDisponiveis }
 */
export async function listarDoadores({ tipo, cidade, soDisponiveis } = {}) {
  const where = {};
  if (tipo) where.tipoSanguineo = tipo;
  if (soDisponiveis) where.disponivel = true;

  const { results } = await requisicao('GET', `/classes/${CLASSE}`, {
    params: { where, order: '-createdAt', limit: LIMITE },
  });

  let doadores = results.map(paraDoador);
  // Cidade: comparação sem acento e sem diferenciar maiúsculas ("sao paulo" acha "São Paulo").
  if (cidade && cidade.trim()) {
    const alvo = semAcento(cidade);
    doadores = doadores.filter((d) => semAcento(d.cidade).includes(alvo));
  }
  // "Só disponíveis" também aplica a carência de 60/90 dias.
  if (soDisponiveis) doadores = doadores.filter((d) => doadorDisponivel(d));
  return doadores;
}

/**
 * Busca de quem precisa de sangue: tipos compatíveis com o receptor,
 * marcados como disponíveis e fora da carência.
 */
export async function buscarCompativeis(tipoReceptor, cidade) {
  if (!TIPOS_SANGUINEOS.includes(tipoReceptor)) throw new Error('Escolha o tipo sanguíneo de quem vai receber.');
  const where = {
    tipoSanguineo: { $in: tiposCompativeisCom(tipoReceptor) },
    disponivel: true,
  };
  const { results } = await requisicao('GET', `/classes/${CLASSE}`, {
    params: { where, order: '-createdAt', limit: LIMITE },
  });

  let doadores = results.map(paraDoador).filter((d) => doadorDisponivel(d));
  if (cidade && cidade.trim()) {
    const alvo = semAcento(cidade);
    doadores = doadores.filter((d) => semAcento(d.cidade).includes(alvo));
  }
  return doadores;
}

export async function buscarDoador(id) {
  const obj = await requisicao('GET', `/classes/${CLASSE}/${id}`);
  return paraDoador(obj);
}

/** Cadastro de doador do usuário (ou null se ele ainda não tem). */
export async function buscarDoadorDoUsuario(usuarioId) {
  const { results } = await requisicao('GET', `/classes/${CLASSE}`, {
    params: { where: { usuario: ponteiro('_User', usuarioId) }, limit: 1 },
  });
  return results.length ? paraDoador(results[0]) : null;
}

// ------------------------------------------------------------ Validação

/**
 * Valida os dados do formulário e padroniza cidade/bairro/UF pelo ViaCEP.
 * Devolve o corpo pronto para gravar no Parse.
 */
async function montarCorpo(dados) {
  const nome = String(dados.nome || '').trim();
  if (nome.length < 3) throw new Error('Informe o nome completo (mínimo 3 letras).');

  const tipoSanguineo = String(dados.tipoSanguineo || '').toUpperCase().trim();
  if (!TIPOS_SANGUINEOS.includes(tipoSanguineo)) throw new Error('Escolha o tipo sanguíneo.');

  const email = normalizarEmail(dados.email);
  if (!emailEhValido(email)) throw new Error('Informe um e-mail válido. Exemplo: nome@exemplo.com');

  if (!cepEhValido(dados.cep)) throw new Error('O CEP deve ter 8 números.');
  const endereco = await consultarCep(dados.cep);
  if (!endereco.ok) throw new Error(endereco.erro);

  const sexo = ['masculino', 'feminino'].includes(dados.sexo) ? dados.sexo : '';

  return {
    nome,
    tipoSanguineo,
    sexo,
    cep: endereco.cep,
    cidade: endereco.cidade,
    bairro: String(dados.bairro || '').trim() || endereco.bairro,
    uf: endereco.uf,
    email,
    disponivel: dados.disponivel !== false,
    ultimaDoacao: dados.ultimaDoacao ? dataParse(dados.ultimaDoacao) : null,
  };
}

// ---------------------------------------------------------------- CREATE

export async function criarDoador(dados, usuarioId) {
  if (!usuarioId) throw new Error('Entre na sua conta para se cadastrar como doador.');

  // Um único cadastro por usuário (relacionamento 1:1).
  const existente = await buscarDoadorDoUsuario(usuarioId);
  if (existente) throw new Error('Você já tem um cadastro de doador. Use "Editar" para mudar os dados.');

  const corpo = await montarCorpo(dados);
  const criado = await requisicao('POST', `/classes/${CLASSE}`, {
    corpo: {
      ...corpo,
      usuario: ponteiro('_User', usuarioId),
      ACL: aclDoDono(usuarioId),
    },
  });
  return buscarDoador(criado.objectId);
}

// ---------------------------------------------------------------- UPDATE

export async function atualizarDoador(id, dados) {
  const corpo = await montarCorpo(dados);
  // Sem a ACL de escrita, o próprio Parse recusa (erro 101/119) — o app não confia só na tela.
  await requisicao('PUT', `/classes/${CLASSE}/${id}`, { corpo });
  return buscarDoador(id);
}

/** Atualiza só a data da última doação (usado ao registrar/excluir uma Doacao). */
export async function definirUltimaDoacao(id, iso) {
  await requisicao('PUT', `/classes/${CLASSE}/${id}`, {
    corpo: { ultimaDoacao: iso ? dataParse(iso) : null },
  });
}

// ---------------------------------------------------------------- DELETE

/** Exclui o doador e, antes, as doações ligadas a ele (para não sobrar Doacao órfã). */
export async function excluirDoador(id) {
  const { results } = await requisicao('GET', '/classes/Doacao', {
    params: { where: { doador: ponteiro(CLASSE, id) }, keys: 'objectId', limit: LIMITE },
  });
  for (const doacao of results) {
    await requisicao('DELETE', `/classes/Doacao/${doacao.objectId}`);
  }
  await requisicao('DELETE', `/classes/${CLASSE}/${id}`);
}
