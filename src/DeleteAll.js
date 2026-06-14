import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase"; // Убедись, что путь к firebase.js правильный

export const deleteAllProperties = async () => {
  const querySnapshot = await getDocs(collection(db, "properties"));
  querySnapshot.forEach(async (document) => {
    await deleteDoc(doc(db, "properties", document.id));
    console.log("Удален документ:", document.id);
  });
  alert("Все документы удалены!");
};