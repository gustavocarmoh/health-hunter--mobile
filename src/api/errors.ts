import { AxiosError } from 'axios'

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Timeout
    if (error.code === 'ECONNABORTED') {
      return 'Conexão expirou. Verifique sua internet e tente novamente.'
    }

    // Network error (offline, DNS, etc)
    if (!error.response) {
      return 'Erro de conexão. Verifique sua internet.'
    }

    // Server returned an error
    const status = error.response.status
    const raw = error.response.data?.message || error.response.data?.error
    // class-validator devolve um array de mensagens
    const message = Array.isArray(raw) ? raw.join(' ') : raw

    if (status === 429) {
      return message || 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    }
    if (status === 422) {
      return message || 'Dados inválidos. Verifique os campos.'
    }

    if (status === 400) {
      return message || 'Dados inválidos. Verifique os campos.'
    }
    if (status === 401) {
      return 'Sessão expirada. Faça login novamente.'
    }
    if (status === 403 && error.response.data?.error === 'ConsentRequired') {
      return 'Ative este recurso em Configurações → Privacidade para continuar.'
    }
    if (status === 403) {
      return 'Você não tem permissão para essa ação.'
    }
    if (status === 404) {
      return 'Recurso não encontrado.'
    }
    if (status === 409) {
      return message || 'Conflito de dados. Tente novamente.'
    }
    if (status >= 500) {
      return 'Erro no servidor. Tente novamente em alguns momentos.'
    }

    return message || 'Erro de conexão. Tente novamente.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Erro desconhecido. Tente novamente.'
}
