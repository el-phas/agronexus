import { api, fetcher } from "./api";

export type Product = {
  id: number;
  name: string;
  farmer: string;
  location?: string;
  price: number;
  unit: string;
  rating?: number;
  reviews?: number;
  image?: string;
  image_url?: string;
  video_url?: string;
  category?: string;
  available?: string;
  organic?: boolean;
};

export const getProducts = (params?: Record<string, any>) =>
  // backend returns { results, total, page, limit } for list endpoints
  api.get('/products', { params }).then((res) => res.data.results || res.data);

export const getProduct = (id: number) => fetcher<Product>(api.get(`/products/${id}`));

export const createProduct = (payload: FormData) =>
  api.post('/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);

export default {
  getProducts,
  getProduct,
  createProduct,
};
