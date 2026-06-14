import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase"; // Убедись, что путь к твоему firebase.js верный

export const clearAllProperties = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "properties"));
    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, "properties", document.id)),
    );
    await Promise.all(deletePromises);
    alert("База данных очищена!");
  } catch (error) {
    console.error("Ошибка при удалении:", error);
    alert("Ошибка при удалении данных");
  }
};
