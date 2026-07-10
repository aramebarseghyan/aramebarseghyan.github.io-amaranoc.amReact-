import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl"; // 1. Импортируйте плагин

export default defineConfig({
  server: {
    host: "0.0.0.0", // Սա թույլ է տալիս մուտք գործել IP-ով
  },
  plugins: [react(), basicSsl()],
  base: "/",
});
