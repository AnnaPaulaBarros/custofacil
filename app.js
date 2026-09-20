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
    const cost = window.CustoFacilCalculations.materialCost(purchasePrice, purchaseQuantity, usedQuantity);
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
  const total = window.CustoFacilCalculations.laborCost(hourlyRate, Math.floor(totalMinutes / 60), totalMinutes % 60);
  document.querySelector('#labor-total').textContent = money(total);
  return total;
}

function calculateIndirectCosts() {
  let total = 0;
  document.querySelectorAll('#cost-list .cost-row').forEach(row => {
    const monthly = Number(row.querySelector('.monthly-cost')?.value || 0);
    const production = Number(row.querySelector('.monthly-production')?.value || 0);
    const cost = window.CustoFacilCalculations.indirectCost(monthly, production);
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
  const { loss, totalCost, suggestedPrice, profit, markup } = window.CustoFacilCalculations.pricing({ materials, labor, indirect, lossPercent, fees, margin });
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
  const fixedCosts = numberValue('#break-even-fixed');
  const sellingPrice = numberValue('#break-even-price');
  const variableCost = numberValue('#break-even-variable');
  const targetProfit = numberValue('#profit-target');
  const breakEven = window.CustoFacilCalculations.breakEven(fixedCosts, sellingPrice, variableCost);
  const targetSales = window.CustoFacilCalculations.salesForProfit(targetProfit, fixedCosts, sellingPrice, variableCost);
  if (document.querySelector('#break-even-result')) document.querySelector('#break-even-result').textContent = `${Math.ceil(breakEven)} unidades`;
  if (document.querySelector('#profit-target-result')) document.querySelector('#profit-target-result').textContent = `${Math.ceil(targetSales)} unidades`;
}

function calculateFinancialTools() {
  const goalProfit = numberValue('#goal-profit');
  const goalPrice = numberValue('#goal-price');
  const goalVariable = numberValue('#goal-variable');
  const goalFixed = numberValue('#goal-fixed');
  const contribution = goalPrice - goalVariable;
  const goalSales = window.CustoFacilCalculations.salesForProfit(goalProfit, goalFixed, goalPrice, goalVariable);
  if (document.querySelector('#goal-sales-result')) document.querySelector('#goal-sales-result').textContent = `${Math.ceil(goalSales)} unidades`;
  if (document.querySelector('#goal-contribution-result')) document.querySelector('#goal-contribution-result').textContent = money(contribution);
  const months = Number(document.querySelector('#forecast-horizon')?.value || 3);
  const scenario = Number(document.querySelector('#forecast-scenario')?.value || 1);
  const revenue = numberValue('#forecast-revenue') * scenario * months;
  const costs = numberValue('#forecast-costs') * months;
  if (document.querySelector('#forecast-revenue-result')) document.querySelector('#forecast-revenue-result').textContent = money(revenue);
  if (document.querySelector('#forecast-profit-result')) document.querySelector('#forecast-profit-result').textContent = money(revenue - costs);
}

async function getCurrentBusiness() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session?.user) return null;
  const { data } = await supabaseClient.from('businesses').select('id').eq('user_id', sessionData.session.user.id).limit(1).maybeSingle();
  return data;
}

function ensureProductTools() {
  const view = document.querySelector('#products-view');
  if (!view || document.querySelector('#product-tools')) return;
  const toolbar = view.querySelector('.table-toolbar');
  const tools = document.createElement('div');
  tools.id = 'product-tools';
  tools.innerHTML = '<button class="button button-outline small" id="export-products">↓ Exportar CSV</button><button class="button button-outline small" id="import-products">↑ Importar CSV</button><input id="products-file" type="file" accept=".csv,text/csv" hidden>';
  toolbar.appendChild(tools);
}

