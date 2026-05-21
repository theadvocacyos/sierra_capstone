const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { insertOrder, listOrders, clearOrders } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

app.use(cors());
app.use(express.json());

// Serve static frontend from the website folder so visiting root serves website/index.html and app pages
const siteRoot = path.join(__dirname, '..');
app.use(express.static(siteRoot));
console.log('Serving static files from', siteRoot);

// simple health
app.get('/api/ping', (req,res)=>res.json({ok:true}));

app.get('/api/orders', (req,res)=>{
  listOrders((err, rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows||[]);
  });
});

app.post('/api/orders', (req,res)=>{
  const order = req.body;
  if(!order || !order.name || !order.phone) return res.status(400).json({error:'invalid order'});
  insertOrder(order, (err, id)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json({ok:true,id});
  });
});

app.delete('/api/orders', (req,res)=>{
  const key = req.header('x-admin-key')||req.query.key;
  if(key !== ADMIN_KEY) return res.status(403).json({error:'forbidden'});
  clearOrders((err)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json({ok:true});
  });
});

app.listen(PORT, ()=>{
  console.log(`Flower API listening on http://localhost:${PORT}`);
});
