/**
 * Store de autenticação (Zustand + persist no AsyncStorage).
 * Guarda o usuário logado e o sessionToken do Parse, para a pessoa
 * continuar logada quando fecha e abre o app.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as auth from '../services/auth';
import { definirTokenSessao } from '../lib/api';

export const useAuth = create(
  persist(
    (set, get) => ({
      usuario: null,
      sessionToken: null,
      carregando: false,
      erro: null,
      // true depois que o AsyncStorage foi lido (o _layout espera isso antes de mostrar as telas)
      hidratado: false,

      entrar: async (email, senha) => {
        set({ carregando: true, erro: null });
        try {
          const { usuario, sessionToken } = await auth.entrar({ email, senha });
          set({ usuario, sessionToken, carregando: false });
          return true;
        } catch (e) {
          set({ erro: e.message, carregando: false });
          return false;
        }
      },

      cadastrar: async (nome, email, senha) => {
        set({ carregando: true, erro: null });
        try {
          const { usuario, sessionToken } = await auth.cadastrar({ nome, email, senha });
          set({ usuario, sessionToken, carregando: false });
          return true;
        } catch (e) {
          set({ erro: e.message, carregando: false });
          return false;
        }
      },

      sair: async () => {
        set({ carregando: true });
        await auth.sair();
        set({ usuario: null, sessionToken: null, carregando: false, erro: null });
      },

      limparErro: () => set({ erro: null }),

      // Ao abrir o app: confere no servidor se a sessão salva ainda vale (GET /users/me).
      restaurarSessao: async () => {
        const { sessionToken } = get();
        if (!sessionToken) return;
        try {
          const usuario = await auth.usuarioAtual(sessionToken);
          // O nome não vem do servidor: mantém o que já estava salvo no aparelho.
          set({ usuario: { ...usuario, nome: get().usuario?.nome || '' } });
        } catch (e) {
          // Token vencido ou inválido (206/209): desloga. Sem internet: mantém a sessão salva.
          if (e.codigo === 206 || e.codigo === 209) {
            definirTokenSessao(null);
            set({ usuario: null, sessionToken: null });
          }
        }
      },
    }),
    {
      name: 'ss:auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Só o usuário e o token vão para o disco.
      partialize: (estado) => ({ usuario: estado.usuario, sessionToken: estado.sessionToken }),
      onRehydrateStorage: () => (estado) => {
        definirTokenSessao(estado?.sessionToken);
        useAuth.setState({ hidratado: true });
      },
    }
  )
);
