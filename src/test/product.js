import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../index'
import request from 'supertest';

chai.use(require('chai-like'));
chai.use(require('chai-things'));

chai.should();
chai.use(chaiHttp);
//let's set up the data we need to pass to the login method
const userCredentials = {
    name: 'sharl',
    email: "xd@gmail.com",
    password: '1234'
}

//now let's login the user before we run any tests
const authenticatedUser = request.agent(server);

before(function (done) {
    authenticatedUser
        .post('/customers/login')
        .send(userCredentials)
        .end(function (err, response) {
            response.should.have.status(200);
            authenticatedUser.set('user-key', response.header['user-key'])
            done();
        });
});

describe('ProductController', function () {
    describe('#getProductsByCategory', function () {
        it('should return all products in specific category given the category id', function (done) {
            authenticatedUser
                .get('/products/inCategory/2?limit=200&offset=1')
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.body.rows).to.be.an('array')
                    done();
                });
        });
    });

    describe('#searchProduct', function () {
        it('should return all products matching the query string', function (done) {
            authenticatedUser
                .get('/products/search?query_string=Mercury&all_words=on')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    chai.expect(res.body.rows).to.be.an('array')
                    done();
                });
        });
    });

    describe('#getProductsByDepartment', function () {
        it('should return all products in specific department given the department id', function (done) {
            authenticatedUser
                .get('/products/inDepartment/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    chai.expect(res.body.rows).to.be.an('array')
                    done();
                });
        });
    });

    describe('#getProduct', function () {
        it('should return product details given product id', function (done) {
            authenticatedUser
                .get('/products/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('#getProductReviews', function () {
        it('should return product reviews given product id', function (done) {
            authenticatedUser
                .get('/products/1/reviews')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    });

    describe('#getProductCategory', function () {
        it('should return category of particular product by product id', function (done) {
            authenticatedUser
                .get('/categories/inProduct/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('#getAllDepartments', function () {
        it('should return all departments', function (done) {
            authenticatedUser
                .get('/departments')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    });

    describe('#getDepartment', function () {
        it('should return department by its id', function (done) {
            authenticatedUser
                .get('/departments/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
    
    describe('#getAllCategories', function () {
        it('should return all categories', function (done) {
            authenticatedUser
                .get('/categories')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});
