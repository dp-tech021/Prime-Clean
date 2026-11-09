export class AuthError extends Error {}

export function createAuthService(client) {
  async function authorize(session) {
    if (!session?.user) return null;
    const { data, error } = await client
      .from('admin_users')
      .select('user_id, active')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) {
      await client.auth.signOut();
      throw new AuthError('Não foi possível confirmar a autorização administrativa. Verifique sua conexão e tente novamente.');
    }
    if (!data || data.user_id !== session.user.id || data.active !== true) {
      await client.auth.signOut();
      throw new AuthError('Esta conta não possui permissão administrativa.');
    }
    return session;
  }

  return {
    async restore() {
      const { data, error } = await client.auth.getSession();
      if (error) throw new AuthError('Não foi possível verificar a sessão.');
      return authorize(data.session);
    },
    async login(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw new AuthError('E-mail ou senha inválidos.');
      return authorize(data.session);
    },
    async logout() {
      const { error } = await client.auth.signOut();
      if (error) throw new AuthError('Não foi possível encerrar a sessão. Tente novamente.');
    },
    onSessionLost(callback) {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) callback();
      });
      return () => data.subscription.unsubscribe();
    }
  };
}
