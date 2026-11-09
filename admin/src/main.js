import './styles.css';
import { makeSupabaseClient } from './lib/supabase-client.js';
import { createAuthService, AuthError } from './lib/auth-service.js';
import { createMediaService } from './lib/media-service.js';
import { createAdminController } from './lib/admin-controller.js';

const views = Object.fromEntries(['loading', 'config', 'login', 'dashboard'].map((name) => [name, document.querySelector(`#${name}-view`)]));
const show = (name) => Object.entries(views).forEach(([key, view]) => { view.hidden = key !== name; });
const status = document.querySelector('#login-status');
const loginButton = document.querySelector('#login-button');

let controller;

async function showDashboard(session) {
  document.querySelector('#session-user').textContent = session.user.email || 'Administrador autorizado';
  show('dashboard');
  document.querySelector('#inicio').focus({ preventScroll: true });
  try { await controller.refresh(); }
  catch {
    document.querySelector('#dashboard-status').textContent = 'Não foi possível carregar os dados. Verifique sua conexão e atualize a lista.';
  }
}

let auth;
try {
  const client = makeSupabaseClient(import.meta.env);
  auth = createAuthService(client);
  const media = createMediaService(client, () => auth.requireAuthorized());
  controller = createAdminController(media, { onUnauthorized: () => show('login') });
} catch (error) {
  document.querySelector('#config-message').textContent = error.message;
  show('config');
}

if (auth) {
  auth.onSessionLost(() => {
    show('login');
    status.textContent = 'Sua sessão terminou. Entre novamente.';
  });

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
      await showDashboard(await auth.login(String(data.get('email')).trim(), String(data.get('password'))));
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
