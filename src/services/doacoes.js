/**
 * Classe Doacao: o histórico de doações de cada doador.
 *
 * Relacionamento Doador 1:N Doacao: cada Doacao aponta para o seu Doador
 * (campo "doador", Pointer) e para o usuário dono (campo "usuario", Pointer para _User).
 * Registrar uma doação atualiza o "ultimaDoacao" do Doador.
 */
import { requisicao, ponteiro, dataParse, dataDoParse, aclDoDono } from '../lib/api';
import { validarDataPassada } from '../lib/formatar';
import { definirUltimaDoacao } from './doadores';

const CLASSE = 'Doacao';

export function paraDoacao(obj) {
  return {
    id: obj.objectId,
    data: dataDoParse(obj.data),
    local: obj.local || '',
    observacao: obj.observacao || '',
    doadorId: obj.doador?.objectId || null,
    usuarioId: obj.usuario?.objectId || null,
    // Quando a consulta usa "include=doador", o nome do doador vem junto.
    doadorNome: obj.doador?.nome || '',
  };
}

/** Doações de um doador, da mais recente para a mais antiga. */
export async function listarDoacoesDoDoador(doadorId) {
  const { results } = await requisicao('GET', `/classes/${CLASSE}`, {
    params: { where: { doador: ponteiro('Doador', doadorId) }, order: '-data', limit: 200 },
  });
  return results.map(paraDoacao);
}

/** Doações registradas pelo usuário logado (tela "Minhas doações"). */
export async function listarDoacoesDoUsuario(usuarioId) {
  const { results } = await requisicao('GET', `/classes/${CLASSE}`, {
    params: { where: { usuario: ponteiro('_User', usuarioId) }, order: '-data', include: 'doador', limit: 200 },
  });
  return results.map(paraDoacao);
}

/**
 * Registra uma doação do doador do usuário logado.
 * @param {object} dados { dataTexto: 'dd/mm/aaaa', local, observacao }
 * @param {object} doador o cadastro do dono (precisa ter id e ultimaDoacao)
 * @param {string} usuarioId
 */
export async function registrarDoacao(dados, doador, usuarioId) {
  if (!doador?.id) throw new Error('Faça primeiro o seu cadastro de doador.');
  if (doador.usuarioId !== usuarioId) throw new Error('Você só pode registrar doações no seu próprio cadastro.');

  const data = validarDataPassada(dados.dataTexto);
  if (!data.ok) throw new Error(data.erro);

  const local = String(dados.local || '').trim();
  if (local.length < 3) throw new Error('Informe onde foi a doação (ex.: Hemope).');
  const observacao = String(dados.observacao || '').trim().slice(0, 300);

  const criada = await requisicao('POST', `/classes/${CLASSE}`, {
    corpo: {
      data: dataParse(data.iso),
      local,
      observacao,
      doador: ponteiro('Doador', doador.id),
      usuario: ponteiro('_User', usuarioId),
      ACL: aclDoDono(usuarioId),
    },
  });

  // Atualiza a última doação do Doador se esta for mais recente.
  const novaUltima = !doador.ultimaDoacao || data.iso > doador.ultimaDoacao ? data.iso : doador.ultimaDoacao;
  if (novaUltima !== doador.ultimaDoacao) await definirUltimaDoacao(doador.id, novaUltima);

  return { id: criada.objectId, ultimaDoacao: novaUltima };
}

/**
 * Exclui uma doação. Se ela era a última, o "ultimaDoacao" do Doador volta
 * para a doação anterior que sobrou (ou fica vazio).
 */
export async function excluirDoacao(doacao, doador) {
  await requisicao('DELETE', `/classes/${CLASSE}/${doacao.id}`);

  if (doador?.id && doacao.data && doacao.data === doador.ultimaDoacao) {
    const restantes = await listarDoacoesDoDoador(doador.id);
    const anterior = restantes.length ? restantes[0].data : null;
    await definirUltimaDoacao(doador.id, anterior);
    return { ultimaDoacao: anterior };
  }
  return { ultimaDoacao: doador?.ultimaDoacao ?? null };
}
