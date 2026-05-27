import Region from "./Region/Region";
import Price from "./Region/Price";
import People from "./Region/People";
import NightPresence from "./Region/NightPresence";
import PeopleNight from "./Region/PeopleNight";
import Rooms from "./Region/Rooms";
import Bathroom from "./Region/Bathroom";
import Pool from "./Region/Pool";
import Advantages from "./Region/Advantages";

const Aside = () => {
  return (
    <aside className="h-[2100px]  pb-20 absolute left-10 w-80  top-15  relative bg-white border border-[#eaeaea] rounded-[20px] font-sans shadow-sm">
      <Region />
      <Price plc1="Սկսած" plc2="Մինչև" />
      <People />
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