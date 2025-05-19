import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";

const App = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header isAuthenticated={isAuthenticated} cpf={user?.cpf} />
      <main className="container px-4 py-8 mx-auto">
        {/* O conteúdo será renderizado pelo RouterProvider */}
      </main>
    </div>
  );
};

export default App;
