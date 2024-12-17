import Product from '../models/productModel.js';

export const createProduct = async (req, res, next) => {
  try {
    console.log('Received product data:', req.body);
    const { name, description, price, category, stock } = req.body;
    let image = null;

    if (req.file) {
      image = req.file.path;
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image,
      vendor: req.user._id,
    });

    console.log('Creating product:', product);
    const createdProduct = await product.save();
    console.log('Product created:', createdProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    next(error);
  }
};

