import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const clearAllProperties = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "properties"));
    const deletePromises = querySnapshot.docs.map((document) =>
      deleteDoc(doc(db, "properties", document.id)),
    );
    await Promise.all(deletePromises);
    alert("Տվյալների բազան մաքրվել է!");
  } catch (error) {
    console.error("Ջնջման սխալ:", error);
    alert("Տվյալների ջնջման սխալ");
  }
};
