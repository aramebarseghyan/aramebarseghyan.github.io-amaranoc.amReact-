import Navigation from "./Navigation";
import HeaderEnd3 from "./HeaderEnd3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faUser,
  faMagnifyingGlass,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const HeaderEnd = ({ className, isLoggedIn, onLogout }) => {
  return (
    <div className={`flex items-center gap-8 ${className || ""}`}>
      <div className="flex items-center gap-6">
        <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
          <FontAwesomeIcon icon={faGlobe} />
        </Navigation>

        {isLoggedIn && (
          <>
            <Link to="/chat">
              <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
                <FontAwesomeIcon icon={faCommentDots} />
              </Navigation>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Ելք
            </button>
          </>
        )}

        {!isLoggedIn && (
          <Link to="/login">
            <Navigation className="bg-transparent border-none p-0 cursor-pointer text-gray-700 hover:text-black transition-colors outline-none text-[17px]">
              <FontAwesomeIcon icon={faUser} />
            </Navigation>
          </Link>
        )}
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
