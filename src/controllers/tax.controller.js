
/**
 * Tax controller contains methods which are needed for all tax request
 * Implement the functionality for the methods
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Tax } from '../database/models'

class TaxController {
  /**
   * This method get all taxes
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and tax details
   * @memberof TaxController
   */
  static async getAllTax(req, res, next) {

    try {
      const tax = await Tax.findAll();
      return res.status(200).json(tax)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and tax details
   * @memberof TaxController
   */
  static async getSingleTax(req, res, next) {
    const { tax_id } = req.params;
    const tax = await Tax.findByPk(tax_id)
    if(tax !== null) {
      return res.status(200).json(tax)
    }
    next(error)
  }

}

export default TaxController;
