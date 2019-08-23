/**
 * The controller defined below is the attribute controller, highlighted below are the functions of each static method
 * in the controller
 *  Some methods needs to be implemented from scratch while others may contain one or two bugs
 * 
 * - getAllAttributes - This method should return an array of all attributes
 * - getSingleAttribute - This method should return a single attribute using the attribute_id in the request parameter
 * - getAttributeValues - This method should return an array of all attribute values of a single attribute using the attribute id
 * - getProductAttributes - This method should return an array of all the product attributes
 * NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import { Attribute, AttributeValue, ProductAttribute } from '../database/models'

class AttributeController {
  /**
   * This method get all attributes
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and attribute details
   * @memberof AttributeController
   */
  static async getAllAttributes(req, res, next) {
    try {
      const Attributes = await Attribute.findAll();
      return res.status(200).json(Attributes);
    } catch (error) {
      next(error)
    }
  }

  /**
   * This method gets a single attribute using the attribute id
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and attribute details
   * @memberof AttributeController
   */
  static async getSingleAttribute(req, res, next) {
    const { attribute_id } = req.params;
    const attribute = await Attribute.findByPk(attribute_id)
    if (attribute !== null) {
      return res.status(200).json(attribute)
    }
    next('attribute not found')
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and attribute details
   * @memberof AttributeController
   */
  static async getAttributeValues(req, res, next) {
    const { attribute_id } = req.params;
    const attribute_values = await AttributeValue.findAll({
      attributes:['attribute_value_id', 'value'],
      where: {
        attribute_id
      }
    })

    if (attribute_values.length > 0) {
      res.status(200).json(attribute_values)
    }

    next('attribute_values not found')
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and attribute details
   * @memberof AttributeController
   */
  static async getProductAttributes(req, res, next) {
    const { product_id } = req.params;
    // find the attribute based on product_id, then populate to get the attributeValue then inside that populate again to get the attribute_name.
    // this is how the relation is built
    let attributes = await ProductAttribute.findAll({
      include: [{
        model: AttributeValue,
        include: [{
          model: Attribute,
          as: 'attribute_type',
          attributes: ['name']
        }]
      }],
      where: {
        product_id
      }
    })

    if (attributes.length > 0) {
      // restructure the array to make it fit the requirements
      attributes = attributes.map((attribute) => {
        const { attribute_value_id, AttributeValue } = attribute;
        const { attribute_type } = AttributeValue
        return {
          attribute_name: attribute_type.name,
          attribute_value_id,
          attribute_value: AttributeValue.value
        }
      })

      return res.status(200).json(attributes)
    }
    next('attributes not found')
  }
}

export default AttributeController;
