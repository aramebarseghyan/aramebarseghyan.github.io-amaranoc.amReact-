import { useState } from "react";
import HeaderEnd from "./HeaderEnd/HeaderEnd";
import HeaderLogo from "./HeaderLogo/HeaderLogo";
import HeaderText from "./HeaderText/HeaderText";
import { userCardStore } from "../../store/useCartStore";
import { ShoppingBag } from "lucide-react";

const Header = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const count = userCardStore((state) => state.count);
  const decrement = userCardStore((state) => state.decrement);

  return (
    <header className="w-full h-22.5 bg-white border-b border-[#eaeaea] select-none">
      <div className="max-w-330 mx-auto h-full flex items-center justify-between px-[15px] xl:px-[20px]">
        <div className="shrink-0">
          <HeaderLogo />
        </div>

        <div
          className="relative flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ShoppingBag size={24} className="text-gray-700" />
          {count > 0 && (
            <span className="absolute -top-2 -left-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {count}
            </span>
          )}

          {isHovered && (
            <div className="absolute top-10 left-0 w-60 bg-white border border-[#eaeaea] shadow-xl rounded-xl p-4 z-50 flex flex-col gap-3 cursor-default">
              <h3 className="text-sm font-semibold">Ձեր զամբյուղը</h3>

              {count > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Քանակը՝ <span className="font-bold">{count}</span>
                    </p>
                    <button 
                      onClick={decrement}
                      className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                    >
                      -1
                    </button>
                  </div>
                  <button className="w-full bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors mt-1">
                    Դիտել զամբյուղը
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-400">Զամբյուղը դատարկ է</p>
              )}
            </div>
          )}
        </div>

        <div className="grow flex justify-center">
          <HeaderText />
        </div>

        <div className="shrink-0">
          <HeaderEnd />
        </div>
      </div>
    </header>
  );
};

export default Header;