import { useCart } from '../utils/CartContext';

const CartDebugger = () => {
  const { cart } = useCart();
  
  return (
    <div className="fixed bottom-0 right-0 bg-white p-4 shadow-lg">
      <h3 className="font-bold mb-2">Cart Debug</h3>
      <pre className="text-xs">{JSON.stringify(cart, null, 2)}</pre>
    </div>
  );
};

export default CartDebugger;