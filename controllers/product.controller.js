const productdb = require("../models/product.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary")

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await productdb.find();
  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productdb.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, product });
});


exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
    folder: "productimage",
    quality:80
  });
  const { name,location,liked,category } = req.body;
  const product = await productdb.create({
    name,
    location,
    liked,
    image: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    category
  });

  res.status(201).json({
    success: true,
    message: "Your Product is created",
    product
  });
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await productdb.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // If there's a new image, upload it
  if (req.body.image) {
    // Remove the old image from Cloudinary
    await cloudinary.v2.uploader.destroy(product.image.public_id);
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "productimage",
      quality: 80
    });

    req.body.image = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    };
  }

  product = await productdb.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, product });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productdb.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Remove image from Cloudinary
  await cloudinary.v2.uploader.destroy(product.image.public_id);

  await product.remove();

  res.status(200).json({ success: true, message: "Product deleted" });
});
