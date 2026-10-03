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

// Цены — с бумажного меню. Позиции с ценой 0 НЕ попадают в мини-апп
// (так блюдо не покажется бесплатным). Нет цены: Какао, Булочки, Холодец.
const items = [
  // Завтрак
  [ZAVTRAK, 'Яйца жареные, варёные', 4000],
  [ZAVTRAK, 'Картошка фри', 25000],
  [ZAVTRAK, 'Кофе', 8000],
  [ZAVTRAK, 'Какао', 0],
  [ZAVTRAK, 'Булочки', 0],
  [ZAVTRAK, 'Сосиски жареные', 8000],
  [ZAVTRAK, 'Олот фитчи', 15000],
  [ZAVTRAK, 'Олот самса', 12000],
  [ZAVTRAK, 'Сомса гўштлик', 12000],
  [ZAVTRAK, 'Сомса картошкалик', 5000],
  [ZAVTRAK, 'Сомса товуқлик', 7000],

  // Мангал (порция 350 г)
  [MANGAL, 'Рыба на мангале 350 г', 70000],
  [MANGAL, 'Корейка из баранины 350 г', 95000],
  [MANGAL, 'Котлеты на мангале 350 г', 75000],
  [MANGAL, 'Сосиски с сыром на мангале 350 г', 80000],
  [MANGAL, 'Крылышки на мангале 350 г', 70000],
  [MANGAL, 'Куриные бёдра на мангале 350 г', 70000],

  // Шашлыки
  [SHASHLYK, 'Шашлык кусковой из говядины (жаз)', 25000],
  [SHASHLYK, 'Шашлык кусковой из баранины (жаз)', 25000],
  [SHASHLYK, 'Шашлык молотый', 23000],
  [SHASHLYK, 'Шашлык куриный', 23000],
  [SHASHLYK, 'Шашлык рыбный', 23000],
  [SHASHLYK, 'Мясное ассорти на мангале на 4 персоны', 450000],
  [SHASHLYK, 'Мясное ассорти на мангале на 8 персон', 850000],

  // Салаты
  [SALAT, 'Винегрет', 30000],
  [SALAT, 'Мужской каприз', 45000],
  [SALAT, 'Оливье', 40000],
  [SALAT, 'Цезарь', 45000],
  [SALAT, 'Смак', 35000],
  [SALAT, 'Солёное ассорти', 25000],
  [SALAT, 'Свежее ассорти', 25000],
  [SALAT, 'Весенний', 16000],
  [SALAT, 'Сузьма', 13000],
  [SALAT, 'Греческий', 45000],
  [SALAT, 'Японский', 45000],
  [SALAT, 'Чирокчи', 35000],
  [SALAT, 'Ачичук', 22000],
  [SALAT, 'Катык', 6000],
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
