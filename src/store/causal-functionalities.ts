import { create } from "zustand";

type Token = { id: string; value: number; label: string; type: 'chip' | 'operator' };

interface UseFormulaStore {
  tokens: Record<string, Token[]>;
  addChip: (rowKey: string, chip: Token) => void;
  addOperator: (rowKey: string, op: string) => void;
  removeToken: (rowKey: string, id: string) => void;
}

export const useFormulaStore = create<UseFormulaStore>((set) => ({
  tokens: {},
  addChip: (rowKey, chip) => set(state => ({
    tokens: { ...state.tokens, [rowKey]: [...(state.tokens[rowKey] || []), chip] }
  })),
  addOperator: (rowKey, op) => set(state => ({
    tokens: { ...state.tokens, [rowKey]: [...(state.tokens[rowKey] || []), { id: Date.now().toString(), value: NaN, label: op, type: 'operator' }] }
  })),
  removeToken: (rowKey, id) => set(state => ({
    tokens: { ...state.tokens, [rowKey]: (state.tokens[rowKey] || []).filter(t => t.id !== id) }
  })),
}));