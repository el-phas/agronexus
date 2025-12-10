import { api, fetcher } from './api';

export const initiatePayment = (orderId: number, phoneNumber: string) =>
  fetcher(api.post('/payments/initiate', { orderId, phoneNumber }));

export const checkPaymentStatus = (paymentId: string | number) =>
  fetcher(api.get(`/payments/${paymentId}/status`));

export default { initiatePayment, checkPaymentStatus };
