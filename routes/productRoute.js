const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { isAuthenticated } = require("../middleware/auth");
router.post("/products",isAuthenticated, productController.getProducts);
router.get("/product/category", productController.getCategories);

// Apply the isAuthenticated middleware to routes that require user validation
router.post("/product/create", isAuthenticated, productController.createProduct);
router.post("/product/get-by-qr", productController.getProductByQr);
router.post("/product/create-by-qr",isAuthenticated, productController.createProductbyqr);

router.post("/product/update/:id", isAuthenticated, productController.updateProduct);
router.post("/product/delete/:id", isAuthenticated, productController.deleteProduct);

module.exports = router;
