const productdb = require("../models/product.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const categories = require("../utils/category.json");
const request = require("request");

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await productdb.find({ user_id: req.user._id });
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

  const { name, liked, category, location, locationname,description } = req.body;
  console.log(name, liked, category, location, locationname);
  const product = await productdb.create({
    name,
    user_id: req.user._id,
    latitude: location.latitude,
    longitude: location.longitude,
    liked,
    description:description,
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
  const { name, liked, category, location, locationname, images,description } = req.body;
  const product = await productdb.create({
    name,
    user_id: req.user._id,
    latitude: location.latitude,
    longitude: location.longitude,
    liked,
    description:description,
    image: {
      public_id: 0,
      url: images,
    },
    category,
    locationname: locationname,
  });
  console.log(product)
  res.status(201).json({
    success: true,
    message: "Your Product is created",
    product,
  });
});

exports.getProductByQr = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body.qr)
  await request.post(
    {
      uri: "https://api.upcitemdb.com/prod/trial/lookup",
      headers: {
        "Content-Type": "application/json",
      },
      gzip: true,
      body: JSON.stringify({ upc: req.body.qr }),
    },
    function (err, resp, body) {
      console.log(
        "server encoded the data as: " +
          (resp.headers["content-encoding"] || "identity")
      );
      console.log("the decoded data is: " + body);
      res.status(201).json({
        success: true,
        body: JSON.parse(body).items[0],
      });
    }
  );
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await productdb.findById(req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // If there's a new image, upload it
  if (req.body.image) {
    // Remove the old image from Cloudinary
    await cloudinary.v2.uploader.destroy(product.image.public_id);
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "productimage",
      quality: 80,
    });

    req.body.image = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  product = await productdb.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, product });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productdb.findById(req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Remove image from Cloudinary
  await cloudinary.v2.uploader.destroy(product.image.public_id);

  await product.remove();

  res.status(200).json({ success: true, message: "Product deleted" });
});
