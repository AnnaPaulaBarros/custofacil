const SUPABASE_URL = 'https://plalvoiclgcmsicxolbg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWx2b2ljbGdjbXNpY3hvbGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4OTA0OTUsImV4cCI6MjEwNTQ2NjQ5NX0.BOGjhYd1AX0wqeN6BlDLBeIiQkUkz-wzLtBnmrhe1lY';
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const state = { currency: '€', currencyCode: 'EUR', supabaseConnected: Boolean(supabaseClient) };

const money = value => `${state.currency} ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const numberValue = selector => Number(document.querySelector(selector)?.value || 0);
const syncCurrencyLabels = () => document.querySelectorAll('.input-money span').forEach(label => { label.textContent = state.currency; });

function calculateMaterials() {
  let total = 0;
  document.querySelectorAll('#materials-body tr').forEach(row => {
    const purchaseQuantity = Number(row.querySelector('.material-purchase-qty')?.value || 0);
    const purchasePrice = Number(row.querySelector('.material-price')?.value || 0);
    const usedQuantity = Number(row.querySelector('.material-used-qty')?.value || 0);
    const cost = purchaseQuantity ? purchasePrice / purchaseQuantity * usedQuantity : 0;
    total += cost;
    row.querySelector('.material-total').textContent = money(cost);
  });
  document.querySelector('#materials-total').textContent = money(total);
  return total;
}

function calculateLabor() {
  const hourlyRate = numberValue('#hourly-rate');
  let totalMinutes = 0;
  document.querySelectorAll('#labor-list .labor-row').forEach(row => {
    totalMinutes += Number(row.querySelector('.labor-hours')?.value || 0) * 60;
    totalMinutes += Number(row.querySelector('.labor-minutes')?.value || 0);
  });
  const total = hourlyRate * totalMinutes / 60;
  document.querySelector('#labor-total').textContent = money(total);
  return total;
}

function calculateIndirectCosts() {
  let total = 0;
  document.querySelectorAll('#cost-list .cost-row').forEach(row => {
    const monthly = Number(row.querySelector('.monthly-cost')?.value || 0);
    const production = Number(row.querySelector('.monthly-production')?.value || 0);
    const cost = production ? monthly / production : 0;
    total += cost;
    row.querySelector('.indirect-total').textContent = money(cost);
  });
  document.querySelector('#indirect-total').textContent = money(total);
  return total;
}

function calculatePricing() {
  const materials = calculateMaterials();
  const labor = calculateLabor();
  const indirect = calculateIndirectCosts();
  const lossPercent = numberValue('#loss-percent') / 100;
  const fees = numberValue('#selling-fees') / 100;
  const margin = numberValue('#desired-margin') / 100;
  const loss = (materials + labor + indirect) * lossPercent;
  const totalCost = materials + labor + indirect + loss;
  const divisor = Math.max(0.01, 1 - margin - fees);
  const suggestedPrice = totalCost / divisor;
  const profit = suggestedPrice * (1 - fees) - totalCost;
  const markup = suggestedPrice / (totalCost || 1);
  document.querySelector('#suggested-price').textContent = money(suggestedPrice);
  document.querySelector('#total-cost').textContent = money(totalCost);
  document.querySelector('#estimated-profit').textContent = money(profit);
  document.querySelector('#result-margin').textContent = `${(profit / suggestedPrice * 100 || 0).toFixed(1).replace('.', ',')}%`;
  document.querySelector('#result-markup').textContent = `${markup.toFixed(2).replace('.', ',')}x`;
  document.querySelector('#donut-total').textContent = money(totalCost);
  document.querySelector('.breakdown-card .panel-heading>span').textContent = money(totalCost);
  const components = [materials, labor, indirect, loss];
  ['materials', 'labor', 'indirect', 'loss'].forEach((name, index) => {
    document.querySelector(`#legend-${name}`).textContent = `${(components[index] / (totalCost || 1) * 100).toFixed(0)}%`;
  });
  const materialShare = materials / (totalCost || 1) * 100;
  const laborShare = (materials + labor) / (totalCost || 1) * 100;
  const indirectShare = (materials + labor + indirect) / (totalCost || 1) * 100;
  document.querySelector('.donut').style.background = `conic-gradient(#82a948 0 ${materialShare}%,#76b7bc ${materialShare}% ${laborShare}%,#efc85e ${laborShare}% ${indirectShare}%,#ed967f ${indirectShare}% 100%)`;
  return { totalCost, suggestedPrice, profit };
}

