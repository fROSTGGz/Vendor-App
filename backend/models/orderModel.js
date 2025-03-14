import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],
  totalPrice: { type: Number, required: true },
  productDetails: [
    {
      productName: { type: String },
      initialStock: { type: Number },
      quantityCheckedOut: { type: Number },
      remainingStock: { type: Number }
    }
  ],
  marketplace: {
    type: String,
    required: true,
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

const Order = mongoose.model('Order', orderSchema);

export default Order;