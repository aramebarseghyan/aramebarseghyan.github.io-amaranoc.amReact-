import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const deleteAllProperties = async () => {
  const querySnapshot = await getDocs(collection(db, "properties"));
  querySnapshot.forEach(async (document) => {
    await deleteDoc(doc(db, "properties", document.id));
    console.log("Փաստաթուղթը ջնջվեց:", document.id);
  });
  alert("Բոլոր փաստաթղթերը ջնջվել են!");
};