function calculateSimulator() {
  const currentCost = numberValue('#simulator-cost');
  const change = numberValue('#simulator-change') / 100;
  const margin = numberValue('#simulator-margin') / 100;
  const newCost = currentCost * (1 + change);
  const newPrice = newCost / Math.max(0.01, 1 - margin - numberValue('#selling-fees') / 100);
  const currentPrice = currentCost / Math.max(0.01, 1 - margin - numberValue('#selling-fees') / 100);
  document.querySelector('#simulator-new-cost').textContent = money(newCost);
  document.querySelector('#simulator-price').textContent = money(newPrice);
  document.querySelector('#simulator-difference').textContent = `+${money(newPrice - currentPrice)}`;
}

function addMaterial() {
  const row = document.createElement('tr');
  row.innerHTML = `<td><input class="material-name" value="Novo material"></td><td><input class="material-purchase-qty" type="number" value="1"></td><td><div class="input-money"><span>${state.currency}</span><input class="material-price" type="number" value="0" step="0.01"></div></td><td><input class="material-used-qty" type="number" value="1" step="0.1"></td><td class="calculated material-total">${money(0)}</td><td><button class="delete-row" aria-label="Excluir material">×</button></td>`;
  document.querySelector('#materials-body').appendChild(row);
  calculatePricing();
}

function addLabor() {
  const row = document.createElement('div');
  row.className = 'labor-row';
  row.innerHTML = '<input value="Nova etapa"><input type="number" class="labor-hours" value="0"><span>h</span><input type="number" class="labor-minutes" value="0"><span>min</span><button class="delete-row">×</button>';
  document.querySelector('#labor-list').appendChild(row);
  calculatePricing();
}

function addCost() {
  const row = document.createElement('div');
  row.className = 'cost-row';
  row.innerHTML = '<input value="Novo custo"><div class="input-money"><span>€</span><input class="monthly-cost" type="number" value="0" step="0.01"><small>/ mês</small></div><input class="monthly-production" type="number" value="1"><span>produtos/mês</span><strong class="indirect-total">€ 0,00</strong><button class="delete-row">×</button>';
  document.querySelector('#cost-list').appendChild(row);
  calculatePricing();
}

function showView(view) {
  document.querySelectorAll('.view').forEach(section => section.classList.remove('active-view'));
  document.querySelector(`#${view}-view`)?.classList.add('active-view');
  document.querySelectorAll('.nav-item[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  const names = { landing: 'Início', dashboard: 'Dashboard', pricing: 'Nova precificação', products: 'Produtos', materials: 'Materiais', labor: 'Mão de obra', costs: 'Custos indiretos', analysis: 'Análises', simulator: 'Simulador', settings: 'Configurações' };
  document.querySelector('#breadcrumb-current').textContent = names[view] || 'Dashboard';
  document.querySelector('.sidebar')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.authMode === mode));
  document.querySelector('.auth-name-field').hidden = mode !== 'signup';
  document.querySelector('#auth-password').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  document.querySelector('#auth-title').textContent = mode === 'signup' ? 'Comece a guardar seus preços.' : 'Guarde suas precificações.';
  document.querySelector('#auth-submit').textContent = mode === 'signup' ? 'Criar conta gratuita' : 'Entrar na conta';
  document.querySelector('#auth-message').textContent = '';
}

function openAuth() {
  document.querySelector('#auth-overlay').hidden = false;
  document.querySelector('#auth-email').focus();
}

function closeAuth() { document.querySelector('#auth-overlay').hidden = true; }
function openHelp() { document.querySelector('#help-overlay').hidden = false; }
function closeHelp() { document.querySelector('#help-overlay').hidden = true; }

async function submitAuth(event) {
  event.preventDefault();
  const message = document.querySelector('#auth-message');
  const email = document.querySelector('#auth-email').value.trim();
  const password = document.querySelector('#auth-password').value;
  const name = document.querySelector('#auth-name').value.trim();
  if (!supabaseClient) { message.textContent = 'Não foi possível conectar ao Supabase.'; return; }
  const submit = document.querySelector('#auth-submit');
  submit.disabled = true;
  submit.textContent = 'Aguarde...';
  const response = authMode === 'signup'
    ? await supabaseClient.auth.signUp({ email, password, options: { data: { name } } })
    : await supabaseClient.auth.signInWithPassword({ email, password });
  submit.disabled = false;
  submit.textContent = authMode === 'signup' ? 'Criar conta gratuita' : 'Entrar na conta';
  if (response.error) {
    const errorText = response.error.message.toLowerCase();
    if (errorText.includes('security') || errorText.includes('rate limit') || errorText.includes('too many')) {
      message.textContent = 'Por segurança, aguarde alguns segundos antes de tentar novamente. Depois, confira o e-mail e a senha.';
    } else if (errorText.includes('invalid login')) {
      message.textContent = 'E-mail ou senha incorretos.';
    } else {
      message.textContent = response.error.message;
    }
    return;
  }
  if (authMode === 'signup' && !response.data.session) { message.style.color = '#6d9634'; message.textContent = 'Conta criada. Verifique seu e-mail para confirmar o acesso.'; return; }
  updateProfile(response.data.user);
  closeAuth();
}

