# Local Flower Delivery — Frontend MVP

Files generated:
- `order.html` — customer order form
- `admin.html` — list, export, and clear orders
- `css/styles.css` — simple styles
- `js/app.js` — saves orders to `localStorage` and provides admin utilities

How to run locally:
1. Open `index.html` in the `sierra_capstone` folder in your browser.
2. From the homepage click "Place an order" to test the form.
3. Visit "Admin: view orders" to export or clear orders.

 Notes:
 - This is a static MVP using `localStorage`. For production, add a backend (Node/Express + DB) and validation.
 - A minimal Node.js + SQLite API is included under the `server` folder. It supports `GET /api/orders`, `POST /api/orders`, and `DELETE /api/orders` (requires admin key).

 How to run the server locally:
1. Open a terminal in `sierra_capstone/website/server`.

 ```bash
 npm install
 ```

 3. Start the API (optionally set `ADMIN_KEY` and `PORT`):

 ```bash
 ADMIN_KEY=yourkey PORT=3000 npm start
 ```

4. Once the API is running, open your browser to `http://localhost:3000` to use the site — the Node server serves the root `index.html` and the app pages from the same origin.
 
 Admin key usage:
 - You can set `ADMIN_KEY` as an environment variable when starting the server. To perform admin actions (clear server orders) in the Admin UI, enter the admin key into the "Admin key" field and click "Save key". The key is stored in browser sessionStorage for the current tab only.

 If you want, I can wire a simple `npm` script to serve the static files from the Node server as well.
