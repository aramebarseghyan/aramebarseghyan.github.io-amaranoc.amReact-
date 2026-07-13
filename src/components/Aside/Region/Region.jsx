import React from "react";

const Region = ({ selectedRegions = [], onRegionChange, houses = [] }) => {
  const regionNames = [
    "Երևան",
    "Դիլիջան",
    "Ծաղկաձոր",
    "Սևան",
    "Գառնի",
    "Աշտարակ",
    "Բյուրական",
    "Աղվերան",
    "Հանքավան",
    "Արզնի",
    "Գյուլագարակ",
    "Ոսկեհատ",
    "Ջերմուկ",
    "Գյումրի",
    "Վանաձոր",
    "Իջևան",
    "Ստեփանավան",
    "Գորիս",
    "Կապան",
  ];

  return (
    <div className="flex flex-col gap-3 font-sans">
      <h3 className="font-bold text-[16px] text-[#222] mb-2 m-0">
        Տարածաշրջան
      </h3>

      <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        {regionNames.map((region) => {
          const count = houses.filter(
            (h) => h.location && h.location.includes(region),
          ).length;

          return (
            <label
              key={region}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => onRegionChange(region)}
                  className="w-[18px] h-[18px] rounded-[4px] border-[#e5e5e5] text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-[14px] text-[#333] group-hover:text-orange-500 transition-colors">
                  {region}
                </span>
              </div>
              <span className="text-[12px] text-gray-400 font-medium">
                {count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default Region;
