import HeaderTextP from "./HeaderText3P/HeaderTextP";
import { Link } from "react-router-dom"; // 1. Обязательно импортируем Link

const HeaderText = () => {
  return (
    <div className="flex items-center gap-[45px]">
      {/* Ссылка на главную страницу */}
      <Link to="/">
        <HeaderTextP>Գլխավոր</HeaderTextP>
      </Link>

      {/* Ссылка на вашу новую страницу скидок */}
      <Link to="/discounts">
        <HeaderTextP>Զեղչեր</HeaderTextP>
      </Link>

      {/* Остальные пункты пока без ссылок */}
      <HeaderTextP>Ծառայություններ</HeaderTextP>
      <HeaderTextP>Մեր մասին</HeaderTextP>
    </div>
  );
};

export default HeaderText;
