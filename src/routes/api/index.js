import { Router } from 'express';
import welcomeRoute from './welcome.route';
import customerRoute from './customer.route';
import productRoute from './product.route';
import shoppingCartRoute from './shoppingCart.route';
import shippingRoute from './shipping.route';
import taxRoute from './tax.route';
import attributeRoute from './attribute.route';
import authentication from '../middlewares/authentication'

const routes = Router();

routes.use('/', welcomeRoute);
routes.use('/', customerRoute);
routes.use('/', shoppingCartRoute);
routes.use('/', authentication, productRoute);
routes.use('/', authentication, shippingRoute);
routes.use('/', authentication, taxRoute);
routes.use('/', authentication, attributeRoute);

export default routes;
