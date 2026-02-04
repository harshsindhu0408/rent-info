import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // This is for 'npm run dev'
  server: {
    host: true,
    allowedHosts: [".sindhustudio.in"], // Allows the domain and all subdomains
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/auth": { target: "http://localhost:8000", changeOrigin: true },
      "/uploads": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
  // This is for 'npm run preview' (what PM2 is running)
  preview: {
    host: true,
    port: 5173,
    allowedHosts: [".sindhustudio.in"],
  },
});
