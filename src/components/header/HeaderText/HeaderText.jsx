import HeaderTextP from "./HeaderText3P/HeaderTextP";
import { Link } from "react-router-dom";
import Img from "../../../assets/logo (1).svg";

const HeaderText = () => {
  return (
    <div className="flex items-center gap-[45px]">
      <Link className="mr-60"  to='/'>
        <img className="ml-13 h-[45px] object-contain" src={Img} alt="Logo" />
      </Link>

      <Link to="/">
        <HeaderTextP>Գլխավոր</HeaderTextP>
      </Link>

      <Link to="/discounts">
        <HeaderTextP>Զեղչեր</HeaderTextP>
      </Link>

      <HeaderTextP>Ծառայություններ</HeaderTextP>
      <HeaderTextP>Մեր մասին</HeaderTextP>
    </div>
  );
};

export default HeaderText;
