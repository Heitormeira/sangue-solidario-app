/**
 * Store dos doadores (Zustand + persist no AsyncStorage).
 * Guarda a lista, os filtros, o estado de carregamento/erro, o cadastro
 * do usuário logado ("meu doador") e as ações de CRUD.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as servico from '../services/doadores';
import * as doacoes from '../services/doacoes';
import { consultarCep } from '../lib/viacep';

const FILTROS_INICIAIS = { tipo: '', cidade: '', soDisponiveis: false };

export const useDoadores = create(
  persist(
    (set, get) => ({
      lista: [],
      filtros: FILTROS_INICIAIS,
      carregando: false,
      erro: null,
      meuDoador: null,

      definirFiltro: (campo, valor) => set({ filtros: { ...get().filtros, [campo]: valor } }),
      limparFiltros: () => set({ filtros: FILTROS_INICIAIS }),

      // READ: lista com os filtros atuais
      carregar: async () => {
        set({ carregando: true, erro: null });
        try {
          const lista = await servico.listarDoadores(get().filtros);
          set({ lista, carregando: false });
        } catch (e) {
          set({ erro: e.message, carregando: false });
        }
      },

      // Busca de quem precisa de sangue (não muda a lista da aba Doadores)
      buscarCompativeis: (tipoReceptor, cidade) => servico.buscarCompativeis(tipoReceptor, cidade),

      // ViaCEP: o formulário preenche cidade/bairro/UF enquanto a pessoa digita
      consultarCep: (cep) => consultarCep(cep),

      // Um doador pelo id (tela de detalhe)
      buscarPorId: (id) => servico.buscarDoador(id),

      // Cadastro de doador do usuário logado (relacionamento 1:1)
      carregarMeu: async (usuarioId) => {
        if (!usuarioId) {
          set({ meuDoador: null });
          return null;
        }
        try {
          const meuDoador = await servico.buscarDoadorDoUsuario(usuarioId);
          set({ meuDoador });
          return meuDoador;
        } catch {
          return get().meuDoador;
        }
      },

      // CREATE
      criar: async (dados, usuarioId) => {
        const novo = await servico.criarDoador(dados, usuarioId);
        set({ meuDoador: novo, lista: [novo, ...get().lista] });
        return novo;
      },

      // UPDATE
      atualizar: async (id, dados) => {
        const atualizado = await servico.atualizarDoador(id, dados);
        set({
          lista: get().lista.map((d) => (d.id === id ? atualizado : d)),
          meuDoador: get().meuDoador?.id === id ? atualizado : get().meuDoador,
        });
        return atualizado;
      },

      // DELETE
      excluir: async (id) => {
        await servico.excluirDoador(id);
        set({
          lista: get().lista.filter((d) => d.id !== id),
          meuDoador: get().meuDoador?.id === id ? null : get().meuDoador,
        });
      },

      // Doações (Doador 1:N Doacao)
      listarDoacoes: (doadorId) => doacoes.listarDoacoesDoDoador(doadorId),
      listarMinhasDoacoes: (usuarioId) => doacoes.listarDoacoesDoUsuario(usuarioId),

      // Registrar/excluir doação muda o "ultimaDoacao" do doador: mantém a store em dia.
      registrarDoacao: async (dados, usuarioId) => {
        const doador = get().meuDoador;
        const { ultimaDoacao } = await doacoes.registrarDoacao(dados, doador, usuarioId);
        get().aplicarUltimaDoacao(doador.id, ultimaDoacao);
      },

      excluirDoacao: async (doacao) => {
        const doador = get().meuDoador;
        const { ultimaDoacao } = await doacoes.excluirDoacao(doacao, doador);
        if (doador) get().aplicarUltimaDoacao(doador.id, ultimaDoacao);
      },

      aplicarUltimaDoacao: (id, ultimaDoacao) => {
        const trocar = (d) => (d && d.id === id ? { ...d, ultimaDoacao } : d);
        set({ lista: get().lista.map(trocar), meuDoador: trocar(get().meuDoador) });
      },

      // No logout, esquece o cadastro do usuário anterior.
      limparMeu: () => set({ meuDoador: null }),
    }),
    {
      name: 'ss:doadores',
      storage: createJSONStorage(() => AsyncStorage),
      // Filtros e a última lista ficam salvos (a lista abre na hora, mesmo sem internet).
      partialize: (estado) => ({ filtros: estado.filtros, lista: estado.lista }),
    }
  )
);
