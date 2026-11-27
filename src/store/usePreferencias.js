/**
 * Preferências de acessibilidade, iguais às do site:
 * tamanho da letra (3 níveis) e modo de alto contraste.
 * Ficam salvas no aparelho (Zustand + persist no AsyncStorage).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TAMANHOS = [
  { valor: 1, rotulo: 'Normal' },
  { valor: 2, rotulo: 'Grande' },
  { valor: 3, rotulo: 'Muito grande' },
];

export const usePreferencias = create(
  persist(
    (set) => ({
      tamanho: 1,
      altoContraste: false,
      definirTamanho: (tamanho) => set({ tamanho }),
      alternarContraste: () => set((estado) => ({ altoContraste: !estado.altoContraste })),
    }),
    {
      name: 'ss:preferencias',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
