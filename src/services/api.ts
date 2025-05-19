import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { AUTH_CONFIG, API_ENDPOINTS } from "@/config/constants";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: AUTH_CONFIG.API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.USER_KEY);
          window.location.href = "/login";
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // O servidor respondeu com um status de erro
      const message = error.response.data?.message || "Erro na requisição";
      return new Error(message);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      return new Error("Sem resposta do servidor");
    } else {
      // Erro na configuração da requisição
      return new Error("Erro na configuração da requisição");
    }
  }

  // Métodos de autenticação
  async login(cpf: string, senha: string) {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, {
        cpf,
        senha,
      });
      const { token, user } = response.data;

      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async register(userData: { cpf: string; nome: string; senha: string }) {
    try {
      const response = await this.api.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async logout() {
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }
  }

  // Métodos de usuário
  async getProfile() {
    try {
      const response = await this.api.get(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async updateProfile(userData: any) {
    try {
      const response = await this.api.put(API_ENDPOINTS.USER.UPDATE, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Métodos de férias
  async solicitarFerias(feriasData: any) {
    try {
      const response = await this.api.post(
        API_ENDPOINTS.FERIAS.SOLICITAR,
        feriasData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async listarFerias() {
    try {
      const response = await this.api.get(API_ENDPOINTS.FERIAS.LISTAR);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async aprovarFerias(solicitacaoId: number, aprovado: boolean) {
    try {
      const response = await this.api.post(API_ENDPOINTS.FERIAS.APROVAR, {
        solicitacaoId,
        aprovado,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

export const apiService = new ApiService();
