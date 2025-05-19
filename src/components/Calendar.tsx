import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);

interface CalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  minDate?: Date;
  excludeDates?: Date[];
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  excludeDates,
  disabled = false,
}) => {
  return (
    <div className="mt-4">
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        minDate={minDate}
        excludeDates={excludeDates}
        disabled={disabled}
        className="p-2 text-gray-900 bg-white border border-gray-300 rounded dark:bg-slate-700 dark:text-white dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        calendarClassName="dark:bg-slate-600 dark:text-white"
        locale="pt-BR"
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/aaaa"
      />
    </div>
  );
};

export default Calendar;
