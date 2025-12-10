import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DARAJA_BASE_URL = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET;
const SHORTCODE = process.env.DARAJA_SHORTCODE;
const PASSKEY = process.env.DARAJA_PASSKEY;

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (cachedToken && tokenExpiry > Date.now()) return cachedToken;

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const url = `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

  const res = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + 3590000; // 59m
  return cachedToken;
}

function formatPhone(phone) {
  if (!phone) return null;
  let p = phone.trim();
  p = p.replace(/^\+/, '');
  if (p.length === 10 && p.startsWith('0')) p = '254' + p.slice(1);
  if (p.length === 9) p = '254' + p;
  if (!p.startsWith('254')) p = p;
  return p;
}

function getTimestamp() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

export async function initiateStkPush({ phoneNumber, amount, orderId, accountReference = `ORDER-${orderId}`, transactionDescription = 'AgroNexus Purchase' }) {
  try {
    const formatted = formatPhone(phoneNumber);
    if (!formatted) throw new Error('Invalid phone number');

    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formatted,
      PartyB: SHORTCODE,
      PhoneNumber: formatted,
      CallBackURL: `${process.env.BASE_URL || 'http://localhost:4000'}/api/payments/callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDescription,
    };

    const res = await axios.post(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, { headers: { Authorization: `Bearer ${token}` } });
    return { success: true, data: res.data };
  } catch (error) {
    console.error('daraja.initiateStkPush error', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
}

export async function queryStkStatus(checkoutRequestId) {
  try {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const res = await axios.post(`${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`, payload, { headers: { Authorization: `Bearer ${token}` } });
    return { success: true, data: res.data };
  } catch (error) {
    console.error('daraja.queryStkStatus error', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
}

export default { initiateStkPush, queryStkStatus, getAccessToken };
