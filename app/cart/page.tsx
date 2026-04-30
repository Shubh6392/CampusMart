import { Metadata } from 'next';
import CartView from '@/components/cart/cart-view';

export const metadata: Metadata = {
  title: 'Cart - CampusMart',
  description: 'Review items added to your cart'
};

export default function CartPage() {
  return <CartView />;
}
