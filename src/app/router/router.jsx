import { Navigate, createBrowserRouter, useParams } from "react-router-dom";
import AppShell from "../AppShell";
import LandingPage from "../../pages/LandingPage";
import SimplePage from "../../pages/SimplePage";
import CategoriesPage from "../../categories/pages/Categories";
import SignupPage from "../../auth/pages/SignupPage";
import LoginPage from "../../auth/pages/LoginPage";
import SearchPage from "../../pages/SearchPage";
import CartPage from "../../cart/pages/CartPage";

function CategoryRedirect() {
  const { categoryId } = useParams();
  return <Navigate to={`/categories#${categoryId}`} replace />;
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/courses", element: <SimplePage title="Courses" /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/categories/:categoryId", element: <CategoryRedirect /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/plans", element: <SimplePage title="Plans" /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
]);