function updateProfile(user) {
  if (!user) return;
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Minha conta';
  const initials = name.trim().slice(0, 2).toUpperCase();
  document.querySelector('#business-avatar').textContent = initials;
  document.querySelector('#business-name').textContent = name;
  document.querySelector('#greeting-name').textContent = name.split(' ')[0];
  document.querySelector('#profile-area').innerHTML = `<div class="avatar coral">${initials}</div><div><strong>${name}</strong><small>${user.email}</small></div><button class="profile-login" id="sign-out">Sair</button>`;
}

async function restoreAuth() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  updateProfile(data.session?.user);
  if (data.session?.user) loadBusinessSettings(data.session.user.id);
}

async function loadBusinessSettings(userId) {
  const { data } = await supabaseClient.from('businesses').select('name, segment, currency').eq('user_id', userId).limit(1).maybeSingle();
  if (!data) return;
  document.querySelector('#settings-business').value = data.name || '';
  document.querySelector('#settings-segment').value = data.segment || 'Plantas e jardinagem';
  document.querySelector('#settings-currency').value = data.currency || 'EUR';
  state.currency = data.currency === 'BRL' ? 'R$' : '€';
  state.currencyCode = data.currency || 'EUR';
  document.querySelector('#currency-toggle').innerHTML = `${state.currency} ${state.currencyCode} <span>⌄</span>`;
  syncCurrencyLabels();
  calculatePricing();
}

async function saveBusinessSettings() {
  const message = document.querySelector('#settings-message');
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) { message.textContent = 'Entre na sua conta para salvar as configurações.'; return; }
  const name = document.querySelector('#settings-business').value.trim();
  const segment = document.querySelector('#settings-segment').value;
  const currency = document.querySelector('#settings-currency').value;
  if (!name) { message.textContent = 'Informe o nome do negócio.'; return; }
  const { data: business } = await supabaseClient.from('businesses').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  const result = business
    ? await supabaseClient.from('businesses').update({ name, segment, currency }).eq('id', business.id)
    : await supabaseClient.from('businesses').insert({ user_id: user.id, name, segment, currency });
  if (result.error) { message.textContent = 'Não foi possível salvar agora. Verifique sua conexão e tente novamente.'; return; }
  state.currency = currency === 'BRL' ? 'R$' : '€';
  state.currencyCode = currency;
  document.querySelector('#currency-toggle').innerHTML = `${state.currency} ${state.currencyCode} <span>⌄</span>`;
  syncCurrencyLabels();
  calculatePricing();
  document.querySelector('#business-name').textContent = name;
  message.style.color = '#6d9634';
  message.textContent = 'Configurações salvas com sucesso.';
}

document.addEventListener('input', event => {
  if (event.target.closest('#pricing-view')) calculatePricing();
  if (event.target.closest('#simulator-view')) calculateSimulator();
});
document.addEventListener('click', event => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) { event.preventDefault(); showView(viewTrigger.dataset.view); }
  if (event.target.closest('#add-material')) addMaterial();
  if (event.target.closest('#add-labor')) addLabor();
  if (event.target.closest('#add-cost')) addCost();
  if (event.target.closest('.delete-row')) { event.target.closest('tr, .labor-row, .cost-row').remove(); calculatePricing(); }
  if (event.target.closest('#save-product')) { document.querySelector('#toast').classList.add('show'); setTimeout(() => document.querySelector('#toast').classList.remove('show'), 2700); }
  if (event.target.closest('#export-pdf')) { calculatePricing(); window.print(); }
  if (event.target.closest('#open-auth')) openAuth();
  if (event.target.closest('#close-auth') || event.target.id === 'auth-overlay') closeAuth();
  if (event.target.closest('#open-help')) openHelp();
  if (event.target.closest('#close-help') || event.target.closest('#close-help-action') || event.target.id === 'help-overlay') closeHelp();
  if (event.target.closest('.auth-tab')) setAuthMode(event.target.closest('.auth-tab').dataset.authMode);
  if (event.target.closest('#sign-out')) supabaseClient?.auth.signOut().then(() => window.location.reload());
  if (event.target.closest('#save-settings')) saveBusinessSettings();
  if (event.target.closest('.mobile-menu')) document.querySelector('.sidebar').classList.toggle('open');
  if (event.target.closest('#currency-toggle')) { state.currency = state.currency === '€' ? 'R$' : '€'; state.currencyCode = state.currency === '€' ? 'EUR' : 'BRL'; event.target.closest('#currency-toggle').innerHTML = `${state.currency} ${state.currencyCode} <span>⌄</span>`; syncCurrencyLabels(); calculatePricing(); }
});

syncCurrencyLabels();
calculatePricing();
calculateSimulator();
document.querySelector('#auth-form').addEventListener('submit', submitAuth);
restoreAuth();