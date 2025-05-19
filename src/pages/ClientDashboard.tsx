import React, { useState } from "react";
import Calendar from "../components/Calendar";
import { Card } from "../components/ui/card";
import { differenceInCalendarDays, addDays } from "date-fns";

// Opções de períodos disponíveis quando o colaborador solicita abono (venda de 10 dias)
const periodosPossiveis = [
  { label: "6/14", value: [6, 14], inverso: [14, 6] },
  { label: "5/15", value: [5, 15], inverso: [15, 5] },
  { label: "10/10", value: [10, 10], inverso: [10, 10] },
];

// Opções de períodos disponíveis quando NÃO há abono
const periodosSemAbono = [
  { label: "10/20", value: [10, 20], inverso: [20, 10] },
  { label: "15/15", value: [15, 15], inverso: [15, 15] },
  { label: "30 corridos", value: [30, 0], inverso: [30, 0] },
];

// Interface para tipagem dos dados de conta do colaborador
interface Conta {
  cpf: string;
  name: string;
}

// Interface para tipagem dos dados de férias
interface FeriasSolicitadas {
  id?: number;
  nomeColaborador: string;
  nucleo: string;
  abono: boolean;
  periodo1?: {
    de: string | Date;
    ate: string | Date;
  };
  periodo2?: {
    de: string | Date;
    ate: string | Date;
  };
  dataEnvio: string | Date;
  aprovado: boolean;
}

