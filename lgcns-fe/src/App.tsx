import { Outlet, Route, Routes } from "react-router-dom";
import { GuestRoute, MemberRoute } from "./components/AuthGate";
import SiteHeader from "./components/SiteHeader";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Cart from "./pages/Cart";
import ClientLogin from "./pages/ClientLogin";
import Contact from "./pages/Contact";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Order from "./pages/Order";
import Product from "./pages/Product";
import Signup from "./pages/Signup";

function MainLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/blog/:blogId" element={<Blog />} />
        <Route path="/product/*" element={<Product />} />
        <Route
          path="/cart"
          element={
            <MemberRoute>
              <Cart />
            </MemberRoute>
          }
        />
        <Route
          path="/order"
          element={
            <MemberRoute>
              <Order />
            </MemberRoute>
          }
        />
      </Route>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
      <Route path="/client-login" element={<ClientLogin />} />
    </Routes>
  );
}

export default App;
