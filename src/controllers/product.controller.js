/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 * 
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import {
  Product,
  Department,
  AttributeValue,
  Attribute,
  Category,
  Customer,
  sequelize,
  Review
} from '../database/models';
import { sqlQueryMap } from '../helpers/query';

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const { query } = req;
    const { page, limit, offset } = query
    /*
      they have to be numbers in order to fit in the mysql query syntax
      'OR undefined' is there to ensure that not passing a certain value, should still return a valid result 
    */

    try {
      const products = await Product.findAndCountAll(sqlQueryMap({ limit, offset, page }));
      return res.status(200).json({
        status: true,
        products,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products by a query string
   * @static   
    * @api {GET} /products/search?query_string={search value}&all_words=on Search products
    * @apiName PutUser
    * @apiGroup User
    *
    * @apiParam {Number} id Users unique ID.
    * 
    * @apiParam (Request query) {String} query_string the values we're going to search by
    * @apiParam (Request query) {String} all_words should it match the whole query_string it could be either on or off 
    * @apiParam (Request query) {Number} page page number to start searching from, defaults to 1
    * @apiParam (Request query) {Number} limit search results limit, defaults to 20
    * @apiParam (Request query) {Number} description_length filter by description length, defaults to 200
    * 
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    const { query_string, all_words, page = 1, limit = 20, description_length = 200 } = req.query;  // eslint-disable-line

    await sequelize.query('CALL catalog_search(:query_string, :all_words, :description_length, :page, :limit)', {
      replacements: {
        query_string,
        all_words,
        description_length,
        page,
        limit
      }
    }).then(products => {
      return res.status(200).json({
        rows: products,
      });
    }).catch(error => {
      next(error);
    })
  }

  /**
   * get all products by category
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {

    try {
      const { query, params } = req; // eslint-disable-line
      const { category_id } = params; // eslint-disable-line
      const { limit, offset } = query
      /*
        they have to be numbers in order to fit in the mysql query syntax
        'OR undefined' is there to ensure that not passing a certain value, should still return a valid result 
      */
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Category,
            where: {
              category_id,
            },
            attributes: [],
          },
        ],
        ...sqlQueryMap({ limit, offset })
      });
      return res.status(200).json(products);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @param {string} department_id department id
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    const { department_id } = req.params;
    const { page, limit, description_length } = req.query;
    const allProducts = [];
    let count = 0;
    // get all the categories associated with that department_id
    const categories = await Category.findAll({
      include: [
        {
          model: Department,
          where: {
            department_id,
          },
          attributes: [],
        },
      ],
      ...sqlQueryMap({ page, limit, description_length })
    })
    // loop on each category id and get the products associated with its id 
    for (let { category_id } of categories) {
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Category,
            where: {
              category_id,
            },
            attributes: [],
          },
        ],
      });
      // one field counting all the products
      count += products.count
      // push each product list to an array to form a large list of all available products
      allProducts.push(products.rows)
    }

    if (allProducts.length > 0) {
      res.status(200).json({ count, rows: allProducts })
    } else {
      next('no products were found')
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {

    const { product_id } = req.params;  // eslint-disable-line
    const product = await Product.findByPk(product_id);

    if (product !== null) {
      return res.status(200).json(product);
    }
    next('product not found');
  }

  /**
   * get product reviews
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product reviews
   * @memberof ProductController
   */
  static async getProductReviews(req, res, next) {
    const { product_id } = req.params;  // eslint-disable-line

    await sequelize.query('CALL catalog_get_product_reviews(:product_id)', {
      replacements: {
        product_id
      }
    }).then(reviews => {
      return res.status(200).json(reviews);
    }).catch(error => {
      next(error);
    })
  }

  /**
   * post product reviews
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product posted review
   * @memberof ProductController
   */
  static async postProductReviews(req, res, next) {
    const { product_id } = req.params;  // eslint-disable-line
    const { review, rating } = req.body;  // eslint-disable-line
    const {customer_id} = req.customer;
    // get all the reviews this customer has created for that product before
    // if any is found, then he's not allowed to review again
    const previousCustomerReview = await Review.findAll({
      where: {
        customer_id,
        product_id
      }
    })

    if(previousCustomerReview.length > 0) return next('you have already reviewed this product')

    try {
      const reviewDetails = await Review.create({
        customer_id,
        product_id,
        review,
        rating
      })

      return res.status(201).json(reviewDetails)
    }
    catch( error ) {
      next(error)
    }
  }


  /**
   * the category of a particular product.
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and the product category
   * @memberof ProductController
   */
  static async getProductCategory(req, res, next) {

    const { product_id } = req.params;  // eslint-disable-line
    const product = await Product.findByPk(product_id);

    if (product !== null) {
      return res.status(200).json(product);
    }
    next('product not found');
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * 
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and a single department
   * @memberof ProductController
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    try {
      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(200).json(department);
      }
      return next(`Department with id ${department_id} does not exist`)
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * 
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and a category list
   * @memberof ProductController
   */
  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();

      return res.status(200).send({ rows: categories })
    } catch (error) {
      next(error)
    }
  }

  /**
   * This method should get a single category using the categoryId
   * 
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and a single category
   * @memberof ProductController
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;  // eslint-disable-line
    const category = await Category.findByPk(category_id)

    if (category !== null) {
      return res.status(200).json(category);
    }
    next('category was not found')
  }

  /**
   * This method should get list of categories in a department
   * 
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and a depratment list
   * @memberof ProductController
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;  // eslint-disable-line
    const categories = await Category.findAll({
      include: [
        {
          model: Department,
          where: {
            department_id,
          },
          attributes: [],
        },
      ],
    })


    // implement code to get categories in a department here
    return res.status(200).json(categories);
  }
}

export default ProductController;
