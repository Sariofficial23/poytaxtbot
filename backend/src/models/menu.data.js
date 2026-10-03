// Полное меню Poytaxt — заливается кнопкой «Обновить меню» в админке
// или командой `npm run seed`.
// Порядок категорий в мини-аппе = порядок первого появления категории здесь.
// Поля: name, description, category, newPrice (so'm), oldPrice? (зачёркнутая цена), image? (URL)
// Фото лежат в backend/public/menu/ (вырезаны из PDF-меню, 800×800).
// Позиции без фото — клиент добавит в админке (Товары → ✏️ → Загрузить фото).

import { readFileSync } from 'fs';
import crypto from 'crypto';

// Версия файла в ссылке — при замене фото телефоны клиентов загрузят новое
const photoUrl = (file) => {
  try {
    const v = crypto.createHash('md5').update(readFileSync(new URL(`../../public/menu/${file}`, import.meta.url))).digest('hex').slice(0, 8);
    return `/api/menu-img/${file}?v=${v}`;
  } catch {
    return null;
  }
};

const ZAVTRAK = 'Завтрак';
const MANGAL = 'Мангал';
const SHASHLYK = 'Шашлыки';
const SALAT = 'Салаты';

// ЦЕНЫ: в PDF-меню цены не заполнены. Впишите цену (в сумах) вместо 0.
// Позиции с ценой 0 НЕ попадают в мини-апп — так блюдо не покажется бесплатным.
const items = [
  // Завтрак
  [ZAVTRAK, 'Яйца жареные, варёные', 0],
  [ZAVTRAK, 'Картошка фри', 0],
  [ZAVTRAK, 'Кофе', 0],
  [ZAVTRAK, 'Какао', 0],
  [ZAVTRAK, 'Булочки', 0],
  [ZAVTRAK, 'Сосиски жареные', 0],
  [ZAVTRAK, 'Олот фитчи', 0],
  [ZAVTRAK, 'Олот самса', 0],
  [ZAVTRAK, 'Сомса гўштлик', 0],
  [ZAVTRAK, 'Сомса картошкалик', 0],
  [ZAVTRAK, 'Сомса товуқлик', 0],

  // Мангал (порция 350 г)
  [MANGAL, 'Рыба на мангале 350 г', 0],
  [MANGAL, 'Корейка из баранины 350 г', 0],
  [MANGAL, 'Котлеты на мангале 350 г', 0],
  [MANGAL, 'Сосиски с сыром на мангале 350 г', 0],
  [MANGAL, 'Крылышки на мангале 350 г', 0],
  [MANGAL, 'Куриные бёдра на мангале 350 г', 0],

  // Шашлыки
  [SHASHLYK, 'Шашлык кусковой из говядины (жаз)', 0],
  [SHASHLYK, 'Шашлык кусковой из баранины (жаз)', 0],
  [SHASHLYK, 'Шашлык молотый', 0],
  [SHASHLYK, 'Шашлык куриный', 0],
  [SHASHLYK, 'Шашлык рыбный', 0],
  [SHASHLYK, 'Мясное ассорти на мангале на 4 персоны', 0],
  [SHASHLYK, 'Мясное ассорти на мангале на 8 персон', 0],

  // Салаты
  [SALAT, 'Винегрет', 0],
  [SALAT, 'Мужской каприз', 0],
  [SALAT, 'Оливье', 0],
  [SALAT, 'Цезарь', 0],
  [SALAT, 'Смак', 0],
  [SALAT, 'Солёное ассорти', 0],
  [SALAT, 'Свежее ассорти', 0],
  [SALAT, 'Весенний', 0],
  [SALAT, 'Сузьма', 0],
  [SALAT, 'Греческий', 0],
  [SALAT, 'Японский', 0],
  [SALAT, 'Чирокчи', 0],
  [SALAT, 'Ачичук', 0],
  [SALAT, 'Катык', 0],
  [SALAT, 'Холодец', 0],
];

// Название позиции → файл фото в backend/public/menu/
// Без фото: Сомса гўштлик, Сомса картошкалик, Сомса товуқлик (добавить в админке).
const PHOTOS = {
  'Яйца жареные, варёные': 'yaytsa.jpg',
  'Картошка фри': 'kartoshka-fri.jpg',
  'Кофе': 'kofe.jpg',
  'Какао': 'kakao.jpg',
  'Булочки': 'bulochki.jpg',
  'Сосиски жареные': 'sosiski-zharenye.jpg',
  'Олот фитчи': 'olot-fitchi.jpg',
  'Олот самса': 'olot-samsa.jpg',
  'Рыба на мангале 350 г': 'ryba-na-mangale.jpg',
  'Корейка из баранины 350 г': 'koreyka-iz-baraniny.jpg',
  'Котлеты на мангале 350 г': 'kotlety-na-mangale.jpg',
  'Сосиски с сыром на мангале 350 г': 'sosiski-s-syrom.jpg',
  'Крылышки на мангале 350 г': 'krylyshki-na-mangale.jpg',
  'Куриные бёдра на мангале 350 г': 'kurinye-bedra.jpg',
  'Шашлык кусковой из говядины (жаз)': 'kuskovoy.jpg',
  'Шашлык кусковой из баранины (жаз)': 'kuskovoy.jpg',
  'Шашлык молотый': 'shashlyk-molotyy.jpg',
  'Шашлык куриный': 'shashlyk-kurinyy.jpg',
  'Шашлык рыбный': 'shashlyk-rybnyy.jpg',
  'Мясное ассорти на мангале на 4 персоны': 'assorti-4.jpg',
  'Мясное ассорти на мангале на 8 персон': 'assorti-8.jpg',
  'Винегрет': 'vinegret.jpg',
  'Мужской каприз': 'muzhskoy-kapriz.jpg',
  'Оливье': 'olive.jpg',
  'Цезарь': 'tsezar.jpg',
  'Смак': 'smak.jpg',
  'Солёное ассорти': 'solenoe-assorti.jpg',
  'Свежее ассорти': 'svezhee-assorti.jpg',
  'Весенний': 'vesenniy.jpg',
  'Сузьма': 'suzma.jpg',
  'Греческий': 'grecheskiy.jpg',
  'Японский': 'yaponskiy.jpg',
  'Чирокчи': 'chirokchi.jpg',
  'Ачичук': 'achichuk.jpg',
  'Катык': 'katyk.jpg',
  'Холодец': 'kholodets.jpg',
};

export const MENU = items
  .filter(([, , newPrice]) => newPrice > 0)
  .map(([category, name, newPrice]) => ({
    category,
    name,
    newPrice,
    description: '',
    oldPrice: null,
    image: PHOTOS[name] ? photoUrl(PHOTOS[name]) : null,
  }));

// Для проверки: все позиции, включая ещё без цены
export const ALL_ITEMS = items;
