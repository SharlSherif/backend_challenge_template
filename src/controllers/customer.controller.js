/**
 * Customer controller handles all requests that has to do with customer
 * Some methods needs to be implemented from scratch while others may contain one or two bugs
 * 
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update their address info
 * - updateCreditCard - allow customers to update their credit card number
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Customer, sequelize } from '../database/models';
import { generateToken } from '../helpers/token';
/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */
  static async create(req, res, next) {
    const { name, email, password } = req.body;

    try {
      await Customer.create({ name, email, password });

      return res.status(201).json({ message: 'Customer created' });
    }
    catch (error) {
      return next(error);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    const { email, password } = req.body;

    await sequelize
      .query('CALL customer_get_login_info (:inEmail)',
        { replacements: { inEmail: email } })
      .then(async results => {
        const user = results[0] // it will either find one or none

        if (user !== undefined) {
          const isMatch = await Customer.prototype.validatePassword(password, user.password)

          if (isMatch) {
            const token = generateToken({ user })
            res.setHeader('user-key', token)
            return res.status(200).json({ message: 'logged in' });
          }
        }
        next('wrong password')
      });
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @param {string} id customer id
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    // fix the bugs in this code
    const { id } = req.params;  // eslint-disable-line
    try {
      const customer = await Customer.findByPk(id);
      return res.status(400).json({
        customer,
      });
    } catch (error) {
      return next(error.message);
    }
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @param {string} id customer id
   * @param {string} email customer email
   * @param {string} password customer password
   * @param {string} evePhone customer eve phone
   * @param {string} dayPhone customer day phone
   * @param {string} mobPhone customer mobile phone
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    const { id } = req.params
    await sequelize
      .query('CALL customer_update_account(:id, :name, :email, :password, :dayPhone, :evePhone, :mobPhone)',
        {
          replacements: {
            id,
            ...req.body
          }
        })
      .then(async () => {
        return res.status(200).json({ message: 'Profile Updated' });
      })
      .catch(error => {
        next(error.message)
      })
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @param {string} address1 first customer address
   * @param {string} address2 second customer address
   * @param {string} city customer city
   * @param {string} region customer region
   * @param {string} country country
   * @param {number} postalCode postal code
   * @param {string} shipping_region_id shipping region id
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    // write code to update customer address info such as address_1, address_2, city, region, postal_code, country
    // and shipping_region_id
    const { id } = req.params;

    await sequelize
      .query('CALL customer_update_address(:id, :address1, :address2, :city, :region, :postalCode, :country, :shipping_region_id)',
        {
          replacements: {
            id,
            ...req.body
          }
        })
      .then(async () => {
        return res.status(200).json({ message: 'Profile Address Updated' });
      })
      .catch(error => {
        next(error.message)
      })
  }

  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @param {string} id customer id
   * @param {number} credit_card customer credit card
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
    static async updateCreditCard(req, res, next) {
    const { id } = req.params;

    await sequelize
      .query('CALL customer_update_credit_card(:id, :credit_card)',
        {
          replacements: {
            id, ...req.body
          }
        })
      .then(async () => {
        return res.status(200).json({ message: 'Profile Credit Card Updated' });
      })
      .catch(error => {
        next(error.message)
      })
  }
}

export default CustomerController;
