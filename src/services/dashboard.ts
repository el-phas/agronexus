import { api, fetcher } from "./api";

export type Stat = {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
};

export const getDashboardStats = () => fetcher<Stat[]>(api.get("/farmers/dashboard"));

export const getRecentOrders = () => fetcher<any[]>(api.get("/orders/recent"));

export default { getDashboardStats, getRecentOrders };
