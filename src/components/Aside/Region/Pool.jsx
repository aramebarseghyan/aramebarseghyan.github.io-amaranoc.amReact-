import { useState } from "react";

const poolOptions = ["Բոլորը", "Բաց", "Փակ", "Տաքացվող", "Առանց լողավազանի"];

const Pool = () => {
  const [activePool, setActivePool] = useState("Բոլորը");

  return (
    <div className="w-full pt-5 border-t border-[#f0f0f0]">
      <h4 className="text-[16px] font-bold mb-4 text-[#111]">Լողավազան</h4>
      {/* grid вместо жестких процентов для лучшей адаптивности */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
        {poolOptions.map((option) => (
          <div
            key={option}
            onClick={() => setActivePool(option)}
            className={`w-full h-[54px] px-2 sm:px-4 border rounded-[15px] flex items-center justify-center text-[13px] sm:text-[14px] text-center cursor-pointer transition-all duration-200 ${
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
