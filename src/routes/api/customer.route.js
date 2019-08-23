import { Router } from 'express';
import CustomerController from '../../controllers/customer.controller';
import authentication from '../middlewares/authentication'

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.post(
  '/customers',
  CustomerController.create
);
router.post('/customers/login',  CustomerController.login);
router.get('/customer/:id', authentication, CustomerController.getCustomerProfile);
router.put(
  '/customer/:id',
  authentication,
  CustomerController.updateCustomerProfile
);
router.put(
  '/customer/address/:id',
  authentication,
  CustomerController.updateCustomerAddress
);
router.put(
  '/customer/creditCard/:id',
  authentication,
  CustomerController.updateCreditCard
);

export default router;
