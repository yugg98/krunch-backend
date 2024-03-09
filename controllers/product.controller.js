const productdb = require("../models/product.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const categories = require("../utils/category.json");
const request = require("request");

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await productdb
    .find({ user_id: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products,
    categories: categories,
  });
});

exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productdb.findById(req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, product });
});

exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  if (!categories || categories.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No categories found" });
  }

  res.status(200).json({ success: true, categories });
});
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let myCloud;

  try {
    if (req.body.image) {
      // Convert Base64 to buffer
      const buffer = Buffer.from(req.body.image, "base64");

      // Create a new promise to handle the upload stream
      myCloud = await new Promise((resolve, reject) => {
        let uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: "productimage", quality: 80 },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(buffer);
      });
    }
  } catch (error) {
    return next(error);
  }
  console.log(myCloud)
  const { name, liked, category, location, locationname, description } =
    req.body;
    console.log(req.body)
  const product = await productdb.create({
    name,
    user_id: req.user._id,
    latitude: location.latitude,
    longitude: location.longitude,
    liked,
    description: description,
    image: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    category,
    locationname,
  });
  console.log(productdb)
  res.status(201).json({
    success: true,
    message: "Your Product is created",
    product,
  });
});
exports.createProductbyqr = catchAsyncErrors(async (req, res, next) => {
  const { name, liked, category, location, locationname, images, description } =
    req.body;
  const product = await productdb.create({
    name,
    user_id: req.user._id,
    latitude: location.latitude,
    longitude: location.longitude,
    liked,
    description: description,
    image: {
      public_id: 0,
      url: images,
    },
    category,
    locationname: locationname,
  });
  res.status(201).json({
    success: true,
    message: "Your Product is created",
    product,
  });
});
const axios = require('axios');

exports.getProductByQr = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.qr) {
    return res.status(400).json({
      message: "QR code is required",
    });
  }
  const barcode = req.body.qr;

  const openFoodFactsApiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
  try {
    const response = await axios.get(openFoodFactsApiUrl);

    if (response.data.status === 1 && response.data.product) {
      const product = response.data.product;
      const productResponse = {
        title: product.product_name,
        image: product.image_url,
      };
      return res.status(200).json({
        ...productResponse,
      });
    } else {
      return res.status(404).json({
        message: "No product found for the provided QR code",
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // If the first API returns 404, try the second API
      const barcodeLookupApiUrl = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=72tc619c6up0mw5lvfhc47cha5otoj`;
      try {
        const barcodeResponse = await axios.get(barcodeLookupApiUrl);
        const productResponse = {
          title: barcodeResponse.products[0].title,
          image: barcodeResponse.products[0].images[0],
        };
        return res.status(200).json({
          ...productResponse,
        });
        // Process and send response based on the BarcodeLookup API response
        // ...
      } catch (barcodeError) {
        console.error("Error during BarcodeLookup API request:", barcodeError);
        return res.status(500).json({
          message: "Error during BarcodeLookup API request",
        });
      }
    } else {
      console.error("Error during OpenFoodFacts API request:", error);
      return res.status(500).json({
        message: "Error during external API request",
      });
    }
  }
});



exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await productdb.findById(req.params.id);

  if (!product) {
    return res
      .status(400)
      .json({ success: false, message: "Product not found" });
  }
  const { name, liked, category, locationname, description } = req.body;
  if (product.user_id != req.user._id) {
    return res
      .status(401)
      .json({ success: false, message: "Product not found" });
  }

  product = await productdb.findByIdAndUpdate(product._id, {
    name,
    liked,
    description,
    category,
    locationname,
  });


  res.status(200).json({ success: true, product });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productdb.findById(req.params.id);
  if (product.user_id != req.user._id) {
    res.status(401);
  }
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Remove image from Cloudinary
  await cloudinary.v2.uploader.destroy(product.image.public_id);

  await product.deleteOne();

  res.status(200).json({ success: true, message: "Product deleted" });
});
