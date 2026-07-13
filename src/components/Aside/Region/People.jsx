import React from "react";

const People = ({ peopleCount, setPeopleCount }) => {
  const handleMinus = () => {
    if (peopleCount > 1) {
      setPeopleCount(peopleCount - 1);
    }
  };

  const handlePlus = () => {
    setPeopleCount(peopleCount + 1);
  };

  return (
    <div className="flex flex-col gap-3 font-sans mt-6">
      <h3 className="font-bold text-[16px] text-[#222] m-0">
        Մարդկանց թույլատրելի քանակ
      </h3>

      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={handleMinus}
          className="w-10 h-10 rounded-full bg-[#f4f4f4] flex items-center justify-center text-[20px] text-[#222] border-none cursor-pointer hover:bg-[#e5e5e5] transition-colors"
        >
          −
        </button>

        <div className="w-[70px] h-10 border border-[#e5e5e5] rounded-[10px] flex items-center justify-center text-[16px] font-medium text-[#222]">
          {peopleCount}
        </div>

        <button
          onClick={handlePlus}
          className="w-10 h-10 rounded-full bg-[#f4f4f4] flex items-center justify-center text-[20px] text-[#222] border-none cursor-pointer hover:bg-[#e5e5e5] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default People;
