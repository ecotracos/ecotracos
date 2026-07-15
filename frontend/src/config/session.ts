// Configurações de tempo de sessão e segurança para o Painel Administrativo

export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MINUTES: 5,

  get INACTIVITY_TIMEOUT_MS() {
    return this.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
  }
};
