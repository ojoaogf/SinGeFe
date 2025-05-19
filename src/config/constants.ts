export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  TOKEN_KEY: "auth_token",
  USER_KEY: "user_data",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
};

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Este campo é obrigatório",
  INVALID_CPF: "CPF inválido",
  INVALID_PASSWORD:
    "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial",
  PASSWORD_MISMATCH: "As senhas não coincidem",
  INVALID_EMAIL: "E-mail inválido",
  MIN_LENGTH: (field: string, length: number) =>
    `${field} deve ter no mínimo ${length} caracteres`,
  MAX_LENGTH: (field: string, length: number) =>
    `${field} deve ter no máximo ${length} caracteres`,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
  },
  FERIAS: {
    SOLICITAR: "/ferias/solicitar",
    LISTAR: "/ferias/listar",
    APROVAR: "/ferias/aprovar",
  },
};
