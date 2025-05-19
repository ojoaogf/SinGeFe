export interface Periodo {
  de: string | Date | null;
  ate: string | Date | null;
}

export interface SolicitacaoFerias {
  id?: number;
  nomeColaborador: string;
  nucleo: string;
  abono: boolean;
  periodo1?: Periodo;
  periodo2?: Periodo;
  dataEnvio: string | Date;
  aprovado: boolean;
}