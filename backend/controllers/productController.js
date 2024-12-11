import Product from '../models/productModel.js';

export const createProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  
  const product = new Product({
    name,
    description,
    price,
    vendor: req.user._id,
    category,
    stock
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

export const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};