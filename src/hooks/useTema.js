import { usePreferencias } from '../store/usePreferencias';
import { paletas, escalas, fontes, tamanhos } from '../constants/theme';

/**
 * Junta o tema com as preferências da pessoa:
 *  - cores: paleta normal ou de alto contraste;
 *  - fs(n): tamanho de letra já multiplicado pelo nível escolhido (1, 2 ou 3).
 */
export function useTema() {
  const tamanho = usePreferencias((e) => e.tamanho);
  const altoContraste = usePreferencias((e) => e.altoContraste);

  const escala = escalas[tamanho] || 1;
  const cores = altoContraste ? paletas.altoContraste : paletas.normal;

  return {
    cores,
    fontes,
    tamanhos,
    escala,
    altoContraste,
    fs: (n) => Math.round(n * escala),
  };
}
