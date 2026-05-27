import { advantages } from "./regionsData";

const Advantages = () => {
  return (
    <div className="absolute w-full left-[20px] top-[1800px] border-t border-[#f0f0f0] mb-2">
      <h4 className="absolute top-5 text-[16px] font-bold mb-4 text-[#111]">
        Հարմարություններ
      </h4>
      <div className="relative top-15 max-h-[220px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-[0px] [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
        {advantages.map((adv, index) => (
          <p key={index} className="flex items-center gap-3 mb-3.5">
            <input
              type="checkbox"
              id={`adv-${index}`}
              className="cursor-pointer w-4 h-4 rounded border-gray-300 accent-[#111]"
            />
            <label
              htmlFor={`adv-${index}`}
              className="cursor-pointer text-[15px] text-[#444] select-none"
            >
              {adv}
            </label>
          </p>
        ))}
      </div>
    </div>
  );
};

export default Advantages;
