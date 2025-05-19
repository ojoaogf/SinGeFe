import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contas as contasOriginais } from "@/data/const/contas";
import Modal from "@/components/Modal";

// Interface que define a estrutura de uma conta de usuário
interface Conta {
  cpf: string;
  senha: string;
  name: string;
  isAdm: boolean;
}

// Interface que define as props do componente de login
interface LoginFormProps {
  readonly setIsAuthenticated: (arg: boolean) => void;
  readonly setIsAdm: (arg: boolean) => void;
  setCpfLogado: (cpf: string) => void;
}

export default function LoginForm({
  setIsAuthenticated,
  setIsAdm,
  setCpfLogado,
}: LoginFormProps) {
  // Estados para controlar a visibilidade da senha e dados do formulário
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfPlaceholder, setCpfPlaceholder] = useState("Digite seu CPF");
  const [senhaPlaceholder, setSenhaPlaceholder] = useState("Digite sua Senha");
  const [showCadastro, setShowCadastro] = useState(false);
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroCpf, setCadastroCpf] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");
  // Estado para modal de erro
  const [showErrorModal, setShowErrorModal] = useState(false);
  // Estado para modal de sucesso do cadastro
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Carrega as contas do localStorage ou usa as contas originais
  const contas =
    JSON.parse(localStorage.getItem("contas") || "null") || contasOriginais;

  // Função para realizar o login do usuário
  const fazerLogin = () => {
    const contaEncontrada = contas.find(
      (conta: { cpf: string; senha: string }) =>
        conta.cpf == cpf && conta.senha == password
    );
    if (contaEncontrada) {
      setIsAuthenticated(true);
      setIsAdm(contaEncontrada.isAdm);
      localStorage.setItem("cpfLogado", cpf);
      setCpfLogado(cpf);
    } else setShowErrorModal(true);
  };

  // Função para lidar com o cadastro de novos usuários
  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadastroNome || !cadastroCpf || !cadastroSenha) {
      alert("Preencha todos os campos!");
      return;
    }
    const contasSalvas =
      JSON.parse(localStorage.getItem("contas") || "null") || contasOriginais;
    if (contasSalvas.find((c: Conta) => c.cpf === cadastroCpf)) {
      alert("Já existe um cadastro com esse CPF!");
      return;
    }
    contasSalvas.push({
      cpf: cadastroCpf,
      senha: cadastroSenha,
      name: cadastroNome,
      isAdm: false,
    });
    localStorage.setItem("contas", JSON.stringify(contasSalvas));
    setShowSuccessModal(true);
    setShowCadastro(false);
    setCadastroNome("");
    setCadastroCpf("");
    setCadastroSenha("");
  };

  // Função para formatar o CPF com pontos e traço
  const formatCPF = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");
    const regex = /^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/;
    const match = regex.exec(cleanedValue);
    if (match) {
      return formatCPFWithMatch(match);
    }
    return value;
  };

  // Função auxiliar para formatar o CPF com base nos grupos de números
  const formatCPFWithMatch = (match: RegExpExecArray) => {
    if (!match[2]) return match[1];
    if (!match[3]) return `${match[1]}.${match[2]}`;
    if (!match[4]) return `${match[1]}.${match[2]}.${match[3]}`;
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  };

  return (
    // Container principal do formulário com estilização responsiva
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 bg-white dark:bg-slate-900">
      {/* Modal de erro de login */}
      <Modal
        open={showErrorModal}
        title="Erro ao fazer login"
        message="Usuário não cadastrado ou senha incorreta."
        onClose={() => setShowErrorModal(false)}
      />
      {/* Modal de sucesso do cadastro */}
      <Modal
        open={showSuccessModal}
        title="Cadastro realizado"
        message="Cadastro realizado com sucesso!"
        onClose={() => setShowSuccessModal(false)}
      />
      {/* Card que contém o formulário de login/cadastro */}
      <Card className="w-full max-w-md border dark:border-slate-700 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-center text-gray-900 dark:text-white">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Renderização condicional entre formulário de login e cadastro */}
          {!showCadastro ? (
            <>
              {/* Formulário de Login */}
              <div className="flex flex-col items-center space-y-2">
                <label
                  htmlFor="cpf"
                  className="self-center text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  CPF
                </label>
                <div className="relative w-3/4">
                  <Input
                    id="cpf"
                    placeholder={cpfPlaceholder}
                    type="text"
                    className="text-center text-gray-900 bg-gray-50 border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    onFocus={() => setCpfPlaceholder("")}
                    onBlur={() => {
                      if (!cpf) setCpfPlaceholder("Digite seu CPF");
                    }}
                  />
                </div>
              </div>
              {/* Campo de senha com botão para mostrar/ocultar */}
              <div className="flex flex-col items-center space-y-2">
                <label
                  htmlFor="password"
                  className="self-center text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Senha
                </label>
                <div className="relative w-3/4">
                  <Input
                    id="password"
                    placeholder={senhaPlaceholder}
                    type={showPassword ? "text" : "password"}
                    className="text-center text-gray-900 bg-gray-50 border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setSenhaPlaceholder("")}
                    onBlur={() => {
                      if (!password) setSenhaPlaceholder("Digite sua Senha");
                    }}
                  />
                  {password.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 text-gray-500 bg-transparent -translate-y-1/2 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-transparent focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {/* Link para alternar para o formulário de cadastro */}
              <a
                href="#"
                className="block text-sm text-right text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => setShowCadastro(true)}
              >
                Não tem cadastro? Clique aqui
              </a>
              {/* Botão de login */}
              <div className="flex justify-center w-full">
                <Button
                  onClick={fazerLogin}
                  className="w-1/2 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Entrar
                </Button>
              </div>
            </>
          ) : (
            // Formulário de Cadastro
            <form onSubmit={handleCadastro} className="space-y-4">
              {/* Campos do formulário de cadastro */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Nome
                </label>
                <Input
                  type="text"
                  placeholder="Digite seu nome"
                  value={cadastroNome}
                  onChange={(e) => setCadastroNome(e.target.value)}
                  className="text-gray-900 bg-white border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                  CPF
                </label>
                <Input
                  type="text"
                  placeholder="Digite seu CPF"
                  value={cadastroCpf}
                  onChange={(e) => setCadastroCpf(formatCPF(e.target.value))}
                  maxLength={14}
                  className="text-gray-900 bg-white border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="Defina uma senha"
                  value={cadastroSenha}
                  onChange={(e) => setCadastroSenha(e.target.value)}
                  className="text-gray-900 bg-white border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              {/* Botões de ação do formulário de cadastro */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCadastro(false)}
                  className="mr-2 border-gray-300 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
