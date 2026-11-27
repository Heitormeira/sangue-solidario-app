/**
 * Consulta direta à API ViaCEP (https://viacep.com.br/), feita pelo próprio app.
 * A partir do CEP, preenche cidade, bairro e UF.
 */
import { soDigitos } from './formatar';

const URL_VIACEP = 'https://viacep.com.br/ws';

/**
 * Retorna { ok: true, cep, cidade, bairro, uf } ou { ok: false, erro }.
 * A rua (logradouro) é ignorada de propósito: por privacidade, o app só usa bairro e cidade.
 */
export async function consultarCep(cep) {
  const digitos = soDigitos(cep);
  if (digitos.length !== 8) {
    return { ok: false, erro: 'O CEP deve ter 8 números.' };
  }

  try {
    const resposta = await fetch(`${URL_VIACEP}/${digitos}/json/`, {
      headers: { Accept: 'application/json' },
    });
    if (!resposta.ok) {
      return { ok: false, erro: 'Não foi possível consultar o CEP agora. Tente de novo.' };
    }

    const dados = await resposta.json();
    if (dados.erro) {
      return { ok: false, erro: 'CEP não encontrado. Confira os números.' };
    }

    return {
      ok: true,
      cep: dados.cep || `${digitos.slice(0, 5)}-${digitos.slice(5)}`,
      cidade: dados.localidade || '',
      bairro: dados.bairro || '',
      uf: dados.uf || '',
    };
  } catch {
    return { ok: false, erro: 'Sem conexão para consultar o CEP. Verifique sua internet.' };
  }
}
