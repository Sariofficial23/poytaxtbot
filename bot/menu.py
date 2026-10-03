"""Menu is stored in menu.json so it can be edited without touching the code.

Text fields can be a plain string or a {"ru": "...", "uz": "..."} dict.
"""
import json
import re
from dataclasses import dataclass

ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,30}$")


def localize(value, lang: str) -> str:
    if isinstance(value, dict):
        return value.get(lang) or value.get("ru") or next(iter(value.values()), "")
    return value or ""


@dataclass
class Item:
    id: str
    category_id: str
    name: dict | str
    price: int
    description: dict | str = ""
    photo: str | None = None
    available: bool = True


@dataclass
class Category:
    id: str
    name: dict | str
    items: list[Item]


class Menu:
    def __init__(self, path: str):
        self.path = path
        self.categories: list[Category] = []
        self.items: dict[str, Item] = {}
        self.load()

    def load(self) -> None:
        with open(self.path, encoding="utf-8") as f:
            data = json.load(f)
        categories, items = [], {}
        for c in data["categories"]:
            cat_items = []
            for i in c.get("items", []):
                item = Item(
                    id=str(i["id"]),
                    category_id=str(c["id"]),
                    name=i["name"],
                    price=int(i["price"]),
                    description=i.get("description", ""),
                    photo=i.get("photo") or None,
                    available=i.get("available", True),
                )
                if not ID_RE.match(item.id):
                    raise ValueError(f"Неверный id блюда «{item.id}»: только латиница, цифры, _ и -, до 30 символов")
                if item.id in items:
                    raise ValueError(f"Повторяющийся id блюда в menu.json: {item.id}")
                items[item.id] = item
                cat_items.append(item)
            if not ID_RE.match(str(c["id"])):
                raise ValueError(f"Неверный id категории «{c['id']}»: только латиница, цифры, _ и -, до 30 символов")
            categories.append(Category(id=str(c["id"]), name=c["name"], items=cat_items))
        self.categories, self.items = categories, items

    def category(self, category_id: str) -> Category | None:
        return next((c for c in self.categories if c.id == category_id), None)

    def visible_categories(self) -> list[Category]:
        return [c for c in self.categories if any(i.available for i in c.items)]
