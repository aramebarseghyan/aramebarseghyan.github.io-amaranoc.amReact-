import React from "react";

const Price = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
  return (
    <div className="flex flex-col gap-4 font-sans mt-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[16px] text-[#222] m-0">Արժեք</h3>
        <div className="flex gap-2">
          <button className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-bold bg-[#1a1a1a] text-white border-none cursor-pointer">
            ֏
          </button>
          <button className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-medium text-gray-500 bg-white border border-[#e5e5e5] cursor-pointer hover:bg-gray-50">
            $
          </button>
          <button className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-medium text-gray-500 bg-white border border-[#e5e5e5] cursor-pointer hover:bg-gray-50">
            €
          </button>
          <button className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-medium text-gray-500 bg-white border border-[#e5e5e5] cursor-pointer hover:bg-gray-50">
            ₽
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Սկսած"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full h-11 px-3 border border-[#e5e5e5] rounded-[10px] text-[14px] outline-none focus:border-orange-400 transition-colors"
          />
        </div>
        <span className="text-gray-400 text-[14px]">-</span>
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Մինչև"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-11 px-3 border border-[#e5e5e5] rounded-[10px] text-[14px] outline-none focus:border-orange-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default Price;
