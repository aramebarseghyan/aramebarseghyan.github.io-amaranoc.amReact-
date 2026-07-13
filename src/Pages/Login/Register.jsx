import { regionsList } from "../../components/Aside/Region/regionsData";

const Region = ({ selectedRegions, onRegionChange }) => {
  return (
    <div className="w-full">
      <h3 className="text-[16px] font-bold text-[#111] mb-4">Տարածաշրջան</h3>
      <div className="h-[220px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
        {regionsList.map((region, index) => {
          // Если в regionsList строки вида "Դիլիջան 166",
          // можно отделить название от цифр (если нужно).
          // Предполагается, что region — это просто название "Դիլիջան"
          return (
            <p key={index} className="flex items-center gap-3 mb-3.5">
              <input
                type="checkbox"
                id={`region-${index}`}
                className="cursor-pointer w-4 h-4 rounded border-gray-300 accent-[#111]"
                checked={selectedRegions.includes(region)}
                onChange={() => onRegionChange(region)}
              />
              <label
                htmlFor={`region-${index}`}
                className="cursor-pointer text-[15px] text-[#444]"
              >
                {region}
              </label>
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Region;
