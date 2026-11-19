BEGIN TRANSACTION;
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT,
    signup_date DATE
);
INSERT INTO "customers" VALUES(1,'Customer_1','user1@example.com','Delhi','2026-07-28');
INSERT INTO "customers" VALUES(2,'Customer_2','user2@example.com','Delhi','2026-02-25');
CREATE TABLE order_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price REAL
);
INSERT INTO "order_items" VALUES(1,1,4,3,3426.23);
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    order_date DATE,
    status TEXT,
    total_amount REAL
);
INSERT INTO "orders" VALUES(1,12,'2026-10-14','Delivered',10278.69);
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT,
    price REAL,
    stock_quantity INTEGER
);
INSERT INTO "products" VALUES(1,'Product_1','Apparel',14638.06,101);
COMMIT;