// Componente principal do painel do colaborador
const ClientDashboard: React.FC = () => {
  // Estado para controlar se o colaborador vai vender 10 dias de férias (abono)
  const [vender10Dias, setVender10Dias] = useState(false);
  // Estado para controlar a visibilidade do formulário
  const [showFormulario, setShowFormulario] = useState(false);
  // Estado para armazenar o período selecionado (ex: [6, 14])
  const [periodo, setPeriodo] = useState<number[] | null>(null);
  // Estado para armazenar a data inicial do primeiro período
  const [periodo1De, setPeriodo1De] = useState<Date | null>(null);
  // Estado para armazenar a data final do primeiro período
  const [periodo1Ate, setPeriodo1Ate] = useState<Date | null>(null);
  // Estado para armazenar a data inicial do segundo período
  const [periodo2De, setPeriodo2De] = useState<Date | null>(null);
  // Estado para armazenar a data final do segundo período
  const [periodo2Ate, setPeriodo2Ate] = useState<Date | null>(null);
  // Estado para armazenar o núcleo selecionado pelo colaborador
  const [nucleo, setNucleo] = useState("");
  // Estado para controlar a exibição do modal de confirmação
  const [showModal, setShowModal] = useState(false);
  // Estado para controlar a exibição do modal de sucesso
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Novo estado para controlar a visualização das férias solicitadas
  const [showFeriasSolicitadas, setShowFeriasSolicitadas] = useState(false);
  // Estado para armazenar as férias do colaborador
  const [minhasFerias, setMinhasFerias] = useState<FeriasSolicitadas[]>([]);
  // Estado para controlar qual solicitação está sendo editada
  const [editandoFerias, setEditandoFerias] =
    useState<FeriasSolicitadas | null>(null);
  // Adicionar estado para controlar a ordem dos períodos
  const [ordemInvertida, setOrdemInvertida] = useState(false);

  // Função utilitária para formatar datas no padrão brasileiro
  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("pt-BR") : "";

  // Função para calcular a quantidade de dias entre duas datas (inclusive)
  const diasEntre = (de: Date | null, ate: Date | null) => {
    if (!de || !ate) return 0;
    return Math.abs(differenceInCalendarDays(ate, de)) + 1;
  };

  // Função para calcular a data final a partir de uma data inicial e quantidade de dias
  const calcularDataFinal = (
    dataInicial: Date | null,
    dias: number
  ): Date | null => {
    if (!dataInicial) return null;
    return addDays(dataInicial, dias - 1);
  };

  // Calcula a quantidade de dias do primeiro período
  const diasPeriodo1 = diasEntre(periodo1De, periodo1Ate);

  // Função chamada ao alterar a data final do primeiro período
  const handlePeriodo1Ate = (date: Date | null) => {
    setPeriodo1Ate(date);
    if (date && periodo1De) {
      const dias = diasEntre(periodo1De, date);
      // Garante que o número de dias do primeiro período seja igual ao valor selecionado
      if (periodo && dias !== periodo[0]) {
        setPeriodo1Ate(calcularDataFinal(periodo1De, periodo[0]));
      }
    }
    // Limpa o segundo período ao alterar a data final do primeiro
    setPeriodo2De(null);
    setPeriodo2Ate(null);
  };

  // Busca o nome do colaborador pelo CPF salvo no localStorage
  const cpf = localStorage.getItem("cpfLogado") || "";
  const contasSalvas = JSON.parse(
    localStorage.getItem("contas") || "[]"
  ) as Conta[];
  const colaborador = contasSalvas.find((c) => c.cpf === cpf);
  const nomeColaborador = colaborador ? colaborador.name : "Colaborador";

  // Função para iniciar a edição de férias
  const iniciarEdicao = (ferias: FeriasSolicitadas) => {
    setEditandoFerias(ferias);
    setNucleo(ferias.nucleo);
    setVender10Dias(ferias.abono);
    if (ferias.periodo1) {
      setPeriodo1De(new Date(ferias.periodo1.de));
      setPeriodo1Ate(new Date(ferias.periodo1.ate));
    }
    if (ferias.periodo2) {
      setPeriodo2De(new Date(ferias.periodo2.de));
      setPeriodo2Ate(new Date(ferias.periodo2.ate));
    }
    // Calcula o período baseado nos dias
    const dias1 = diasEntre(
      new Date(ferias.periodo1?.de || ""),
      new Date(ferias.periodo1?.ate || "")
    );
    const dias2 = ferias.periodo2
      ? diasEntre(new Date(ferias.periodo2.de), new Date(ferias.periodo2.ate))
      : 0;
    setPeriodo([dias1, dias2]);
    setShowFeriasSolicitadas(false);
    setShowFormulario(true);
  };

  // Função para atualizar as férias
  const atualizarFerias = () => {
    if (!editandoFerias) return;

    const feriasSalvas = JSON.parse(
      localStorage.getItem("feriasColaboradores") || "[]"
    );

    const feriasAtualizadas = feriasSalvas.map((f: FeriasSolicitadas) => {
      if (
        f.nomeColaborador === editandoFerias.nomeColaborador &&
        f.dataEnvio === editandoFerias.dataEnvio
      ) {
        return {
          ...f,
          nucleo,
          abono: vender10Dias,
          periodo1: { de: periodo1De, ate: periodo1Ate },
          periodo2:
            periodo && periodo[1] > 0
              ? { de: periodo2De, ate: periodo2Ate }
              : undefined,
          dataEnvio: new Date(),
          aprovado: f.aprovado, // mantém o status de aprovação
        };
      }
      return f;
    });

    localStorage.setItem(
      "feriasColaboradores",
      JSON.stringify(feriasAtualizadas)
    );
    setEditandoFerias(null);
    setShowSuccessModal(true);
  };

  // Função chamada ao confirmar a solicitação de férias
  const handleConfirmar = () => {
    if (editandoFerias) {
      atualizarFerias();
    } else {
      const ferias = {
        id: Date.now(), // Gera um ID único
        nomeColaborador,
        nucleo,
        abono: vender10Dias,
        periodo1: { de: periodo1De, ate: periodo1Ate },
        periodo2:
          periodo && periodo[1] > 0
            ? { de: periodo2De, ate: periodo2Ate }
            : undefined,
        dataEnvio: new Date(),
        aprovado: false,
      };
      const feriasSalvas = JSON.parse(
        localStorage.getItem("feriasColaboradores") || "[]"
      );
      feriasSalvas.push(ferias);
      localStorage.setItem("feriasColaboradores", JSON.stringify(feriasSalvas));
      // Atualiza o estado minhasFerias após salvar
      setMinhasFerias(
        feriasSalvas.filter(
          (f: FeriasSolicitadas) => f.nomeColaborador === nomeColaborador
        )
      );
      setShowSuccessModal(true);
    }
    // Limpar os campos após salvar
    setVender10Dias(false);
    setPeriodo(null);
    setPeriodo1De(null);
    setPeriodo1Ate(null);
    setPeriodo2De(null);
    setPeriodo2Ate(null);
    setNucleo("");
    setShowFormulario(false);
    setEditandoFerias(null);
  };

  // Data de hoje para validação dos calendários
  const today = new Date();

  // Função para carregar as férias do colaborador
  const carregarFeriasSolicitadas = () => {
    const feriasSalvas = JSON.parse(
      localStorage.getItem("feriasColaboradores") || "[]"
    );
    const feriasFiltradas = feriasSalvas.filter(
      (f: FeriasSolicitadas) => f.nomeColaborador === nomeColaborador
    );
    setMinhasFerias(feriasFiltradas);
    setShowFeriasSolicitadas(true);
    setShowFormulario(false);
  };

  // Função para formatar o nome do núcleo
  const formatarNucleo = (nucleo: string): string => {
    const mapeamentoNucleos: { [key: string]: string } = {
      administrativo: "Administrativo",
      gestao: "Gestão",
      marketing: "Marketing",
      financeiro: "Financeiro",
    };
    return mapeamentoNucleos[nucleo] || nucleo;
  };

  // Função para formatar a divisão do período
  const formatarDivisaoPeriodo = (ferias: FeriasSolicitadas): string => {
    const periodo1Dias = ferias.periodo1
      ? diasEntre(new Date(ferias.periodo1.de), new Date(ferias.periodo1.ate))
      : 0;
    const periodo2Dias = ferias.periodo2
      ? diasEntre(new Date(ferias.periodo2.de), new Date(ferias.periodo2.ate))
      : 0;

    if (!ferias.periodo2) {
      return "30 dias corridos";
    }
    return `${periodo1Dias}/${periodo2Dias}`;
  };

  // Função para obter os dias do período atual baseado na seleção e ordem
  const getDiasPeriodos = () => {
    if (!periodo) return null;
    const opcoesPeriodos = vender10Dias ? periodosPossiveis : periodosSemAbono;
    const periodoSelecionado = opcoesPeriodos.find(
      (p) => p.value[0] === periodo[0] && p.value[1] === periodo[1]
    );
    if (!periodoSelecionado) return null;

    // Retorna os períodos na ordem correta baseado na seleção do usuário
    return ordemInvertida
      ? [periodoSelecionado.value[1], periodoSelecionado.value[0]]
      : periodoSelecionado.value;
  };

  // Renderização do componente
  return (
    <div className="flex flex-col justify-start items-center px-4 py-8 min-h-full">
      <Card className="p-8 w-full max-w-4xl border-2 border-gray-300 shadow-lg dark:bg-slate-800 dark:border-slate-600">
        {/* Seção do Título */}
        <div className="pb-4 mb-8 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Painel do Colaborador
          </h2>
        </div>

        {/* Seção de Botões de Ação */}
        <div className="pb-6 mb-8 border-b border-gray-200 dark:border-slate-600">
          <div className="flex flex-col gap-4 items-center">
            {!showFormulario && !showFeriasSolicitadas && (
              <button
                onClick={() => setShowFormulario(true)}
                className="px-8 py-2 font-medium text-white bg-green-600 rounded transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Nova Solicitação
              </button>
            )}
            {!showFormulario && minhasFerias.length > 0 && (
              <button
                onClick={carregarFeriasSolicitadas}
                className="px-8 py-2 font-medium text-white bg-blue-600 rounded transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Verificar Férias
              </button>
            )}
          </div>
        </div>

        {/* Seção de Informações e Formulário */}
        <div className="space-y-6">
          {/* Seção de férias solicitadas */}
          {showFeriasSolicitadas && minhasFerias.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                Minhas Férias Solicitadas
              </h3>
              <div className="space-y-4">
                {minhasFerias.map((ferias, index) => (
                  <div
                    key={index}
                    className="p-4 rounded border border-gray-200 dark:border-slate-600"
                  >
                    <div className="grid gap-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Data de Envio:</span>{" "}
                        {new Date(ferias.dataEnvio).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Núcleo:</span>{" "}
                        {formatarNucleo(ferias.nucleo)}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Abono:</span>{" "}
                        {ferias.abono ? "Sim" : "Não"}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Divisão do Período:</span>{" "}
                        {formatarDivisaoPeriodo(ferias)}
                      </p>
                      {ferias.periodo1?.de && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Primeiro Período:</span>{" "}
                          {new Date(ferias.periodo1.de).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          até{" "}
                          {new Date(ferias.periodo1.ate).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          <span className="text-gray-500 dark:text-gray-400">
                            (
                            {diasEntre(
                              new Date(ferias.periodo1.de),
                              new Date(ferias.periodo1.ate)
                            )}{" "}
                            dias)
                          </span>
                        </p>
                      )}
                      {ferias.periodo2?.de && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Segundo Período:</span>{" "}
                          {new Date(ferias.periodo2.de).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          até{" "}
                          {new Date(ferias.periodo2.ate).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          <span className="text-gray-500 dark:text-gray-400">
                            (
                            {diasEntre(
                              new Date(ferias.periodo2.de),
                              new Date(ferias.periodo2.ate)
                            )}{" "}
                            dias)
                          </span>
                        </p>
                      )}
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => iniciarEdicao(ferias)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          Alterar Férias
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setShowFeriasSolicitadas(false);
                  }}
                  className="px-8 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Formulário de solicitação de férias */}
          {showFormulario && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">
                  Solicitar Férias
                </h3>
              </div>

              {/* Seleção do núcleo */}
              <div className="flex flex-col items-center mb-6">
                <label className="block mb-2 font-medium text-center text-gray-900 dark:text-white">
                  Núcleo:
                </label>
                <select
                  className="min-w-[200px] p-2 text-center text-gray-900 bg-white border border-gray-300 rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  value={nucleo}
                  onChange={(e) => setNucleo(e.target.value)}
                >
                  <option value="" disabled selected>
                    Selecione seu núcleo
                  </option>
                  <option value="gestao">Gestão</option>
                  <option value="marketing">Marketing</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="administrativo">Administrativo</option>
                </select>
              </div>
              {/* Checkbox para abono */}
              <div className="flex gap-2 justify-center items-center mb-6">
                <input
                  type="checkbox"
                  id="vender10"
                  checked={vender10Dias}
                  onChange={(e) => {
                    setVender10Dias(e.target.checked);
                    setPeriodo(null);
                    setPeriodo1De(null);
                    setPeriodo1Ate(null);
                    setPeriodo2De(null);
                    setPeriodo2Ate(null);
                  }}
                  className="dark:bg-slate-700 dark:border-slate-600"
                />
                <label
                  htmlFor="vender10"
                  className="text-gray-900 dark:text-white"
                >
                  Abono solicitado
                </label>
              </div>
              {/* Seleção do período de férias */}
              <div className="flex flex-col items-center mb-6">
                <label className="block mb-2 font-medium text-center text-gray-900 dark:text-white">
                  Como deseja dividir o período de férias?
                </label>
                <select
                  className="min-w-[200px] p-2 text-center text-gray-900 bg-white border border-gray-300 rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  value={periodo ? `${periodo[0]}/${periodo[1]}` : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setPeriodo(null);
                      setPeriodo1De(null);
                      setPeriodo1Ate(null);
                      setPeriodo2De(null);
                      setPeriodo2Ate(null);
                      return;
                    }
                    const [p1, p2] = e.target.value.split("/").map(Number);
                    setPeriodo([p1, p2]);
                    setPeriodo1De(null);
                    setPeriodo1Ate(null);
                    setPeriodo2De(null);
                    setPeriodo2Ate(null);
                    setOrdemInvertida(false);
                  }}
                >
                  <option value="" disabled>
                    Escolha o período
                  </option>
                  {(vender10Dias ? periodosPossiveis : periodosSemAbono).map(
                    (p) => (
                      <option
                        key={p.label}
                        value={p.value.join("/")}
                        className="text-center dark:bg-slate-700 dark:text-white"
                      >
                        {p.label}
                      </option>
                    )
                  )}
                </select>

                {periodo && periodo[1] > 0 && (
                  <div className="mt-4">
                    <label className="block mb-2 font-medium text-center text-gray-900 dark:text-white">
                      Qual período deseja tirar primeiro?
                    </label>
                    <div className="flex gap-4 justify-center">
                      <button
                        className={`px-4 py-2 font-medium rounded transition-colors ${
                          !ordemInvertida
                            ? "text-white bg-blue-600 hover:bg-blue-700"
                            : "text-gray-700 bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setOrdemInvertida(false)}
                      >
                        {periodo[0]} dias
                      </button>
                      <button
                        className={`px-4 py-2 font-medium rounded transition-colors ${
                          ordemInvertida
                            ? "text-white bg-blue-600 hover:bg-blue-700"
                            : "text-gray-700 bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setOrdemInvertida(true)}
                      >
                        {periodo[1]} dias
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Período único de 30 dias corridos */}
              {periodo && periodo[1] === 0 && (
                <div className="mb-6">
                  <label className="block mb-2 font-medium text-center text-gray-900 dark:text-white">
                    Período único de férias (30 dias corridos):
                  </label>
                  <div className="flex flex-row gap-4 justify-center items-end">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        De:
                      </span>
                      <Calendar
                        selectedDate={periodo1De}
                        onDateChange={(date) => {
                          setPeriodo1De(date);
                          setPeriodo1Ate(
                            date ? calcularDataFinal(date, 30) : null
                          );
                        }}
                        minDate={today}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Até:
                      </span>
                      <Calendar
                        selectedDate={periodo1Ate}
                        onDateChange={handlePeriodo1Ate}
                        minDate={periodo1De ? addDays(periodo1De, 1) : today}
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-center text-gray-600 dark:text-gray-300">
                    {formatDate(periodo1De)} {periodo1De && "até"}{" "}
                    {formatDate(periodo1Ate)}
                    {periodo !== null &&
                      diasPeriodo1 > 0 &&
                      diasPeriodo1 !== 30 && (
                        <span className="block text-red-500">
                          Selecione exatamente 30 dias
                        </span>
                      )}
                  </div>
                </div>
              )}
              {/* Seleção do primeiro período (quando não for 30 corridos) */}
              {periodo && periodo[1] > 0 && (
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-center text-gray-900 dark:text-white">
                    Primeiro período ({getDiasPeriodos()?.[0] || periodo[0]}{" "}
                    dias):
                  </label>
                  <div className="flex flex-row gap-4 justify-center items-end">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        De:
                      </span>
                      <Calendar
                        selectedDate={periodo1De}
                        onDateChange={(date) => {
                          setPeriodo1De(date);
                          if (date) {
                            const diasPrimeiroPeriodo =
                              getDiasPeriodos()?.[0] || periodo[0];
                            setPeriodo1Ate(
                              calcularDataFinal(date, diasPrimeiroPeriodo)
                            );
                          } else {
                            setPeriodo1Ate(null);
                          }
                          setPeriodo2De(null);
                          setPeriodo2Ate(null);
                        }}
                        minDate={today}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Até:
                      </span>
                      <Calendar
                        selectedDate={periodo1Ate}
                        onDateChange={() => {}}
                        minDate={periodo1De ? addDays(periodo1De, 1) : today}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-center text-gray-600 dark:text-gray-300">
                    {formatDate(periodo1De)} {periodo1De && "até"}{" "}
                    {formatDate(periodo1Ate)}
                    <div className="mt-1">
                      {periodo1De && periodo1Ate && (
                        <span className="text-gray-400">
                          Período selecionado:{" "}
                          {diasEntre(periodo1De, periodo1Ate)} dias
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Seleção do segundo período */}
              {periodo && periodo[1] > 0 && periodo1De && periodo1Ate && (
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-center text-gray-900 dark:text-white">
                    Segundo período ({getDiasPeriodos()?.[1] || periodo[1]}{" "}
                    dias):
                  </label>
                  <div className="flex flex-row gap-4 justify-center items-end">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        De:
                      </span>
                      <Calendar
                        selectedDate={periodo2De}
                        onDateChange={(date) => {
                          setPeriodo2De(date);
                          if (date) {
                            const diasSegundoPeriodo =
                              getDiasPeriodos()?.[1] || periodo[1];
                            setPeriodo2Ate(
                              calcularDataFinal(date, diasSegundoPeriodo)
                            );
                          } else {
                            setPeriodo2Ate(null);
                          }
                        }}
                        minDate={periodo1Ate ? addDays(periodo1Ate, 1) : today}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Até:
                      </span>
                      <Calendar
                        selectedDate={periodo2Ate}
                        onDateChange={() => {}}
                        minDate={periodo2De ? addDays(periodo2De, 1) : today}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-center text-gray-600 dark:text-gray-300">
                    {formatDate(periodo2De)} {periodo2De && "até"}{" "}
                    {formatDate(periodo2Ate)}
                    <div className="mt-1">
                      {periodo2De && periodo2Ate && (
                        <span className="text-gray-400">
                          Período selecionado:{" "}
                          {diasEntre(periodo2De, periodo2Ate)} dias
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Botões de ação do formulário */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    if (editandoFerias) {
                      // Se estiver editando, volta para o relatório
                      setShowFormulario(false);
                      setShowFeriasSolicitadas(true);
                    } else {
                      // Se for nova solicitação, volta para a tela inicial
                      setShowFormulario(false);
                    }
                    // Limpar os campos
                    setVender10Dias(false);
                    setPeriodo(null);
                    setPeriodo1De(null);
                    setPeriodo1Ate(null);
                    setPeriodo2De(null);
                    setPeriodo2Ate(null);
                    setNucleo("");
                    setEditandoFerias(null);
                  }}
                  className="px-8 py-2 font-medium text-gray-600 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-600"
                >
                  Voltar
                </button>
                <button
                  className="px-8 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  onClick={() => setShowModal(true)}
                  disabled={Boolean(
                    !nucleo ||
                      !periodo ||
                      !periodo1De ||
                      !periodo1Ate ||
                      (periodo2De && !periodo2Ate) || // Valida segundo período apenas se começou a ser preenchido
                      (periodo2De &&
                        periodo2Ate &&
                        diasEntre(periodo2De, periodo2Ate) !==
                          (ordemInvertida ? periodo[0] : periodo[1]))
                  )}
                >
                  {editandoFerias ? "Confirmar Alteração" : "Confirmar Férias"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
      {/* Modal de Confirmação */}
      {showModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-slate-800">
            <div className="flex flex-col items-center">
              <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                Confirmar Solicitação de Férias
              </h3>
              <div className="p-4 mb-4 space-y-2 w-full bg-gray-50 rounded dark:bg-slate-700">
                <h4 className="mb-3 text-lg font-semibold text-center text-gray-900 dark:text-white">
                  Resumo da solicitação
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Colaborador:</span>{" "}
                  {nomeColaborador}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Núcleo:</span>{" "}
                  {formatarNucleo(nucleo)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Abono:</span>{" "}
                  {vender10Dias ? "Sim" : "Não"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Divisão Selecionada:</span>{" "}
                  {periodo ? `${periodo[0]}/${periodo[1]}` : "30 dias corridos"}
                </p>
                {periodo1De && periodo1Ate && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Período 1:</span>{" "}
                    {formatDate(periodo1De)} até {formatDate(periodo1Ate)}{" "}
                    <span className="text-gray-500 dark:text-gray-400">
                      ({diasEntre(periodo1De, periodo1Ate)} dias)
                    </span>
                  </p>
                )}
                {periodo2De && periodo2Ate && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Período 2:</span>{" "}
                    {formatDate(periodo2De)} até {formatDate(periodo2Ate)}{" "}
                    <span className="text-gray-500 dark:text-gray-400">
                      ({diasEntre(periodo2De, periodo2Ate)} dias)
                    </span>
                  </p>
                )}
              </div>
              <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
                Tem certeza que deseja confirmar esta solicitação de férias?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleConfirmar();
                  }}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-slate-800">
            <div className="flex flex-col items-center">
              <div className="p-3 mb-4 text-green-500 bg-green-100 rounded-full dark:bg-green-900">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center text-gray-900 dark:text-white">
                {editandoFerias
                  ? "Férias Alteradas com Sucesso!"
                  : "Férias Solicitadas com Sucesso!"}
              </h3>
              <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
                {editandoFerias
                  ? "Sua alteração de férias foi registrada e será analisada pelo gestor."
                  : "Sua solicitação de férias foi registrada e será analisada pelo gestor."}
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setEditandoFerias(null);
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