function renderProducts(products) {
  const body = document.querySelector('#products-view tbody');
  if (!body) return;
  if (!products.length) { body.innerHTML = '<tr><td colspan="7">Nenhum produto salvo ainda.</td></tr>'; return; }
  const dashboardCount = document.querySelector('#dashboard-view .metric-card strong');
  if (dashboardCount) dashboardCount.textContent = products.length;
  body.innerHTML = products.map(product => `<tr data-product-id="${product.id}"><td><strong>${product.name}</strong><small>${product.category || 'Sem categoria'} · ${product.unit}</small></td><td>${money(product.pricing?.total_cost)}</td><td><strong>${money(product.pricing?.suggested_price)}</strong></td><td><span class="margin-pill ${Number(product.pricing?.desired_margin || 0) >= 30 ? 'good' : 'warning'}">${Number(product.pricing?.desired_margin || 0).toFixed(1).replace('.', ',')}%</span></td><td class="green">${money(product.pricing?.estimated_profit)}</td><td>${new Date(product.created_at).toLocaleDateString('pt-BR')}</td><td class="product-actions"><button data-product-action="edit">Editar</button><button data-product-action="duplicate">Duplicar</button><button data-product-action="delete">Excluir</button></td></tr>`).join('');
}

async function loadProducts() {
  ensureProductTools();
  const business = await getCurrentBusiness();
  if (!business) return;
  const { data } = await supabaseClient.from('products').select('id,name,category,unit,created_at,pricing(total_cost,suggested_price,estimated_profit,desired_margin)').eq('business_id', business.id).order('created_at', { ascending: false });
  renderProducts((data || []).map(product => ({ ...product, pricing: Array.isArray(product.pricing) ? product.pricing[0] : product.pricing })));
}

function exportProductsCsv() {
  const rows = [...document.querySelectorAll('#products-view tbody tr[data-product-id]')].map(row => [...row.querySelectorAll('td')].slice(0, 6).map(cell => `"${cell.textContent.replaceAll('"', '""').trim()}"`));
  const csv = ['Produto,Custo,Preco,Margem,Lucro,Atualizado', ...rows.map(row => row.join(','))].join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = 'custofacil-produtos.csv'; link.click(); URL.revokeObjectURL(link.href);
}

async function importProductsCsv(file) {
  const business = await getCurrentBusiness();
  if (!business) { openAuth(); return; }
  const lines = (await file.text()).split(/\r?\n/).slice(1).filter(Boolean);
  const products = lines.map(line => line.split(',')[0].replace(/^"|"$/g, '').trim()).filter(Boolean).map(name => ({ business_id: business.id, name, unit: 'unidade', production_quantity: 1 }));
  if (products.length) await supabaseClient.from('products').insert(products);
  loadProducts();
}

async function handleProductAction(event) {
  const button = event.target.closest('[data-product-action]');
  const row = button?.closest('tr');
  if (!button || !row) return;
  const id = row.dataset.productId;
  if (button.dataset.productAction === 'delete') { if (confirm('Excluir este produto?')) await supabaseClient.from('products').delete().eq('id', id); }
  if (button.dataset.productAction === 'duplicate') { const { data } = await supabaseClient.from('products').select('business_id,name,category,unit,production_quantity').eq('id', id).single(); if (data) await supabaseClient.from('products').insert({ ...data, name: `${data.name} (cópia)` }); }
  if (button.dataset.productAction === 'edit') { const name = prompt('Novo nome do produto:', row.querySelector('strong')?.textContent); if (name?.trim()) await supabaseClient.from('products').update({ name: name.trim() }).eq('id', id); }
  loadProducts();
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
  const names = { landing: 'Início', dashboard: 'Dashboard', pricing: 'Nova precificação', products: 'Produtos', materials: 'Materiais', labor: 'Mão de obra', costs: 'Custos indiretos', analysis: 'Análises', simulator: 'Simulador', cashflow: 'Fluxo de caixa', goals: 'Metas', forecasts: 'Previsões', suppliers: 'Fornecedores', inventory: 'Estoque', reports: 'Relatórios', settings: 'Configurações' };
  document.querySelector('#breadcrumb-current').textContent = names[view] || 'Dashboard';
  document.querySelector('.sidebar')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'products') loadProducts();
}

