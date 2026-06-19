import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "./firebase";
import Header from "./components/header/Header";
import Aside from "./components/Aside/Aside";
import Main from "./components/Main/Main";
import NaxaFooter from "./components/NaxaFooter/NaxaFooter";
import Footer from "./components/Footer/Footer";
import Discounts from "./Pages/Discount/Discounts";
import Services from "./Pages/Services/Services";
import Info from "./Pages/Info/Info";
import HouseDetails from "./Pages/HouseDetails/HouseDetails";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Login/Register";

function App() {
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          console.log("Google sign-in success:", user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });
  }, []);
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen text-[#1a1a1a]">
        <Header />

        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-[1320px] mx-auto px-[15px] xl:px-[20px] flex items-start gap-[30px] mt-[30px] mb-[50px]">
                <div className="flex-shrink-0 w-[280px]">
                  <Aside />
                </div>
                <div className="flex-1 w-full overflow-hidden">
                  <Main />
                </div>
              </div>
            }
          />

          <Route path="/discounts" element={<Discounts />} />
          <Route path="/services" element={<Services />} />
          <Route path="/info" element={<Info />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/house/:id" element={<HouseDetails />} />
        </Routes>

        <NaxaFooter />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
