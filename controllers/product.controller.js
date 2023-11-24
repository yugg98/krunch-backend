const productdb = require("../models/product.model");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary")

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
