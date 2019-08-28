import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';
import authentication from '../middlewares/authentication'

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post('/shoppingcart/add', authentication, ShoppingCartController.addItemToCart);
router.get('/shoppingcart/:cart_id', authentication, ShoppingCartController.getCart);
router.put('/shoppingcart/update/:item_id', authentication, ShoppingCartController.updateCartItem);
router.delete('/shoppingcart/empty/:cart_id', authentication, ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', authentication, ShoppingCartController.removeItemFromCart);
router.post('/orders', authentication, ShoppingCartController.createOrder);
router.get(
  '/order/status/:token', // token contains {customer_id, order_id}
  ShoppingCartController.updateOrderStatus
);
router.get(
  '/orders/inCustomer/:customer_id',
  authentication, 
  ShoppingCartController.getCustomerOrders
);
router.get(
  '/orders/:order_id',
  authentication, 
  ShoppingCartController.getOrderSummary
);
router.get(
  '/orders/shortDetail/:order_id',
  authentication,
  ShoppingCartController.getOrderShortDetails
);

router.post(
  '/stripe/charge',
  authentication, 
  ShoppingCartController.processStripePayment
);

export default router;
