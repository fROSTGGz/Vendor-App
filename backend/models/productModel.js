import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: false },
  confirmed: { type: Boolean, default: false },
  marketplace: {
    type: String,
    required: true,
    enum: ['thursday haat', 'sunday haat', 'navjeevan haat']
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;