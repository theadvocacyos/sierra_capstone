const STORAGE_KEY = 'flowerOrders'

function loadOrders(){
  try{const raw = localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):[] }catch(e){return[]}
}

function saveOrders(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) }

async function postToApi(order){
  try{
    const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(order) });
    if(!res.ok) throw new Error('API error');
    return await res.json();
  }catch(err){ return null }
}

const bouquetOptions = {
  Classic: {
    title:'Classic — mixed seasonal',
    description:'A bright mixed bouquet of seasonal blooms, perfect for everyday gifting.',
    image:'images/classic.svg'
  },
  Roses: {
    title:'Roses — a dozen roses',
    description:'A classic dozen rose bouquet with elegant stems and rich color.',
    image:'images/roses.svg'
  },
  Premium: {
    title:'Premium — lilies & roses',
    description:'A premium arrangement with lilies, roses, and luxe seasonal accents.',
    image:'images/premium.svg'
  }
};

function updateBouquetPreview(){
  const bouquet = document.getElementById('bouquet');
  const selection = bouquet.value;
  const details = bouquetOptions[selection] || bouquetOptions.Classic;
  document.getElementById('bouquetImage').src = details.image;
  document.getElementById('bouquetImage').alt = `${details.title} preview`;
  document.getElementById('bouquetTitle').textContent = details.title;
  document.getElementById('bouquetDescription').textContent = details.description;
}

async function saveOrder(e){
  if(e) e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const date = document.getElementById('date').value;
  const bouquet = document.getElementById('bouquet').value;
  const quantity = parseInt(document.getElementById('quantity').value,10)||1;
  const message = document.getElementById('message').value.trim();
  if(!name||!phone||!address||!date){ alert('Please fill required fields'); return }
  const order = {id:Date.now().toString(), name, phone, address, date, bouquet, quantity, message, created:new Date().toISOString()}

  const apiRes = await postToApi(order);
  if(apiRes && apiRes.ok){
    showConfirmation(order);
    document.getElementById('orderForm').reset();
    return;
  }

  // fallback to localStorage
  const orders = loadOrders(); orders.push(order); saveOrders(orders);
  showConfirmation(order);
  document.getElementById('orderForm').reset();
}

function showConfirmation(order){
  const c = document.getElementById('confirmation');
  c.hidden = false;
  c.textContent = `Order received for ${order.name} — Delivery: ${order.date}`;
  setTimeout(()=>{ c.hidden = true; c.textContent = ''; },5000);
}

async function fetchOrdersFromApi(){
  try{ const res = await fetch('/api/orders'); if(!res.ok) throw new Error('api'); return await res.json(); }catch(e){ return null }
}

async function renderAdmin(){
  const tbody = document.querySelector('#ordersTable tbody');
  tbody.innerHTML = '';
  const apiOrders = await fetchOrdersFromApi();
  const orders = apiOrders && Array.isArray(apiOrders) ? apiOrders : loadOrders();
  if(orders.length===0){ tbody.innerHTML = '<tr><td colspan="8">No orders</td></tr>'; return }
  orders.forEach((o,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(o.name)}</td><td>${escapeHtml(o.phone)}</td><td>${escapeHtml(o.address)}</td><td>${o.date || ''}</td><td>${escapeHtml(o.bouquet)}</td><td>${o.quantity || ''}</td><td>${escapeHtml(o.message)}</td>`
    tbody.appendChild(tr);
  })
}

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>\\\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

async function exportCSV(){
  // try server first
  const apiOrders = await fetchOrdersFromApi();
  const orders = apiOrders && Array.isArray(apiOrders) ? apiOrders : loadOrders();
  if(orders.length===0){ alert('No orders to export'); return }
  const headers = ['id','name','phone','address','date','bouquet','quantity','message','created'];
  const rows = [headers.join(',')].concat(orders.map(o=>headers.map(h=>`"${(o[h]||'').toString().replace(/"/g,'""')}"`).join(',')));
  const blob = new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'flower-orders.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

async function clearOrders(){
  if(!confirm('Clear all orders?')) return;
  // attempt server clear using stored admin key in sessionStorage
  let key = sessionStorage.getItem('adminKey');
  if(!key){
    key = prompt('Enter admin key to clear server orders (leave blank to clear local only):');
    if(key) sessionStorage.setItem('adminKey', key);
  }
  if(key){
    try{
      const res = await fetch(`/api/orders`, { method:'DELETE', headers: {'x-admin-key': key} });
      if(res.ok){ alert('Server orders cleared'); renderAdmin(); return }
    }catch(e){}
    alert('Server clear failed or invalid key — falling back to localStorage clear');
  }
  localStorage.removeItem(STORAGE_KEY); renderAdmin(); alert('Local orders cleared');
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('orderForm'); if(form){
    form.addEventListener('submit', saveOrder);
    document.getElementById('bouquet').addEventListener('change', updateBouquetPreview);
    updateBouquetPreview();
  }
  if(document.getElementById('ordersTable')) renderAdmin();
});
