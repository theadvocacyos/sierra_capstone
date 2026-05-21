const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname,'data','orders.db');
const fs = require('fs');

// ensure data dir
const dataDir = path.join(__dirname,'data');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true});

const db = new sqlite3.Database(dbPath);

db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id TEXT,
    name TEXT,
    phone TEXT,
    address TEXT,
    date TEXT,
    bouquet TEXT,
    quantity INTEGER,
    message TEXT,
    created TEXT
  )`);
});

function insertOrder(order, cb){
  const stmt = db.prepare(`INSERT INTO orders (remote_id,name,phone,address,date,bouquet,quantity,message,created) VALUES (?,?,?,?,?,?,?,?,?)`);
  stmt.run(order.id||null, order.name, order.phone, order.address, order.date, order.bouquet, order.quantity||1, order.message||'', order.created||new Date().toISOString(), function(err){
    stmt.finalize(); cb(err, this && this.lastID);
  });
}

function listOrders(cb){ db.all('SELECT * FROM orders ORDER BY id DESC', cb); }

function clearOrders(cb){ db.run('DELETE FROM orders', cb); }

module.exports = { insertOrder, listOrders, clearOrders };
