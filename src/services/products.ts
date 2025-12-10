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
  category?: string;
  available?: string;
  organic?: boolean;
};

export const getProducts = (params?: Record<string, any>) =>
  fetcher<Product[]>(api.get("/products", { params }));

export const getProduct = (id: number) => fetcher<Product>(api.get(`/products/${id}`));

export const createProduct = (payload: Partial<Product>) => fetcher(api.post("/products", payload));

export default {
  getProducts,
  getProduct,
  createProduct,
};
