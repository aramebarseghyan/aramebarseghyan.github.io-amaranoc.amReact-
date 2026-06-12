import Navigation from "./Navigation";
import HeaderEnd3 from "./HeaderEnd3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faUser,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const HeaderEnd = ({ className }) => {
  return (
    <div className={`flex items-center gap-8 ${className || ""}`}>
      <div className="flex items-center gap-6">
        <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
          <FontAwesomeIcon icon={faGlobe} />
        </Navigation>

        <Link to={"/login"}>
          <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
            <FontAwesomeIcon icon={faUser} />
          </Navigation>
        </Link>
      </div>

      <div className="flex items-center border border-gray-300 h-[45px] w-[250px] rounded-[25px] pl-5 pr-4 focus-within:border-black transition-colors">
        <HeaderEnd3
          place={"Որոնում"}
          className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
        />
        <FontAwesomeIcon
          className="text-gray-500 text-sm ml-2"
          icon={faMagnifyingGlass}
        />
      </div>
    </div>
  );
};

export default HeaderEnd;
