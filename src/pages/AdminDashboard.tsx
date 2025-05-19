import React, { useEffect, useState } from "react";
import { feriasService } from "@/services/api";

// Interface que define a estrutura dos dados de férias
interface Ferias {
  id?: number;
  nomeColaborador: string; // Nome do colaborador que solicitou as férias
  nucleo: string; // Núcleo ao qual o colaborador pertence
  periodo1?: {
    // Primeiro período de férias
    de: string | Date | null; // Data inicial
    ate: string | Date | null; // Data final
  };
  periodo2?: {
    // Segundo período de férias (opcional)
    de: string | Date | null; // Data inicial
    ate: string | Date | null; // Data final
  };
  dataEnvio: string | Date | null; // Data em que a solicitação foi enviada
  aprovado: boolean; // Novo campo para controlar o status de aprovação
}

// Componente principal do painel do administrador
const AdminDashboard: React.FC = () => {
  // Estados para gerenciar os dados e interações do painel
  const [ferias, setFerias] = useState<Ferias[]>([]); // Lista de todas as solicitações de férias
  const [search, setSearch] = useState(""); // Termo de busca para filtrar colaboradores
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [itemToApprove, setItemToApprove] = useState<number | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<"pendente" | "aprovado">("pendente");
  const [abaAtiva, setAbaAtiva] = useState<"pendentes" | "aprovadas">("pendentes");

  // Efeito que carrega as solicitações de férias ao iniciar
  useEffect(() => {
    carregarSolicitacoesPendentes();
  }, []);

  // Função para carregar solicitações pendentes
  const carregarSolicitacoesPendentes = async () => {
    try {
      const solicitacoes = await feriasService.getSolicitacoes(false);
      setFerias(solicitacoes);
      setAbaAtiva("pendentes");
      setStatusFiltro("pendente");
    } catch (error) {
      console.error("Erro ao carregar solicitações pendentes:", error);
    }
  };

  // Função para carregar solicitações aprovadas
  const carregarSolicitacoesAprovadas = async () => {
    try {
      const solicitacoes = await feriasService.getSolicitacoes(true);
      setFerias(solicitacoes);
      setAbaAtiva("aprovadas");
      setStatusFiltro("aprovado");
    } catch (error) {
      console.error("Erro ao carregar solicitações aprovadas:", error);
    }
  };

  // Nova função para aprovar férias
  const aprovarFerias = async (index: number) => {
    try {
      const solicitacao = ferias[index];
      
      // Chama a API para aprovar a solicitação
      await feriasService.aprovarSolicitacao(solicitacao.id!);
      
      // Atualiza o estado local
      const novasFerias = [...ferias];
      novasFerias[index] = { ...novasFerias[index], aprovado: true };
      setFerias(novasFerias);
      
      // Atualiza o localStorage (se necessário)
      localStorage.setItem("feriasColaboradores", JSON.stringify(novasFerias));
      
      // Fecha o modal
      setShowApproveModal(false);
      setItemToApprove(null);
      
      // Opcional: exibir mensagem de sucesso
      alert("Solicitação aprovada com sucesso!");
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      alert("Erro ao aprovar solicitação. Tente novamente.");
    }
  };

  // Filtra as solicitações de férias com base no termo de busca e status
  const feriasFiltradas = ferias
    .filter((f) => (statusFiltro === "aprovado" ? f.aprovado : !f.aprovado))
    .filter((f) =>
      search.trim()
        ? f.nomeColaborador?.toLowerCase().includes(search.toLowerCase())
        : true
    );

  // Mensagem personalizada quando não há solicitações
  const getMensagemSemRegistros = () => {
    if (statusFiltro === "pendente") {
      return "Não há solicitações pendentes de aprovação.";
    }
    return "Não há solicitações aprovadas.";
  };

  // Calcula o total de dias de férias somando os dois períodos
  const calcularTotalFerias = (f: Ferias): number => {
    // Função auxiliar para calcular dias entre duas datas
    const dias = (
      de: string | Date | null,
      ate: string | Date | null
    ): number => {
      if (!de || !ate) return 0;
      const dataDe = new Date(de);
      const dataAte = new Date(ate);
      return (
        Math.abs(
          (dataAte.getTime() - dataDe.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );
    };
    // Soma os dias dos dois períodos
    return (
      dias(f.periodo1?.de ?? null, f.periodo1?.ate ?? null) +
      dias(f.periodo2?.de ?? null, f.periodo2?.ate ?? null)
    );
  };

  // Calcula a quantidade de dias em um período específico
  const diasPeriodo = (
    de: string | Date | null,
    ate: string | Date | null
  ): number => {
    if (!de || !ate) return 0;
    const dataDe = new Date(de);
    const dataAte = new Date(ate);
    return (
      Math.abs((dataAte.getTime() - dataDe.getTime()) / (1000 * 60 * 60 * 24)) +
      1
    );
  };

  // Formata a data para exibição no formato dd/mm
  const formatDateShort = (date: string | Date | null): string => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  // Formata o nome do núcleo com letra inicial maiúscula e acentos
  const formatarNucleo = (nucleo: string): string => {
    const nucleos: { [key: string]: string } = {
      sustentacao: "Sustentação",
      desenvolvimento: "Desenvolvimento",
      qualidade: "Qualidade",
      coordenacao: "Coordenação",
    };
    return nucleos[nucleo.toLowerCase()] || nucleo;
  };

  // Função para formatar o nome do colaborador (primeiro e segundo nome)
  const formatarNomeColaborador = (nomeCompleto: string): string => {
    const nomes = nomeCompleto.trim().split(" ");
    if (nomes.length >= 2) {
      return `${nomes[0]} ${nomes[1]}`;
    }
    return nomes[0];
  };

  // Renderização do componente
  return (
    <div className="flex flex-col justify-start items-center px-4 py-8 min-h-full">
      <div className="w-full max-w-[1800px] p-6 border-2 border-gray-300 shadow-lg dark:bg-slate-800 dark:border-slate-600">
        {/* Título do painel */}
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Painel do Administrador
        </h2>

        {/* Filtros */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            <button 
              className={`px-4 py-2 rounded-lg ${abaAtiva === "pendentes" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300"}`}
              onClick={carregarSolicitacoesPendentes}
            >
              Solicitações Pendentes
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${abaAtiva === "aprovadas" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300"}`}
              onClick={carregarSolicitacoesAprovadas}
            >
              Solicitações Aprovadas
            </button>
          </div>
          <input
            type="text"
            placeholder="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 w-96 rounded border border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* Tabela de solicitações de férias */}
        <div className="w-full">
          <table className="w-full bg-white rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800">
            {/* Cabeçalho da tabela */}
            <thead className="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Colaborador
                </th>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Núcleo
                </th>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Total de Férias (dias)
                </th>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Período 1
                </th>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Período 2
                </th>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Data de envio
                </th>
                <th className="px-8 py-3 text-gray-900 whitespace-nowrap border-b dark:text-white dark:border-slate-600">
                  Ações
                </th>
              </tr>
            </thead>

            {/* Corpo da tabela */}
            <tbody>
              {/* Mensagem quando não há registros */}
              {feriasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-6 text-center text-gray-500 dark:text-gray-300"
                  >
                    {getMensagemSemRegistros()}
                  </td>
                </tr>
              )}

              {/* Lista de solicitações de férias */}
              {feriasFiltradas.map((f, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 dark:border-slate-700"
                >
                  {/* Dados do colaborador e períodos */}
                  <td className="px-6 py-3 text-center text-gray-900 whitespace-nowrap dark:text-white">
                    {formatarNomeColaborador(f.nomeColaborador || "")}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-900 whitespace-nowrap dark:text-white">
                    {formatarNucleo(f.nucleo)}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-900 whitespace-nowrap dark:text-white">
                    {calcularTotalFerias(f)}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-900 whitespace-nowrap dark:text-white">
                    {formatDateShort(f.periodo1?.de ?? null)} até{" "}
                    {formatDateShort(f.periodo1?.ate ?? null)} (
                    {diasPeriodo(
                      f.periodo1?.de ?? null,
                      f.periodo1?.ate ?? null
                    )}{" "}
                    dias)
                  </td>
                  <td className="px-6 py-3 text-center text-gray-900 whitespace-nowrap dark:text-white">
                    {formatDateShort(f.periodo2?.de ?? null)} até{" "}
                    {formatDateShort(f.periodo2?.ate ?? null)} (
                    {diasPeriodo(
                      f.periodo2?.de ?? null,
                      f.periodo2?.ate ?? null
                    )}{" "}
                    dias)
                  </td>
                  <td className="px-6 py-3 text-center text-gray-900 whitespace-nowrap dark:text-white">
                    {formatDateShort(f.dataEnvio)}
                  </td>
                  {/* Botão de exclusão */}
                  <td className="px-6 py-3 text-center whitespace-nowrap">
                    <div className="flex gap-2 justify-center">
                      {!f.aprovado && (
                        <button
                          onClick={() => {
                            setItemToApprove(idx);
                            setShowApproveModal(true);
                          }}
                          className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Aprovar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setItemToDelete(idx);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
              Confirmar Exclusão
            </h3>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              Tem certeza que deseja excluir a solicitação de{" "}
              {itemToDelete !== null &&
                formatarNomeColaborador(
                  ferias[itemToDelete]?.nomeColaborador || ""
                )}
              ?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (itemToDelete !== null) {
                    const novasFerias = ferias.filter(
                      (_, i) => i !== itemToDelete
                    );
                    setFerias(novasFerias);
                    localStorage.setItem(
                      "feriasColaboradores",
                      JSON.stringify(novasFerias)
                    );
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }
                }}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de aprovação */}
      {showApproveModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
              Confirmar Aprovação
            </h3>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              Deseja aprovar a solicitação de férias de{" "}
              {itemToApprove !== null && ferias[itemToApprove]?.nomeColaborador}
              ?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setItemToApprove(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (itemToApprove !== null) {
                    aprovarFerias(itemToApprove);
                  }
                }}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

// Adicione um estado para controlar a aba ativa
const [abaAtiva, setAbaAtiva] = useState("pendentes");

// Função para carregar solicitações pendentes
const carregarSolicitacoesPendentes = async () => {
  try {
    const solicitacoes = await feriasService.getSolicitacoes(false);
    setFerias(solicitacoes);
    setAbaAtiva("pendentes");
  } catch (error) {
    console.error("Erro ao carregar solicitações pendentes:", error);
  }
};

// Função para carregar solicitações aprovadas
const carregarSolicitacoesAprovadas = async () => {
  try {
    const solicitacoes = await feriasService.getSolicitacoes(true);
    setFerias(solicitacoes);
    setAbaAtiva("aprovadas");
  } catch (error) {
    console.error("Erro ao carregar solicitações aprovadas:", error);
  }
};

// Use useEffect para carregar as solicitações pendentes ao montar o componente
useEffect(() => {
  carregarSolicitacoesPendentes();
}, []);
