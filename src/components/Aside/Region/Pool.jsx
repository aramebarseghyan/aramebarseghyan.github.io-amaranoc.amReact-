import { useState } from "react";

const poolOptions = ["Բոլորը", "Բաց", "Փակ", "Տաքացվող", "Առանց լողավազանի"];

const Pool = () => {
  const [activePool, setActivePool] = useState("Բոլորը");

  return (
    <div className="  absolute top-[600px] mt-6 pt-6 border-t border-[#f0f0f0]">
      <h4 className= "  absolute top-5  left-5 text-[16px] font-bold mb-4 text-[#111]">Լողավազան</h4>
      <div className="relative top-20  flex flex-wrap gap-2.5">
        {poolOptions.map((option) => (
          <div
            key={option}
            onClick={() => setActivePool(option)}
            className={`w-[45%] h-[54px] px-5 border rounded-[2vw] flex items-center justify-center text-[14px] cursor-pointer transition-all duration-200 ${
              activePool === option
                ? "bg-[#111] text-white border-[#111]"
                : "bg-white border-[#ddd] text-[#555] hover:border-[#aaa]"
            }`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pool;