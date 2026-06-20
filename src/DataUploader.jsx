import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  qardImg,
  qartName,
  qardPeople,
  qardPrice,
} from "./components/Main/Code";

const DataUploader = () => {
  const handleUpload = async () => {
    alert("1. Կլիկը աշխատեց! Ստուգում եմ տվյալները...");

    try {
      if (!qardImg || !qartName || !qardPeople || !qardPrice) {
        alert("ՍԽԱԼ: Code ֆայլից քարտերը չեն բեռնվել ցանկի մեջ!");
        return;
      }

      alert(
        `2. Տվյալները գտնված են: քարտերի քանակը ${qardImg.length}. Ուղարկում եմ Firebase-ին...`,
      );

      for (let i = 0; i < qardImg.length; i++) {
        await addDoc(collection(db, "properties"), {
          name: qartName[i] || "Անվանում չկա",
          imageUrl: qardImg[i] || "",
          people: qardPeople[i] || 0,
          price: qardPrice[i] || 0,
        });
      }

      alert("3. ՍԱ ՀԵՂԵՑՔԻՑ ԵՎ ՏՎՅԱԼՆԵՐԸ Հաջողությամբ գրանցվեցին Firebase-ում!");
    } catch (e) {
      console.error("Կրիտիկական սխալ:", e);
      alert("Firebase-ը մերժեց. " + e.message);
    }
  };

  return (
    <button
      onClick={handleUpload}
      className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md relative z-50"
      style={{ cursor: "pointer" }}
    >
      Տվյալներ բեռնել Firestore
    </button>
  );
};

export default DataUploader;
