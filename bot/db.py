import json
import os

import aiosqlite

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    lang TEXT,
    full_name TEXT,
    username TEXT,
    phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS cart (
    user_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    qty INTEGER NOT NULL,
    PRIMARY KEY (user_id, item_id)
);
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    items TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    delivery_type TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    phone TEXT NOT NULL,
    comment TEXT,
    payment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


class Database:
    def __init__(self, path: str):
        self.path = path
        self.conn: aiosqlite.Connection | None = None

    async def connect(self) -> None:
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
        self.conn = await aiosqlite.connect(self.path)
        self.conn.row_factory = aiosqlite.Row
        await self.conn.executescript(SCHEMA)
        await self.conn.commit()

    async def close(self) -> None:
        if self.conn:
            await self.conn.close()

    # --- users ---
    async def upsert_user(self, user_id: int, full_name: str, username: str | None) -> None:
        await self.conn.execute(
            "INSERT INTO users (id, full_name, username) VALUES (?, ?, ?) "
            "ON CONFLICT(id) DO UPDATE SET full_name=excluded.full_name, username=excluded.username",
            (user_id, full_name, username),
        )
        await self.conn.commit()

    async def get_user(self, user_id: int) -> aiosqlite.Row | None:
        async with self.conn.execute("SELECT * FROM users WHERE id=?", (user_id,)) as cur:
            return await cur.fetchone()

    async def set_lang(self, user_id: int, lang: str) -> None:
        await self.conn.execute("UPDATE users SET lang=? WHERE id=?", (lang, user_id))
        await self.conn.commit()

    async def set_phone(self, user_id: int, phone: str) -> None:
        await self.conn.execute("UPDATE users SET phone=? WHERE id=?", (phone, user_id))
        await self.conn.commit()

    async def all_user_ids(self) -> list[int]:
        async with self.conn.execute("SELECT id FROM users") as cur:
            return [row["id"] for row in await cur.fetchall()]

    # --- cart ---
    async def get_cart(self, user_id: int) -> dict[str, int]:
        async with self.conn.execute("SELECT item_id, qty FROM cart WHERE user_id=?", (user_id,)) as cur:
            return {row["item_id"]: row["qty"] for row in await cur.fetchall()}

    async def add_to_cart(self, user_id: int, item_id: str, qty: int) -> None:
        await self.conn.execute(
            "INSERT INTO cart (user_id, item_id, qty) VALUES (?, ?, ?) "
            "ON CONFLICT(user_id, item_id) DO UPDATE SET qty = qty + excluded.qty",
            (user_id, item_id, qty),
        )
        await self.conn.commit()

    async def change_qty(self, user_id: int, item_id: str, delta: int) -> None:
        await self.conn.execute(
            "UPDATE cart SET qty = qty + ? WHERE user_id=? AND item_id=?", (delta, user_id, item_id)
        )
        await self.conn.execute("DELETE FROM cart WHERE user_id=? AND qty <= 0", (user_id,))
        await self.conn.commit()

    async def remove_from_cart(self, user_id: int, item_id: str) -> None:
        await self.conn.execute("DELETE FROM cart WHERE user_id=? AND item_id=?", (user_id, item_id))
        await self.conn.commit()

    async def clear_cart(self, user_id: int) -> None:
        await self.conn.execute("DELETE FROM cart WHERE user_id=?", (user_id,))
        await self.conn.commit()

    # --- orders ---
    async def create_order(self, **fields) -> int:
        fields["items"] = json.dumps(fields["items"], ensure_ascii=False)
        cols = ", ".join(fields)
        marks = ", ".join("?" for _ in fields)
        cur = await self.conn.execute(f"INSERT INTO orders ({cols}) VALUES ({marks})", tuple(fields.values()))
        await self.conn.commit()
        return cur.lastrowid

    async def get_order(self, order_id: int) -> aiosqlite.Row | None:
        async with self.conn.execute("SELECT * FROM orders WHERE id=?", (order_id,)) as cur:
            return await cur.fetchone()

    async def set_order_status(self, order_id: int, status: str) -> None:
        await self.conn.execute("UPDATE orders SET status=? WHERE id=?", (status, order_id))
        await self.conn.commit()

    async def user_orders(self, user_id: int, limit: int = 5) -> list[aiosqlite.Row]:
        async with self.conn.execute(
            "SELECT * FROM orders WHERE user_id=? ORDER BY id DESC LIMIT ?", (user_id, limit)
        ) as cur:
            return await cur.fetchall()

    async def stats(self, today: str) -> dict:
        async def one(sql: str, *args):
            async with self.conn.execute(sql, args) as cur:
                row = await cur.fetchone()
                return row[0] or 0

        return {
            "users": await one("SELECT COUNT(*) FROM users"),
            "orders_total": await one("SELECT COUNT(*) FROM orders WHERE status != 'cancelled'"),
            "orders_today": await one(
                "SELECT COUNT(*) FROM orders WHERE status != 'cancelled' AND date(created_at)=?", today
            ),
            "revenue_today": await one(
                "SELECT SUM(total) FROM orders WHERE status = 'delivered' AND date(created_at)=?", today
            ),
            "revenue_total": await one("SELECT SUM(total) FROM orders WHERE status = 'delivered'"),
        }
