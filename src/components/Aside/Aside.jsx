import Region from "./Region/Region";
import Price from "./Region/Price";
import People from "./Region/People";
import NightPresence from "./Region/NightPresence";
import PeopleNight from "./Region/PeopleNight";
import Rooms from "./Region/Rooms";
import Bathroom from "./Region/Bathroom";
import Pool from "./Region/Pool";
import Advantages from "./Region/Advantages";

const Aside = ({
  selectedRegions,
  onRegionChange,
  houses,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  peopleCount,
  setPeopleCount,
}) => {
  return (
    <aside className="w-full lg:w-80 bg-white border border-[#eaeaea] rounded-[20px] font-sans shadow-sm p-4 sm:p-5 flex flex-col gap-5 sm:gap-6">
      <Region
        selectedRegions={selectedRegions}
        onRegionChange={onRegionChange}
        houses={houses}
      />
      <Price
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
      />
      <People peopleCount={peopleCount} setPeopleCount={setPeopleCount} />
      <NightPresence />
      <PeopleNight />
      <Rooms />
      <Bathroom />
      <Pool />
      <Advantages />
    </aside>
  );
};

export default Aside;
