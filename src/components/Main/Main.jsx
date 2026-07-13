import MapsData from "./Maps/MapsData";
import Icons from "./IconsFolder/Icons";
import Houses from "./Houses/Houses";

const Main = ({
  selectedRegions,
  houses,
  loading,
  minPrice,
  maxPrice,
  peopleCount,
}) => {
  return (
    <div className="flex flex-col w-full p-2 sm:p-5 mt-5 gap-6">
      <MapsData />
      <Icons />
      <Houses
        selectedRegions={selectedRegions}
        houses={houses}
        loading={loading}
        minPrice={minPrice}
        maxPrice={maxPrice}
        peopleCount={peopleCount}
      />
    </div>
  );
};

export default Main;
