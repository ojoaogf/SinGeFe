import { Card } from "@/components/ui/card";

// Componente do rodapé da aplicação
export function Footer() {
  return (
    <footer className="w-full py-2">
      {/* Card contendo as informações do rodapé */}
      <Card className="w-full p-2 text-center dark:bg-slate-800">
        <div className="flex flex-col items-center justify-center space-y-1">
          {/* Nome do sistema */}
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Sistema de Gerenciamento de Férias Internas
          </p>
          {/* Informações de desenvolvimento e copyright */}
          <div className="flex items-center space-x-1">
            {/* Créditos do desenvolvedor */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Desenvolvido por João Gabriel Ferreira
            </p>
            {/* Separador visual */}
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            {/* Ano atual para o copyright */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </Card>
    </footer>
  );
}
