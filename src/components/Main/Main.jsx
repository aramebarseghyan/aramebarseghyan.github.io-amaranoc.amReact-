import MapsData from "./Maps/MapsData";
import Icons from "./IconsFolder/Icons";
import Houses from "./Houses/Houses";

const Main = () => {
  return (
    <div className=" relative left-40 top-17 flex flex-col w-full p-[20px] ml-2rm mt-[20px]">
      <MapsData />
      <Icons />
      <Houses />
    </div>
  );
};

export default Main;
