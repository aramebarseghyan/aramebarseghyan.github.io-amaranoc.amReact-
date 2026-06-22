import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../../firebase";
import { useUserStore } from "../../store/useUserStore";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const setUserName = useUserStore((state) => state.setUserName);

  // Регистрация через Email и Пароль
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Խնդրում ենք լրացնել էլ. հասցեն և գաղտնաբառը");
      return;
    }

    try {
      // 1. Создаем пользователя в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Обновляем имя профиля в самом Auth
      await updateProfile(user, {
        displayName: fullName || email.split("@")[0],
      });

      // 3. Сохраняем данные в коллекцию "users" для чата
      const nameToSave = fullName || email.split("@")[0] || "User";
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: nameToSave,
        email: email,
        phone: phone,
        avatar: "https://via.placeholder.com/40",
      });

      setUserName(nameToSave);
      console.log("Օգտատեր գրանցվեց:", nameToSave);
      navigate("/");
    } catch (error) {
      console.error("Գրանցման սխալ:", error.message);
      alert("Գրանցման սխալ: " + error.message);
    }
  };

  // Регистрация/Вход через Google
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const displayName = user.displayName || user.email || "User";

      // Сохраняем/обновляем данные в коллекции "users"
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: displayName,
          email: user.email,
          avatar: user.photoURL || "https://via.placeholder.com/40",
        },
        { merge: true },
      ); // merge: true не удалит старые данные, если юзер уже есть

      localStorage.setItem("registeredName", displayName);
      setUserName(displayName);
      console.log("Հաջող մուտք Google-ով!", user);

      navigate("/");
    } catch (error) {
      console.error("Ավտորիզացման սխալ:", error.message);
      alert("Ավտորիզացման սխալ: " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h2 className="text-center text-xl font-bold text-gray-900 mb-8">
          Գրանցում
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Անուն Ազգանուն"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 outline-none transition focus:border-orange-400"
            />
          </div>
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Հեռախոսահամար"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 outline-none transition focus:border-orange-400"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Էլ. հասցե"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 outline-none transition focus:border-orange-400"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Գաղտնաբառ"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 outline-none transition focus:border-orange-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-full bg-[#ff9f43] py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-[#f08f33] active:scale-[0.99]"
            >
              Գրանցվել
            </button>
          </div>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-white px-3 text-sm text-gray-400">
            կամ
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#ff9f43] bg-white py-3.5 text-base font-medium text-gray-900 transition hover:bg-gray-50 active:scale-[0.99]"
        >
          {/* SVG Google... */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Գրանցվել Google-ի միջոցով</span>
        </button>

        <div className="mt-8 text-center text-sm font-medium text-gray-900">
          Արդեն գրանցվա՞ծ եք:{" "}
          <Link to="/login" className="text-[#ff9f43] hover:underline">
            Մուտք
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
