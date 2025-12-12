import { api, fetcher } from './api';

export const getCart = () => fetcher<any[]>(api.get('/cart'));

export const addToCart = (payload: { product_id: string; quantity?: number }) =>
  api.post('/cart', payload).then((res) => res.data);

export const updateCartItem = (id: string, payload: { quantity: number }) =>
  api.put(`/cart/${id}`, payload).then((res) => res.data);

export const removeCartItem = (id: string) => api.delete(`/cart/${id}`).then((res) => res.data);

export default { getCart, addToCart, updateCartItem, removeCartItem };
