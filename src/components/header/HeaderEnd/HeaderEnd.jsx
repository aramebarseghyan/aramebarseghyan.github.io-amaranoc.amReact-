import Navigation from "./Navigation";
import HeaderEnd3 from "./HeaderEnd3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faUser,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const HeaderEnd = ({ className }) => {
  return (
    <div className={`flex items-center gap-8 ${className || ""}`}>
      <div className="flex items-center gap-6">
        <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
          <FontAwesomeIcon icon={faGlobe} />
        </Navigation>

        <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
          <FontAwesomeIcon icon={faUser} />
        </Navigation>
      </div>

      <div className="relative flex items-center">
        <HeaderEnd3
          place={"Որոնում"}
          className="pl-5 pr-10 border border-gray-300 h-[45px] w-[250px] rounded-[25px] outline-none text-sm focus:border-black transition-colors placeholder-gray-400"
        />
        <FontAwesomeIcon
          className="absolute right-4 text-gray-500 pointer-events-none text-sm"
          icon={faMagnifyingGlass}
        />
      </div>
    </div>
  );
};

export default HeaderEnd;
