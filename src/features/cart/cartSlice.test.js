import { describe, it, expect } from 'vitest';
import cartReducer, { clearCart } from './cartSlice';

describe('cartSlice', () => {
  it('clears items and error when clearCart is dispatched', () => {
    const initialState = {
      items: [{ id: '1', name: 'Test Product', price: 100, quantity: 2 }],
      loading: false,
      error: 'some previous error',
    };

    const newState = cartReducer(initialState, clearCart());

    expect(newState.items).toEqual([]);
    expect(newState.error).toBeNull();
  });

  it('returns the correct initial state', () => {
    const state = cartReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ items: [], loading: false, error: null });
  });
});