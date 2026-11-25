/**
 * Regras de negócio do Sangue Solidário (as mesmas de lib/regras.js do site).
 * Compatibilidade sanguínea (tabela fixa) + carência entre doações.
 */

// Tabela fixa do ponto de vista do RECEPTOR:
// para cada tipo de quem vai receber, de quais tipos ele PODE RECEBER sangue.
export const COMPATIBILIDADE_RECEPTOR = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export const TIPOS_SANGUINEOS = Object.keys(COMPATIBILIDADE_RECEPTOR);

/** Tipos que um receptor do tipo informado pode receber. */
export function tiposCompativeisCom(receptor) {
  return COMPATIBILIDADE_RECEPTOR[receptor] || [];
}

// Carência entre doações (base ANVISA/hemocentros), em dias.
export const CARENCIA_DIAS = {
  masculino: 60,
  feminino: 90,
};

// Sexo não informado usa a carência maior, por segurança.
export const CARENCIA_PADRAO_DIAS = 90;

export const OPCOES_SEXO = [
  { valor: 'feminino', rotulo: 'Feminino' },
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: '', rotulo: 'Prefiro não informar' },
];

export function carenciaDe(sexo) {
  return CARENCIA_DIAS[String(sexo || '').toLowerCase()] || CARENCIA_PADRAO_DIAS;
}

/** Dias inteiros desde a data (ou null se não houver data válida). */
export function diasDesde(dataISO, agora = new Date()) {
  if (!dataISO) return null;
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return null;
  return Math.floor((agora.getTime() - data.getTime()) / 86400000);
}

/**
 * O doador está realmente disponível quando:
 * 1. marcou-se como disponível; E
 * 2. já passou a carência da última doação (60 dias homens, 90 mulheres/não informado).
 */
export function doadorDisponivel(doador, agora = new Date()) {
  if (!doador || !doador.disponivel) return false;
  const dias = diasDesde(doador.ultimaDoacao, agora);
  if (dias === null) return true;
  return dias >= carenciaDe(doador.sexo);
}

/** Motivo de o doador não aparecer na busca (ou null se ele está disponível). */
export function motivoIndisponibilidade(doador, agora = new Date()) {
  if (!doador) return null;
  if (!doador.disponivel) return 'Marcado como indisponível pelo doador.';
  const dias = diasDesde(doador.ultimaDoacao, agora);
  if (dias !== null) {
    const carencia = carenciaDe(doador.sexo);
    if (dias < carencia) {
      const restam = carencia - dias;
      return `Doou há ${dias} dia(s). Pode doar de novo em ${restam} dia(s) (intervalo de ${carencia} dias).`;
    }
  }
  return null;
}
