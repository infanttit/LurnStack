import { CartProvider } from "../../cart";
import { AuthProvider } from "../../auth";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store/store";

export default function AppProviders({ children }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
