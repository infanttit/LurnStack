import { CartProvider } from "../../cart";

export default function AppProviders({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
