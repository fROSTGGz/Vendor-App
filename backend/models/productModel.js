import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: false },
  confirmed: { type: Boolean, default: false },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  confirmedByVendors: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmed: { type: Boolean, default: false }
  }],
  marketplace: {
    type: String,
    enum: [
      'Dr. Babasaheb Ambedkar Open University Campus',
      'Shri Bhagwat Vidyapeeth Temple',
      'Atma vikasa parisara',
      'Navjeevan Trust Campus',
      'Gayatri Temple Trust Campus',
      'SRISTI: Sristi Campus',
      'Vallabh Vidyanagar, Anand',
      'Sardar Vallabhbhai Patel University (SPU) Bhaikaka Library Campus'
    ]
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
