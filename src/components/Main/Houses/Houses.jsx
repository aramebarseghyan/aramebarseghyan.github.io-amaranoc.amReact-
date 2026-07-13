import Arajark from "./Arajark";
import House from "./House";
import Page from "./Page";

const Houses = ({
  selectedRegions,
  houses,
  loading,
  minPrice,
  maxPrice,
  peopleCount,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Arajark className="flex" />
      <House
        selectedRegions={selectedRegions}
        houses={houses}
        loading={loading}
        minPrice={minPrice}
        maxPrice={maxPrice}
        peopleCount={peopleCount}
      />
      <Page />
    </div>
  );
};

export default Houses;
