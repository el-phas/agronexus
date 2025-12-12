import { api, fetcher } from './api';

export const getInsights = () => fetcher(api.get('/insights'));

export default { getInsights };
