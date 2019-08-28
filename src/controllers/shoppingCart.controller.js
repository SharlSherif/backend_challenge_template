/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 * 
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new cart to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a cart in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a cart from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import { ShoppingCart, Order, Product, Customer, sequelize } from '../database/models'
import { generateToken, decodeToken } from '../helpers/token'

import uuid from 'uuid'
import Stripe from 'stripe'
import sendMail from '../helpers/sendMail'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
    /**
     * generate random unique id for cart identifier
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with cart_id
     * @memberof shoppingCartController
     */
    static generateUniqueCart(req, res) {
        // remove dashes from the generated UUID to fit in a CHAR(32) column
        const cart_id = uuid().replace(/[-]/g, '')
        return res.status(200).json({ cart_id });
    }

    /**
     * adds item to a cart with cart_id
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with cart
     * @memberof ShoppingCartController
     */
    static async addItemToCart(req, res, next) {
        const { cart_id, product_id, attributes, quantity } = req.body;

        try {
            const cart = await ShoppingCart.create({
                cart_id,
                product_id,
                attributes,
                quantity,
                buy_now: 1 // assinging false / 0 to this value casuses the ordering process to fail
            })

            return res.status(200).json(cart);
        } catch (error) {
            next(error)
        }
    }

    /**
     * get shopping cart using the cart_id
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with cart
     * @memberof ShoppingCartController
     */
    static async getCart(req, res, next) {
        const { cart_id } = req.params; // eslint-disable-line
        const cart = await ShoppingCart.findAll({
            where: {
                cart_id
            }
        })

        if (cart.length > 0) {
            return res.status(200).json(cart);
        }

        next('cart not found');
    }

    /**
     * update cart item quantity using the item_id in the request param
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with cart
     * @memberof ShoppingCartController
     */
    static async updateCartItem(req, res, next) {
        const { item_id } = req.params // eslint-disable-line
        const { quantity } = req.body;

        try {
            // since "update" in sequelize only returns the affected rows and not the data
            // i had to request the data separately
            const [i, cart] = await Promise.all([
                await ShoppingCart.update({ quantity }, { where: { item_id } }),
                await ShoppingCart.findByPk(item_id)
            ])

            return res.status(200).send(cart)
        } catch (error) {
            next(error)
        }
    }

    /**
     * removes all items in a cart
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with cart
     * @memberof ShoppingCartController
     */
    static async emptyCart(req, res, next) {
        const { cart_id } = req.params;

        try {
            await sequelize.query('CALL shopping_cart_empty(:cart_id)', {
                replacements: {
                    cart_id,
                }
            })
            return res.status(200).json([])
        } catch (error) {
            next(error);
        }
    }

    /**
     * remove single item from cart
     * cart id is obtained from current session
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with message
     * @memberof ShoppingCartController
     */
    static async removeItemFromCart(req, res, next) {
        const { item_id } = req.params;

        try {
            await sequelize.query('CALL shopping_cart_remove_product(:item_id)', {
                replacements: {
                    item_id,
                }
            })
            return res.status(200).json({ message: 'successfully removed' })
        } catch (error) {
            next(error);
        }
    }

    /**
     * create an order from a cart
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with created order
     * @memberof ShoppingCartController
     */
    static async createOrder(req, res, next) {
        const { cart_id, shipping_id, tax_id } = req.body;
        const { customer_id } = req.customer;

        try {
            const order = await sequelize.query('CALL shopping_cart_create_order(:cart_id, :customer_id, :shipping_id, :tax_id)', {
                replacements: {
                    cart_id,
                    customer_id,
                    shipping_id,
                    tax_id
                }
            })

            return res.status(200).json({ order_id: order[0].orderId })
        } catch (error) {
            next(error);
        }
    }

    /**
     * get all customer orders 
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with customer's orders
     * @memberof ShoppingCartController
     */
    static async getCustomerOrders(req, res, next) {
        const { customer_id } = req.params; // eslint-disable-line

        const order = await Order.findOne({
            include: [{
                model: Customer,
                attributes: ['name']
            }],
            attributes: [
                "order_id",
                "total_amount",
                "created_on",
                "shipped_on"
            ],
            where: { customer_id }
        })

        /*
          I know this one is bad. 
          using the operator "..." didn't work with the response from Order.findOne, had to do it that way.
        */
        if (order !== null) {
            const { order_id, total_amount, cheated_on, shipped_on } = order;
            const { name } = order.Customer;

            return res.status(200).json({
                order_id,
                total_amount,
                cheated_on,
                shipped_on,
                name
            })
        }

        next('no orders were found');
    }

    /**
     * get order summary
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with order summary
     * @memberof ShoppingCartController
     */
    static async getOrderSummary(req, res, next) {
        const { order_id } = req.params; // eslint-disable-line

        try {
            const order_items = await sequelize.query('CALL orders_get_order_details(:order_id)', {
                replacements: {
                    order_id,
                }
            })

            if (order_items.length < 1) return next('order summary not found')

            return res.status(200).json({ order_id: Number(order_id), order_items })
        } catch (error) {
            next(error);
        }
    }

    /**
     * get order short details
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with order short details
     * @memberof ShoppingCartController
     */
    static async getOrderShortDetails(req, res, next) {
        const { order_id } = req.params; // eslint-disable-line

        try {
            const orderDetails = await sequelize.query('CALL orders_get_order_short_details(:order_id)', {
                replacements: {
                    order_id,
                }
            })

            if (orderDetails == null) return next('order short details is not found')

            return res.status(200).json(...orderDetails)
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update order status
     *
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with the new status
     * @memberof ShoppingCartController
     */
    static async updateOrderStatus(req, res, next) {
        const { token } = req.params; // eslint-disable-line
        const decodedToken = decodeToken(token)

        try {
            await sequelize.query('CALL orders_update_status(:order_id, :status)', {
                replacements: {
                    order_id: decodedToken.order_id,
                    status: 1
                }
            })

            return res.status(200).json({message: 'Status updated successfully'})
        } catch (error) {
            next(error);
        }
    }

    /**
     * pay with stripe
     * @static
     * @param {obj} req express request object
     * @param {obj} res express response object
     * @returns {json} returns json response with order summary
     * @memberof ShoppingCartController
     */
    static async processStripePayment(req, res, next) {
        const { email, stripeToken, order_id } = req.body; // eslint-disable-line
        const { customer_id } = req; // eslint-disable-line

        try {
            const order_items = await sequelize.query('CALL orders_get_order_details(:order_id)', {
                replacements: {
                    order_id,
                }
            })

            if (order_items.length < 1) return next('order is not found')

            const order = order_items[0];
            // had to convert the amount to pennies wihout dots to be a valid integer value
            const amountInPennies = order.subtotal.replace('.', '')

            await stripe.charges.create({
                amount: Number(amountInPennies), // converted the value to a number
                source: stripeToken,
                currency: 'usd',
                metadata: { order_id }
            }).then(async (response) => {
                const stripeObject = {
                    stripeToken,
                    description: response.description,
                    amount: response.amount,
                    currency: response.currency
                }
                const customer_token = generateToken({ customer_id, order_id })
                const mailhtml = `
                You have just ordered quantity <b>${order.quantity}</b> of <b>${order.product_name}</b> costing $${Number(amountInPennies) / 100}.
                <a href="http://localhost/order/status/${customer_token}">Confirm this purchase</a>
                `

                // send the confirmation email
                await sendMail(email, mailhtml)

                res.status(201).json({ ...stripeObject, message: 'Successful Checkout' })
            })
                .catch((error) => {
                    next(error);
                })
        } catch (error) {
            next(error);
        }

    }
}

export default ShoppingCartController;