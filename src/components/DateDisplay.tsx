import React from "react";

interface DateDisplayProps {
  cpf: string;
  selectedDate: Date | null;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ cpf, selectedDate }) => {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold">
        Data selecionada para o CPF: {cpf}
      </h2>
      <p className="mt-2">
        {selectedDate
          ? selectedDate.toLocaleDateString("pt-BR")
          : "Nenhuma data selecionada"}
      </p>
    </div>
  );
};

export default DateDisplay;
