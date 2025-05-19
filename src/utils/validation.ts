import { AUTH_CONFIG, VALIDATION_MESSAGES } from "@/config/constants";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validators = {
  required: (value: any, fieldName: string): void => {
    if (!value || (typeof value === "string" && !value.trim())) {
      throw new ValidationError(`${fieldName} é obrigatório`);
    }
  },

  cpf: (value: string): void => {
    if (!value) return;

    // Remove caracteres não numéricos
    const cpf = value.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      throw new ValidationError(VALIDATION_MESSAGES.INVALID_CPF);
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      throw new ValidationError(VALIDATION_MESSAGES.INVALID_CPF);
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rest = 11 - (sum % 11);
    let digit = rest > 9 ? 0 : rest;
    if (digit !== parseInt(cpf.charAt(9))) {
      throw new ValidationError(VALIDATION_MESSAGES.INVALID_CPF);
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rest = 11 - (sum % 11);
    digit = rest > 9 ? 0 : rest;
    if (digit !== parseInt(cpf.charAt(10))) {
      throw new ValidationError(VALIDATION_MESSAGES.INVALID_CPF);
    }
  },

  password: (value: string): void => {
    if (!value) return;

    if (!AUTH_CONFIG.PASSWORD_REGEX.test(value)) {
      throw new ValidationError(VALIDATION_MESSAGES.INVALID_PASSWORD);
    }
  },

  minLength: (value: string, length: number, fieldName: string): void => {
    if (!value) return;

    if (value.length < length) {
      throw new ValidationError(
        VALIDATION_MESSAGES.MIN_LENGTH(fieldName, length)
      );
    }
  },

  maxLength: (value: string, length: number, fieldName: string): void => {
    if (!value) return;

    if (value.length > length) {
      throw new ValidationError(
        VALIDATION_MESSAGES.MAX_LENGTH(fieldName, length)
      );
    }
  },

  email: (value: string): void => {
    if (!value) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(VALIDATION_MESSAGES.INVALID_EMAIL);
    }
  },

  date: (value: string): void => {
    if (!value) return;

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError("Data inválida");
    }
  },

  dateRange: (startDate: string, endDate: string): void => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("Data inválida");
    }

    if (start > end) {
      throw new ValidationError(
        "A data inicial deve ser anterior à data final"
      );
    }
  },
};

export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, Function[]>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    try {
      rules[field].forEach((validator) => {
        validator(values[field], field);
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        errors[field] = error.message;
      }
    }
  });

  return errors;
};
