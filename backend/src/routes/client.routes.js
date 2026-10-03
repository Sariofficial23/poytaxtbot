import { Router } from 'express';
import { ah } from './asyncHandler.js';
import { telegramAuth } from '../middlewares/telegramAuth.js';
import * as c from '../controllers/client.controller.js';

const router = Router();

router.get('/products', ah(c.getProducts));
router.get('/banners', ah(c.getBanners));
router.get('/settings', ah(c.getPublicSettings));
router.get('/img/:kind/:id', ah(c.getImageFile));
router.post('/promo/check', ah(c.checkPromo));
router.post('/orders', telegramAuth, ah(c.createOrder));
router.get('/orders/my', telegramAuth, ah(c.getMyOrders));

export default router;
