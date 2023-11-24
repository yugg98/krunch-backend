const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'], // Required field with a custom error message
    trim: true, // Removes whitespace from both ends of a string
    maxlength: [100, 'Product name cannot exceed 100 characters'] // Maximum length
  },
  image: {
    public_id: {
      type: String,
      required: [true, 'Public ID of the image is required']
    },
    url: {
      type: String,
      required: [true, 'Image URL is required']
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  liked: {
    type: Boolean,
    default: false // Default value if not provided
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['dish', 'product', 'mall'],
      message: '{VALUE} is not a valid category' // Custom error message for enum validation
    }
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets the date of creation
  }
});

module.exports = mongoose.model("product", productSchema);
