import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { qardImg, qartName, qardPeople, qardPrice } from "./Code";

const DataUploader = () => {
  const handleUpload = async () => {
    try {
      for (let i = 0; i < qardImg.length; i++) {
        await addDoc(collection(db, "properties"), {
          name: qartName[i],
          imageUrl: qardImg[i],
          people: qardPeople[i],
          price: qardPrice[i],
        });
        console.log(`Загружено: ${qartName[i]}`);
      }
      alert("Готово! Все данные в базе.");
    } catch (e) {
      console.error("Ошибка:", e);
    }
  };

  return <button onClick={handleUpload}>Загрузить данные в Firestore</button>;
};

export default DataUploader;
