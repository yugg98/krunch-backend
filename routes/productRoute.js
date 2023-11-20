const express = require("express");
const { createProduct } = require("../controllers/product.controller");

const router = express.Router();

router.route('/product/create').post(createProduct)

module.exports = router;