let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.authMode === mode));
  document.querySelector('.auth-name-field').hidden = mode !== 'signup';
  document.querySelector('#auth-password').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  document.querySelector('#auth-title').textContent = mode === 'signup' ? 'Comece a guardar seus preços.' : 'Guarde suas precificações.';
  document.querySelector('#auth-submit').textContent = mode === 'signup' ? 'Criar conta gratuita' : 'Entrar na conta';
  document.querySelector('#reset-password-field').hidden = mode !== 'reset';
  document.querySelector('.terms-consent').hidden = mode !== 'signup';
  if (mode === 'reset') document.querySelector('#auth-submit').textContent = 'Atualizar senha';
  document.querySelector('#forgot-password').hidden = mode !== 'login';
  document.querySelector('#auth-message').textContent = '';
}

function openAuth() {
  document.querySelector('#auth-overlay').hidden = false;
  document.querySelector('#auth-email').focus();
}

async function requestPasswordReset() {
  const email = document.querySelector('#auth-email').value.trim();
  const message = document.querySelector('#auth-message');
  if (!email) { message.textContent = 'Informe seu e-mail para receber o link de recuperação.'; return; }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${window.location.pathname}?reset=1` });
  if (error) { message.textContent = error.message; return; }
  message.style.color = '#6d9634';
  message.textContent = 'Enviamos um link de recuperação para seu e-mail.';
}

async function updatePassword() {
  const password = document.querySelector('#reset-password').value;
  const message = document.querySelector('#auth-message');
  if (password.length < 6) { message.textContent = 'A nova senha precisa ter pelo menos 6 caracteres.'; return; }
  const { error } = await supabaseClient.auth.updateUser({ password });
  if (error) { message.textContent = error.message; return; }
  message.style.color = '#6d9634';
  message.textContent = 'Senha atualizada. Você já pode entrar novamente.';
  setAuthMode('login');
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
  if (authMode === 'reset') { await updatePassword(); return; }
  if (authMode === 'signup' && !document.querySelector('#terms-consent').checked) { message.textContent = 'Você precisa aceitar os Termos e Condições para criar a conta.'; return; }
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
  loadProducts();
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
  loadProducts();
  if (new URLSearchParams(window.location.search).get('reset') === '1') { openAuth(); setAuthMode('reset'); }
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

async function savePricing() {
  const message = document.querySelector('#toast');
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) { message.textContent = 'Entre na sua conta para salvar a precificação.'; message.classList.add('show'); setTimeout(() => message.classList.remove('show'), 3000); openAuth(); return; }
  const { data: business, error: businessError } = await supabaseClient.from('businesses').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (businessError || !business) { message.textContent = 'Configure seu negócio antes de salvar.'; message.classList.add('show'); setTimeout(() => message.classList.remove('show'), 3000); return; }
  const result = calculatePricing();
  const productPayload = { business_id: business.id, name: document.querySelector('#product-name').value.trim() || 'Produto sem nome', category: document.querySelector('#product-category').value, unit: document.querySelector('#pricing-view select').value, production_quantity: numberValue('#production-quantity') || 1 };
  const { data: product, error: productError } = await supabaseClient.from('products').insert(productPayload).select().single();
  if (productError) { message.textContent = 'Não foi possível salvar o produto. Verifique o schema do Supabase.'; message.classList.add('show'); setTimeout(() => message.classList.remove('show'), 3500); return; }
  const materials = [...document.querySelectorAll('#materials-body tr')].map(row => ({ business_id: business.id, name: row.querySelector('.material-name').value.trim() || 'Material', unit: 'unidade', purchase_quantity: Number(row.querySelector('.material-purchase-qty').value) || 1, purchase_price: Number(row.querySelector('.material-price').value) || 0, used: Number(row.querySelector('.material-used-qty').value) || 0 }));
  const { data: materialRows, error: materialError } = await supabaseClient.from('materials').insert(materials.map(({ used, ...material }) => material)).select();
  if (materialError) { message.textContent = 'Produto salvo, mas houve erro nos materiais.'; message.classList.add('show'); setTimeout(() => message.classList.remove('show'), 3500); return; }
  await supabaseClient.from('product_materials').insert(materialRows.map((material, index) => ({ product_id: product.id, material_id: material.id, quantity_used: materials[index].used })));
  const labor = [...document.querySelectorAll('#labor-list .labor-row')].map(row => ({ product_id: product.id, description: row.querySelector('input').value, hourly_rate: numberValue('#hourly-rate'), hours: Number(row.querySelector('.labor-hours').value) || 0, minutes: Number(row.querySelector('.labor-minutes').value) || 0 }));
  if (labor.length) await supabaseClient.from('labor').insert(labor);
  const indirect = [...document.querySelectorAll('#cost-list .cost-row')].map(row => ({ business_id: business.id, name: row.querySelector('input').value, monthly_value: Number(row.querySelector('.monthly-cost').value) || 0, monthly_production: Number(row.querySelector('.monthly-production').value) || 1 }));
  if (indirect.length) await supabaseClient.from('indirect_costs').insert(indirect);
  await supabaseClient.from('pricing').insert({ product_id: product.id, desired_margin: numberValue('#desired-margin'), loss_percentage: numberValue('#loss-percent'), markup: result.markup, total_cost: result.totalCost, suggested_price: result.suggestedPrice, estimated_profit: result.profit });
  await supabaseClient.from('price_history').insert({ product_id: product.id, total_cost: result.totalCost, suggested_price: result.suggestedPrice, desired_margin: numberValue('#desired-margin'), estimated_profit: result.profit });
  message.textContent = 'Precificação salva com sucesso.'; message.classList.add('show'); setTimeout(() => message.classList.remove('show'), 3000);
  loadProducts();
}

document.addEventListener('input', event => {
  if (event.target.closest('#pricing-view')) calculatePricing();
  if (event.target.closest('#simulator-view')) calculateSimulator();
  if (event.target.closest('#goals-view') || event.target.closest('#forecasts-view')) calculateFinancialTools();
});
document.addEventListener('click', event => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) { event.preventDefault(); showView(viewTrigger.dataset.view); }
  if (event.target.closest('#add-material')) addMaterial();
  if (event.target.closest('#add-labor')) addLabor();
  if (event.target.closest('#add-cost')) addCost();
  if (event.target.closest('.delete-row')) { event.target.closest('tr, .labor-row, .cost-row').remove(); calculatePricing(); }
  if (event.target.closest('#save-product')) savePricing();
  if (event.target.closest('#export-pdf')) { calculatePricing(); window.print(); }
  if (event.target.closest('#open-auth')) openAuth();
  if (event.target.closest('#close-auth') || event.target.id === 'auth-overlay') closeAuth();
  if (event.target.closest('#open-help')) openHelp();
  if (event.target.closest('#close-help') || event.target.closest('#close-help-action') || event.target.id === 'help-overlay') closeHelp();
  if (event.target.closest('.auth-tab')) setAuthMode(event.target.closest('.auth-tab').dataset.authMode);
  if (event.target.closest('#forgot-password')) requestPasswordReset();
  if (event.target.closest('#sign-out')) supabaseClient?.auth.signOut().then(() => window.location.reload());
  if (event.target.closest('#save-settings')) saveBusinessSettings();
  if (event.target.closest('#export-products')) exportProductsCsv();
  if (event.target.closest('#import-products')) document.querySelector('#products-file').click();
  if (event.target.closest('[data-product-action]')) handleProductAction(event);
  if (event.target.closest('.mobile-menu')) document.querySelector('.sidebar').classList.toggle('open');
  if (event.target.closest('#currency-toggle')) { state.currency = state.currency === '€' ? 'R$' : '€'; state.currencyCode = state.currency === '€' ? 'EUR' : 'BRL'; event.target.closest('#currency-toggle').innerHTML = `${state.currency} ${state.currencyCode} <span>⌄</span>`; syncCurrencyLabels(); calculatePricing(); }
});

document.addEventListener('change', event => { if (event.target.id === 'products-file' && event.target.files[0]) importProductsCsv(event.target.files[0]); });

syncCurrencyLabels();
calculatePricing();
calculateSimulator();
calculateFinancialTools();
document.querySelector('#auth-form').addEventListener('submit', submitAuth);
restoreAuth();