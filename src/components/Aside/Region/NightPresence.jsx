import { useState } from "react";

const NightPresence = () => {
  const [active, setActive] = useState("all");

  const btnBase =
    " w-[105px] h-[46px] rounded-[2vw] flex items-center justify-center px-7 cursor-pointer transition-all duration-200 text-[15px] font-medium border";

  return (
    <div className=" absolute top-[1150px] w-full mt-6 pt-6 border-t border-[#f0f0f0]">
      <h4 className="absolute left-4 top-10 text-[16px] font-bold mb-4 text-[#111]">
        Գիշերակացի առկայություն
      </h4>
      <div className="relative left-4 top-20 flex flex-wrap gap-3">
        <div
          onClick={() => setActive("all")}
          className={`${btnBase  } ${
            active === "all"
              ? "bg-[#111] text-white border-[#111]"
              : "border-[#ddd] text-[#555] hover:border-[#aaa]"
          } w-20`}
        >
          Բոլորը
        </div>
        <div
          onClick={() => setActive("yes")}
          className={`${btnBase} ${
            active === "yes"
              ? "bg-[#111] text-white border-[#111]"
              : "border-[#ddd] text-[#555] hover:border-[#aaa]"
          }`}
        >
          Այո
        </div>
        <div
          onClick={() => setActive("no")}
          className={`${btnBase} w-[100px] ${
            active === "no"
              ? "bg-[#111] text-white border-[#111]"
              : "border-[#ddd] text-[#555] hover:border-[#aaa]"
          }`}
        >
          Ոչ
        </div>
      </div>
    </div>
  );
};

export default NightPresence;
