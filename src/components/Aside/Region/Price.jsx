import { useState } from "react";

const arr = ["֏", "$", "€", "₽"];

const Price = ({ plc1, plc2 }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="  absolute right-[1px]  top-[300px] w-full border-t border-[#f0f0f0] mt-6 pt-6">
      <div className=" absolute top-5 flex justify-center gap-10 items-center w-full mb-4">
        <h4 className=" text-[16px] font-bold text-[#111] m-0">Արժեք</h4>
        <div className=" flex gap-2 m-0">
          {arr.map((valute, index) => (
            <div
              key={index}
              className={`w-9 h-9 flex items-center justify-center rounded-full cursor-pointer font-medium text-[14px] transition-all duration-200 ${
                activeIndex === index
                  ? "bg-[#111] text-white"
                  : "bg-white border border-[#ddd] text-[#555] hover:border-[#aaa]"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {valute}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-20 flex items-center justify-between gap-3 w-full">
        <input
          placeholder={plc1}
          type="text"
          className=" text-left-2g relative left-5  w-30 flex   h-[44px] border border-[#ddd] rounded-[12px] text-[14px] outline-none focus:border-[#111] transition-colors"
        />
        <span className="text-[#888] font-medium">-</span>
        <input
          placeholder={plc2}
          type="text"
          className="w-30 relative right-5 flex h-[44px] border border-[#ddd] rounded-[12px] text-[14px] outline-none focus:border-[#111] transition-colors"
        />
      </div>
    </div>
  );
};

export default Price;
