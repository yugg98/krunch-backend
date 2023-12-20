const productdb = require("../models/product.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const categories = require("../utils/category.json");
const request = require("request");

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await productdb.find({ user_id: req.user._id }).sort({ createdAt: -1 });

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
    console.log(error);
    return next(error);
  }

  const { name, liked, category, location, locationname, description } =
    req.body;
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
  console.log(product, "hello");
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
  console.log(product);
  res.status(201).json({
    success: true,
    message: "Your Product is created",
    product,
  });
});
exports.getProductByQr = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.qr) {
    return res.status(400).json({
      message: "QR code is required",
    });
  }

  try {
    const barcode = req.body.qr;
    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    request.get(apiUrl, function (err, resp, body) {
      if (err) {
        console.error("Error during API request:", err);
        return res.status(500).json({
          message: "Error during external API request",
        });
      }

      try {
        const parsedBody = JSON.parse(body);
        if (parsedBody.status === 1 && parsedBody.product) {
          const product = parsedBody.product;

          // Creating a response object with only title and image
          const response = {
            title: product.product_name, // Assuming 'product_name' is the field for the product's name
            image: product.image_url, // Assuming 'image_url' is the field for the product's main image
          };

          return res.status(200).json(response);
        } else {
          return res.status(404).json({
            message: "No product found for the provided QR code",
          });
        }
      } catch (parseError) {
        console.error("Error parsing response body:", parseError);
        return res.status(500).json({
          message: "Error parsing response from external API",
        });
      }
    });
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({
      message: "Internal Server Error",
    });
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

  console.log(product, "final");

  res.status(200).json({ success: true, product });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productdb.findById(req.params.id);
  console.log(product.user_id, req.user._id);
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
