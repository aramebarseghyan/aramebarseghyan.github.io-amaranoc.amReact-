import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
// Проверяй этот путь, если файлы лежат в другом месте!
import {
  qardImg,
  qartName,
  qardPeople,
  qardPrice,
} from "./components/Main/Code";

const DataUploader = () => {
  const handleUpload = async () => {
    // ТЕСТ 1: Проверяем, работает ли сам клик
    alert("1. Клик сработал! Начинаю проверку данных...");

    try {
      // ТЕСТ 2: Проверяем, импортировался ли твой старый код с карточками
      if (!qardImg || !qartName || !qardPeople || !qardPrice) {
        alert("ОШИБКА: Карточки из файла Code не загрузились в кнопку!");
        return;
      }

      alert(
        `2. Данные найдены! Обнаружено карточек: ${qardImg.length}. Отправляю в Firebase...`,
      );

      // ТЕСТ 3: Цикл загрузки
      for (let i = 0; i < qardImg.length; i++) {
        await addDoc(collection(db, "properties"), {
          name: qartName[i] || "Без названия",
          imageUrl: qardImg[i] || "",
          people: qardPeople[i] || 0,
          price: qardPrice[i] || 0,
        });
      }

      alert("3. УРА! Все данные успешно записались в Firebase!");
    } catch (e) {
      console.error("Критическая ошибка:", e);
      alert("БРАТ, ФАЙРБЕЙС ДАЛ ОТКАЗ: " + e.message);
    }
  };

  return (
    <button
      onClick={handleUpload}
      className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md relative z-50"
      style={{ cursor: "pointer" }}
    >
      Загрузить данные в Firestore
    </button>
  );
};

export default DataUploader;
