import { Router } from 'express';
import { ah } from './asyncHandler.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import * as a from '../controllers/admin.controller.js';
import { invalidate } from '../core/cache.js';

const router = Router();
router.use(adminAuth);
// Любое изменение в админке сбрасывает кэш меню/баннеров/настроек
router.use((req, _res, next) => {
  if (req.method !== 'GET') invalidate();
  next();
});

router.get('/ping', a.ping);

router.get('/orders', ah(a.listOrders));
router.patch('/orders/:id', ah(a.updateOrder));

router.get('/products', ah(a.listProducts));
router.post('/products', ah(a.createProduct));
router.put('/products/:id', ah(a.updateProduct));
router.delete('/products/:id', ah(a.deleteProduct));

router.get('/banners', ah(a.listBanners));
router.post('/banners', ah(a.createBanner));
router.put('/banners/:id', ah(a.updateBanner));
router.delete('/banners/:id', ah(a.deleteBanner));

router.get('/promos', ah(a.listPromos));
router.post('/promos', ah(a.createPromo));
router.put('/promos/:id', ah(a.updatePromo));
router.delete('/promos/:id', ah(a.deletePromo));

router.get('/couriers', ah(a.couriersReport));

router.get('/settings', ah(a.readSettings));
router.put('/settings', ah(a.writeSettings));

router.post('/seed', ah(a.seedMenu));
router.post('/test-courier', ah(a.testCourier));

export default router;
