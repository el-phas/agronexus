import fetch from 'node-fetch';

const API = 'http://localhost:4000/api';

async function run(){
  console.log('1) Login buyer_user');
  const loginRes = await fetch(API + '/auth/login', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email:'buyer@example.com', password:'password123'})
  });
  const login = await loginRes.json();
  console.log('login status', loginRes.status);
  console.log(login);
  const token = login.token;
  if(!token) return console.log('login failed, abort');

  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  console.log('\n2) Fetch products');
  const prodRes = await fetch(API + '/products', { headers });
  const prods = await prodRes.json();
  console.log('products count:', prods.results?.length || prods.length || 0);
  const product = (prods.results && prods.results[0]) || (prods[0]) || null;
  if(!product) return console.log('no product found');
  console.log('sample product id', product._id || product.id);

  console.log('\n3) Create an order for 1 item');
  const item = {
    product_id: product._id || product.id,
    seller_id: product.farmer_id || product.seller_id,
    quantity: 1,
    unit_price: product.price || product.unit_price || 100
  };
  const orderRes = await fetch(API + '/orders', { method: 'POST', headers, body: JSON.stringify({ items:[item], delivery_address: 'Test address', delivery_notes: 'Leave at gate' }) });
  const order = await orderRes.json();
  console.log('order status', orderRes.status);
  console.log(order);

  if(order.id || order._id){
    const orderId = order.id || order._id;
    console.log('\n4) Initiate payment (will call Daraja service, may fail without credentials)');
    const payRes = await fetch(API + '/payments/initiate', { method:'POST', headers, body: JSON.stringify({ orderId, phoneNumber: '254712345678' })});
    const pay = await payRes.json();
    console.log('payment status', payRes.status);
    console.log(pay);
  }
}

run().catch(e=>{ console.error('error', e); process.exit(1);} );
