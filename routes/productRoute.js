const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { isAuthenticated } = require("../middleware/auth");

router.get("/products", productController.getProducts);
router.get("/product/:id", productController.getProduct);

// Apply the isAuthenticated middleware to routes that require user validation
router.post("/product/create", isAuthenticated, productController.createProduct);
router.put("/product/update/:id", isAuthenticated, productController.updateProduct);
router.delete("/product/delete/:id", isAuthenticated, productController.deleteProduct);

module.exports = router;
