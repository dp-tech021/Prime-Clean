import './styles.css';
import { makeSupabaseClient } from './lib/supabase-client.js';
import { createAuthService, AuthError } from './lib/auth-service.js';

const views = Object.fromEntries(['loading', 'config', 'login', 'dashboard'].map((name) => [name, document.querySelector(`#${name}-view`)]));
const show = (name) => Object.entries(views).forEach(([key, view]) => { view.hidden = key !== name; });
const status = document.querySelector('#login-status');
const loginButton = document.querySelector('#login-button');

function showDashboard(session) {
  document.querySelector('#session-user').textContent = session.user.email || 'Administrador autorizado';
  show('dashboard');
  document.querySelector('#inicio').focus({ preventScroll: true });
}

let auth;
try {
  auth = createAuthService(makeSupabaseClient(import.meta.env));
} catch (error) {
  document.querySelector('#config-message').textContent = error.message;
  show('config');
}

if (auth) {
  auth.restore().then((session) => session ? showDashboard(session) : show('login')).catch((error) => {
    status.textContent = error.message;
    show('login');
  });

  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    loginButton.disabled = true;
    loginButton.textContent = 'Verificando…';
    try {
      const data = new FormData(event.currentTarget);
      showDashboard(await auth.login(String(data.get('email')).trim(), String(data.get('password'))));
      event.currentTarget.reset();
    } catch (error) {
      status.textContent = error instanceof AuthError ? error.message : 'Falha inesperada ao entrar.';
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Entrar com segurança';
    }
  });

  document.querySelector('#logout-button').addEventListener('click', async () => {
    const output = document.querySelector('#dashboard-status');
    output.textContent = 'Encerrando sessão…';
    try { await auth.logout(); show('login'); status.textContent = 'Sessão encerrada.'; }
    catch (error) { output.textContent = error.message; }
  });
}
