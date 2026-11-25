/**
 * Formatação e validação usadas nas telas (baseado em lib/formatar.js do site).
 */

export function soDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

/** Formata enquanto a pessoa digita: 00000-000 */
export function mascararCep(valor) {
  const d = soDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function cepEhValido(cep) {
  return soDigitos(cep).length === 8;
}

/** Data para exibir: 'AAAA-MM-DD' vira '31/12/2026'. */
export function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Formata a data enquanto a pessoa digita: 31/12/2026 */
export function mascararData(valor) {
  const d = soDigitos(valor).slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

/** '31/12/2026' vira '2026-12-31'. Devolve null se a data não existe (ex.: 31/02). */
export function dataBrParaIso(texto) {
  const d = soDigitos(texto);
  if (d.length !== 8) return null;
  const dia = Number(d.slice(0, 2));
  const mes = Number(d.slice(2, 4));
  const ano = Number(d.slice(4));
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null;
  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** Data de hoje em 'AAAA-MM-DD' (fuso do aparelho). */
export function hojeIso() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}

/** Valida uma data digitada (dd/mm/aaaa): precisa existir, não pode ser futura nem muito antiga. */
export function validarDataPassada(texto) {
  const iso = dataBrParaIso(texto);
  if (!iso) return { ok: false, erro: 'Data inválida. Use o formato dd/mm/aaaa.' };
  if (iso > hojeIso()) return { ok: false, erro: 'A data não pode ser no futuro.' };
  if (iso < '1940-01-01') return { ok: false, erro: 'Confira o ano da data.' };
  return { ok: true, iso };
}

/** "O+" vira "O positivo" (para leitores de tela). */
export function descreverTipo(tipo) {
  return String(tipo || '').replace('+', ' positivo').replace('-', ' negativo');
}

/** E-mail em minúsculas e sem espaços nas pontas. */
export function normalizarEmail(valor) {
  return String(valor || '').trim().toLowerCase();
}

/** Validação simples: algo@dominio.ext, sem espaços, até 120 caracteres. */
export function emailEhValido(valor) {
  const email = normalizarEmail(valor);
  return email.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Texto sem acentos e em minúsculas, para comparar cidades ("Recife" = "recife"). */
export function semAcento(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
