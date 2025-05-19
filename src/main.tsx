import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { router } from "@/routes";
import "@/index.css";

// O conteúdo principal do aplicativo será renderizado pelo Next.js a partir da pasta pages
// Este arquivo main.tsx pode não ser mais necessário dependendo da sua configuração de entrada

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  </React.StrictMode>
);
