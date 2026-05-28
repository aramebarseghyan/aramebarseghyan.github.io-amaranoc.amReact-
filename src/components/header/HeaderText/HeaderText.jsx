import HeaderTextP from "./HeaderText3P/HeaderTextP";
import { Link } from "react-router-dom";

const HeaderText = () => {
  return (
    <div className="flex items-center gap-[45px]">
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
