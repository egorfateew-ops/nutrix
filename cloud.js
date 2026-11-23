'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const CONFIG_KEY = 'nutrix-cloud-config';
  let db = null;
  let session = null;
  let activePlanId = null;
  let activePlanOwner = null;
  let loadingPlan = false;
  let configExpanded = false;

  const readConfig = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
      if (saved && saved.url && saved.key) return saved;
    } catch (_) {}
    const defaults = window.NUTRIX_CLOUD_CONFIG || {};
    return defaults.url && defaults.key ? defaults : null;
  };
  const writeConfig = value => { try { localStorage.setItem(CONFIG_KEY, JSON.stringify(value)); } catch (_) {} };
  const toast = message => window.NUTRIX && window.NUTRIX.showToast ? window.NUTRIX.showToast(message) : null;
  const currentUser = () => session && session.user;
  const setMessage = (message, error) => {
    const node = $('cloudMessage');
    if (!node) return;
    node.textContent = message || '';
    node.className = 'cloud-message' + (error ? ' is-error' : '');
  };
  const showDialog = async () => {
    updatePanel();
    if (!$('cloudDialog').open) $('cloudDialog').showModal();
    if (session) {
      await loadProfileFromCloud(true);
      await Promise.all([loadHistory(), loadProgressEntries()]);
    }
  };
  const hideDialog = () => { if ($('cloudDialog').open) $('cloudDialog').close(); };

  function buildPanel() {
    $('cloudContent').innerHTML =
      '<div class="cloud-modal-head"><div><div class="eyebrow">NUTRIX · ЛИЧНЫЙ КАБИНЕТ</div><h2>Твой профиль</h2><p>Рационы, замеры и настройки хранятся отдельно в твоём аккаунте.</p></div><button class="icon-button" id="cloudClose" type="button" aria-label="Закрыть">×</button></div>' +
      '<div id="cloudMessage" class="cloud-message" role="status"></div>' +
      '<section class="cloud-section" id="cloudConfigSection"><div class="cloud-section-head"><div><h3>Подключение базы</h3><p>Supabase Project URL и Publishable key</p></div><span id="cloudConnectionState" class="cloud-state">Не подключено</span></div>' +
      '<div id="cloudConfigForm" class="cloud-config-form"><label>Project URL<input id="cloudProjectUrl" type="url" placeholder="https://xxxx.supabase.co" autocomplete="url"></label><label>Publishable key<input id="cloudPublishableKey" type="password" placeholder="sb_publishable_..." autocomplete="off"></label><button class="cloud-primary" id="cloudSaveConfig" type="button">Подключить базу</button><small>Используй только Publishable key. Secret key и service_role сюда вставлять нельзя.</small></div>' +
      '<div id="cloudConfigSummary" class="cloud-config-summary" hidden><span id="cloudProjectLabel"></span><button class="cloud-link-button" id="cloudChangeConfig" type="button">Изменить подключение</button></div></section>' +
      '<section class="cloud-section" id="cloudAuthSection"><div class="cloud-section-head"><div><h3>Аккаунт</h3><p>Регистрация и вход по электронной почте</p></div></div>' +
      '<div id="cloudAuthForm" class="cloud-auth-form"><label>Имя для отображения<input id="cloudDisplayName" type="text" placeholder="Как тебя называть"></label><label>Электронная почта<input id="cloudEmail" type="email" placeholder="name@example.com" autocomplete="email"></label><label>Пароль<input id="cloudPassword" type="password" placeholder="Не менее 8 символов" autocomplete="current-password"></label><div class="cloud-button-row"><button class="cloud-primary" id="cloudSignIn" type="button">Войти</button><button class="cloud-secondary" id="cloudSignUp" type="button">Создать аккаунт</button></div></div>' +
      '<div id="cloudAccount" class="cloud-account" hidden><div class="cloud-user-line"><div class="cloud-avatar">N</div><div><b id="cloudUserEmail"></b><small id="cloudUserName"></small></div></div><div class="cloud-button-row"><button class="cloud-primary" id="cloudSaveProfile" type="button">Сохранить профиль</button><button class="cloud-secondary" id="cloudLoadProfile" type="button">Загрузить профиль</button></div><button class="cloud-link-button" id="cloudSignOut" type="button">Выйти из аккаунта</button></div></section>' +
      '<section class="cloud-section" id="cloudProgressSection" hidden><div class="cloud-section-head"><div><h3>Мой прогресс</h3><p>Личная история веса и замеров</p></div><button class="cloud-link-button" id="cloudProgressRefresh" type="button">Обновить</button></div>' +
      '<form id="cloudProgressForm" class="cloud-progress-form"><label>Дата замера<input id="progressDate" type="date" required></label><label>Вес, кг<input id="progressWeight" type="number" min="15" max="350" step="0.1" placeholder="Например, 72.5" required></label><label>Рост, см<input id="progressHeight" type="number" min="80" max="250" step="0.1" placeholder="Необязательно"></label><label>Талия, см<input id="progressWaist" type="number" min="30" max="200" step="0.1" placeholder="Необязательно"></label><label class="progress-note-field">Заметка<input id="progressNote" type="text" maxlength="300" placeholder="Самочувствие, тренировки и т. п."></label><button class="cloud-primary progress-submit" type="submit">Добавить замер</button></form>' +
      '<div id="progressSummary" class="progress-summary"></div><div id="progressChart" class="progress-chart"><p>Добавь первый замер, чтобы увидеть историю.</p></div><div id="progressHistory" class="progress-history"></div>' +
      '<p class="cloud-footer-note">Это дневник наблюдений, а не медицинская оценка. Для пользователей младше 18 лет график не задаёт целевой вес и не предлагает снижать его.</p></section>' +
      '<section class="cloud-section" id="cloudPlansSection"><div class="cloud-section-head"><div><h3>Мои рационы</h3><p>Только твоя личная история</p></div><button class="cloud-link-button" id="cloudHistoryRefresh" type="button">Обновить</button></div>' +
      '<div class="cloud-button-row"><button class="cloud-primary" id="cloudSaveCurrentPlan" type="button">Сохранить текущий рацион</button></div><div id="cloudHistory" class="cloud-history"><p>Войди в аккаунт, чтобы увидеть историю.</p></div></section>' +
      '<div class="cloud-footer-note">Каждый аккаунт хранит собственные профиль, рационы, цены и замеры. Другие пользователи их не видят.</div>';

    $('cloudClose').addEventListener('click', hideDialog);
    $('cloudSaveConfig').addEventListener('click', saveConfig);
    $('cloudChangeConfig').addEventListener('click', () => {
      configExpanded = !configExpanded;
      $('cloudConfigForm').hidden = !configExpanded;
    });
    $('cloudSignIn').addEventListener('click', signIn);
    $('cloudSignUp').addEventListener('click', signUp);
    $('cloudSignOut').addEventListener('click', signOut);
    $('cloudSaveProfile').addEventListener('click', saveProfileToCloud);
    $('cloudLoadProfile').addEventListener('click', loadProfileFromCloud);
    $('cloudSaveCurrentPlan').addEventListener('click', () => savePlan(window.NUTRIX && window.NUTRIX.plan, !activePlanId || activePlanOwner !== (currentUser() && currentUser().id)));
    $('cloudHistoryRefresh').addEventListener('click', loadHistory);
    $('cloudProgressRefresh').addEventListener('click', loadProgressEntries);
    $('cloudProgressForm').addEventListener('submit', saveProgressEntry);
    $('progressHistory').addEventListener('click', event => {
      const button = event.target.closest('[data-progress-id]');
      if (button) deleteProgressEntry(button.dataset.progressId);
    });
    $('cloudHistory').addEventListener('click', event => {
      const remove = event.target.closest('[data-delete-plan-id]');
      if (remove) { deletePlan(remove.dataset.deletePlanId); return; }
      const button = event.target.closest('[data-plan-id]');
      if (button) loadPlan(button.dataset.planId);
    });
    $('cloudDialog').addEventListener('click', event => {
      if (event.target === $('cloudDialog')) hideDialog();
    });
  }

  function updatePanel() {
    const configured = !!db;
    const user = currentUser();
    $('cloudConnectionState').textContent = configured ? 'Подключено' : 'Нужно подключить';
    $('cloudConnectionState').classList.toggle('is-online', configured);
    $('cloudConfigForm').hidden = configured && !configExpanded;
    $('cloudConfigSummary').hidden = !configured;
    $('cloudAuthForm').hidden = !configured || !!user;
    $('cloudAccount').hidden = !configured || !user;
    $('cloudPlansSection').hidden = !configured || !user;
    $('cloudProgressSection').hidden = !configured || !user;
    if (configured) {
      const cfg = readConfig();
      $('cloudProjectLabel').textContent = cfg && cfg.url ? new URL(cfg.url).hostname : 'Supabase';
      $('cloudOpen').textContent = user ? '☁ Аккаунт' : '☁ Облако';
    } else {
      $('cloudOpen').textContent = '☁ Облако';
    }
    if (user) {
      $('cloudUserEmail').textContent = user.email || 'Аккаунт NUTRIX';
      $('cloudUserName').textContent = user.user_metadata && user.user_metadata.display_name ? user.user_metadata.display_name : 'Профиль в облаке';
    }
    $('cloudSaveCurrentPlan').disabled = !(window.NUTRIX && window.NUTRIX.plan);
    if (!configured) {
      $('cloudHistory').innerHTML = '<p>Сначала подключи проект Supabase. Пошаговая инструкция находится в BACKEND_SETUP.md.</p>';
    }
  }

  async function initializeClient() {
    const cfg = readConfig();
    if (!cfg || !cfg.url || !cfg.key) {
      db = null;
      session = null;
      updatePanel();
      return;
    }
    if (!window.supabase || !window.supabase.createClient) {
      db = null;
      setMessage('Не загрузилась библиотека Supabase. Проверь интернет и обнови страницу.', true);
      updatePanel();
      return;
    }
    try {
      db = window.supabase.createClient(cfg.url, cfg.key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      db.auth.onAuthStateChange((_event, newSession) => {
        session = newSession;
        updatePanel();
      });
      const result = await db.auth.getSession();
      if (result.error) throw result.error;
      session = result.data.session;
      updatePanel();
    } catch (error) {
      db = null;
      session = null;
      updatePanel();
      setMessage('Не удалось подключиться: ' + (error.message || 'проверь URL и Publishable key'), true);
    }
  }

  async function saveConfig() {
    const url = $('cloudProjectUrl').value.trim().replace(/\/+$/, '');
    const key = $('cloudPublishableKey').value.trim();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) throw new Error('Введи полный Project URL вида https://xxxx.supabase.co');
      if (key.length < 20) throw new Error('Publishable key выглядит слишком коротким.');
      writeConfig({ url, key });
      configExpanded = false;
      await initializeClient();
      if (db) {
        setMessage('База подключена. Теперь можно зарегистрироваться или войти.');
      }
    } catch (error) {
      setMessage(error.message, true);
    }
  }

  async function signIn() {
    if (!db) return;
    const email = $('cloudEmail').value.trim();
    const password = $('cloudPassword').value;
    if (!email || !password) return setMessage('Заполни электронную почту и пароль.', true);
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return setMessage(error.message, true);
    session = data.session;
    updatePanel();
    setMessage('Вход выполнен.');
    await loadProfileFromCloud(true);
    await Promise.all([loadHistory(), loadProgressEntries()]);
  }

  async function signUp() {
    if (!db) return;
    const email = $('cloudEmail').value.trim();
    const password = $('cloudPassword').value;
    const displayName = $('cloudDisplayName').value.trim();
    if (!email || password.length < 8) return setMessage('Укажи почту и пароль длиной не менее 8 символов.', true);
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: location.origin + location.pathname
      }
    });
    if (error) return setMessage(error.message, true);
    if (!data.session) setMessage('Аккаунт создан. Проверь почту и подтверди адрес, затем войди.');
    else {
      session = data.session;
      updatePanel();
      setMessage('Аккаунт создан. Добро пожаловать в NUTRIX.');
      await saveProfileToCloud();
      await Promise.all([loadHistory(), loadProgressEntries()]);
    }
  }

  async function signOut() {
    if (!db) return;
    const { error } = await db.auth.signOut();
    if (error) return setMessage(error.message, true);
    session = null;
    activePlanId = null;
    activePlanOwner = null;
    try {
      localStorage.removeItem('nutrix-profile');
      localStorage.removeItem('nutrix-shopping-checks');
      localStorage.removeItem('nutrix-price-overrides');
    } catch (_) {}
    const form = $('profileForm');
    if (form) form.reset();
    if ($('results')) $('results').classList.add('hidden');
    if (window.NUTRIX && window.NUTRIX.clearPlan) window.NUTRIX.clearPlan();
    updatePanel();
    setMessage('Ты вышел из аккаунта. Личные данные этого аккаунта больше не отображаются.');
  }

  async function saveProfileToCloud() {
    if (!db || !session || !window.NUTRIX) return;
    const profile = window.NUTRIX.getFormData();
    const displayName = $('cloudDisplayName').value.trim() ||
      (session.user.user_metadata && session.user.user_metadata.display_name) || '';
    const { error } = await db.from('profiles').upsert({
      user_id: session.user.id,
      display_name: displayName,
      profile_json: profile,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) return setMessage('Не удалось сохранить профиль: ' + error.message, true);
    setMessage('Профиль сохранён в общей базе.');
    toast('Профиль сохранён в облаке');
  }

  function applyProfile(profile) {
    if (!profile) return;
    const fields = ['age','height','weight','sex','activity','diet','mealCount','budget','store','cookTime','notes','medical'];
    fields.forEach(key => {
      const node = $(key);
      if (!node || profile[key] === undefined) return;
      if (node.type === 'checkbox') node.checked = !!profile[key];
      else node.value = profile[key];
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if ($('progressHeight') && profile.height) $('progressHeight').value = profile.height;
    $('avoid').value = Array.isArray(profile.avoid) ? profile.avoid.join(', ') : (profile.avoid || '');
    $('avoid').dispatchEvent(new Event('input', { bubbles: true }));
    const radio = document.querySelector('input[name="goal"][value="' + (profile.goal || 'maintain') + '"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function loadProfileFromCloud(silent = false) {
    if (!db || !session) return;
    const { data, error } = await db.from('profiles')
      .select('display_name,profile_json')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) return setMessage('Не удалось загрузить профиль: ' + error.message, true);
    if (!data) {
      if (!silent) setMessage('В облаке пока нет сохранённого профиля. Заполни анкету и сохрани её.');
      return;
    }
    applyProfile(data.profile_json);
    if (data.display_name) $('cloudDisplayName').value = data.display_name;
    if (data.profile_json && data.profile_json.height && $('progressHeight')) $('progressHeight').value = data.profile_json.height;
    if (!silent) {
      setMessage('Профиль загружен из облака.');
      toast('Профиль загружен');
    }
  }

  function applyShoppingState(plan, state) {
    if (!plan || !Array.isArray(plan.cart)) return;
    const overrides = state && state.price_overrides ? state.price_overrides : {};
    plan.cart.forEach(item => {
      if (overrides[item.key] !== undefined) {
        item.price = Math.max(0, Number(overrides[item.key]) || 0);
        item.total = item.packCount * item.price;
      }
    });
    plan.cartCost = Math.round(plan.cart.reduce((sum, item) => sum + item.total, 0));
  }

  function restoreShoppingChecks(state) {
    const checked = new Set(state && Array.isArray(state.checked_items) ? state.checked_items : []);
    document.querySelectorAll('#shoppingList input[data-cart-key]').forEach(input => {
      let key = '';
      try { key = decodeURIComponent(input.dataset.cartKey || ''); } catch (_) {}
      input.checked = checked.has(key);
    });
  }

  async function saveShoppingState() {
    if (!db || !session || !activePlanId || !window.NUTRIX || !window.NUTRIX.plan) return;
    const plan = window.NUTRIX.plan;
    const checked = [];
    document.querySelectorAll('#shoppingList input[data-cart-key]:checked').forEach(input => {
      try { checked.push(decodeURIComponent(input.dataset.cartKey || '')); } catch (_) {}
    });
    const overrides = {};
    (plan.cart || []).forEach(item => { overrides[item.key] = Number(item.price) || 0; });
    const { error } = await db.from('shopping_lists').upsert({
      plan_id: activePlanId,
      checked_items: checked,
      price_overrides: overrides,
      updated_at: new Date().toISOString()
    }, { onConflict: 'plan_id' });
    if (error) setMessage('Не удалось синхронизировать список покупок: ' + error.message, true);
  }

  async function savePlan(plan, forceNew) {
    if (!db || !session) {
      setMessage('Чтобы сохранять рационы между устройствами, войди в аккаунт NUTRIX.');
      return;
    }
    if (!plan) return setMessage('Сначала составь рацион.');
    const now = new Date().toISOString();
    const title = 'Рацион · ' + new Date().toLocaleDateString('ru-RU');
    let result;
    if (forceNew || !activePlanId || activePlanOwner !== session.user.id) {
      result = await db.from('meal_plans').insert({
        owner_id: session.user.id,
        title,
        plan_data: plan,
        updated_at: now
      }).select('id').single();
      if (result.error) return setMessage('Не удалось сохранить рацион: ' + result.error.message, true);
      activePlanId = result.data.id;
      activePlanOwner = session.user.id;
    } else {
      result = await db.from('meal_plans').update({
        plan_data: plan,
        updated_at: now
      }).eq('id', activePlanId).eq('owner_id', session.user.id);
      if (result.error) return setMessage('Не удалось обновить рацион: ' + result.error.message, true);
    }
    await saveShoppingState();
    setMessage('Рацион сохранён в облаке.');
    updatePanel();
  }

  async function loadPlan(planId) {
    if (!db || !session) return;
    const { data, error } = await db.from('meal_plans')
      .select('id,owner_id,title,plan_data')
      .eq('id', planId).single();
    if (error) return setMessage('Не удалось открыть рацион: ' + error.message, true);
    const shoppingResult = await db.from('shopping_lists')
      .select('checked_items,price_overrides')
      .eq('plan_id', planId).maybeSingle();
    if (shoppingResult.error) return setMessage('Не удалось загрузить список покупок: ' + shoppingResult.error.message, true);
    activePlanId = data.id;
    activePlanOwner = data.owner_id;
    const plan = data.plan_data;
    applyShoppingState(plan, shoppingResult.data);
    loadingPlan = true;
    applyProfile(plan.data);
    window.NUTRIX.renderPlan(plan, false);
    loadingPlan = false;
    restoreShoppingChecks(shoppingResult.data);
    document.querySelectorAll('#daysGrid .replace-meal').forEach(button => {
      button.hidden = data.owner_id !== session.user.id;
    });
    setMessage('Рацион загружен из облака: ' + data.title);
    hideDialog();
    $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function localDateValue() {
    const date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  async function saveProgressEntry(event) {
    event.preventDefault();
    if (!db || !session) return setMessage('Войди в аккаунт, чтобы сохранять замеры.', true);
    const measuredOn = $('progressDate').value;
    const weight = Number($('progressWeight').value);
    const height = $('progressHeight').value === '' ? null : Number($('progressHeight').value);
    const waist = $('progressWaist').value === '' ? null : Number($('progressWaist').value);
    const note = $('progressNote').value.trim();
    if (!measuredOn || measuredOn > localDateValue()) return setMessage('Укажи сегодняшнюю или прошедшую дату замера.', true);
    if (!Number.isFinite(weight) || weight < 15 || weight > 350) return setMessage('Проверь вес: допустимый диапазон 15–350 кг.', true);
    if (height !== null && (!Number.isFinite(height) || height < 80 || height > 250)) return setMessage('Проверь рост: допустимый диапазон 80–250 см.', true);
    if (waist !== null && (!Number.isFinite(waist) || waist < 30 || waist > 200)) return setMessage('Проверь обхват талии: допустимый диапазон 30–200 см.', true);
    const { error } = await db.from('progress_entries').insert({
      user_id: session.user.id, measured_on: measuredOn, weight_kg: weight,
      height_cm: height, waist_cm: waist, note
    });
    if (error) return setMessage('Не удалось сохранить замер: ' + error.message, true);
    $('progressWeight').value = '';
    $('progressWaist').value = '';
    $('progressNote').value = '';
    $('progressDate').value = localDateValue();
    setMessage('Замер сохранён в твоём личном дневнике.');
    toast('Замер сохранён');
    await loadProgressEntries();
  }

  function renderProgressChart(entries) {
    const host = $('progressChart');
    if (!host) return;
    host.replaceChildren();
    const points = entries.slice().sort((a, b) => a.measured_on.localeCompare(b.measured_on)).slice(-12);
    if (points.length < 2) {
      const empty = document.createElement('p');
      empty.textContent = points.length ? 'Есть один замер. Добавь ещё один в другой день, чтобы увидеть динамику.' : 'Добавь первый замер, чтобы увидеть график.';
      host.appendChild(empty);
      return;
    }
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const width = 640, height = 230, left = 54, right = 18, top = 18, bottom = 42;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'График истории веса');
    const values = points.map(p => Number(p.weight_kg));
    let min = Math.min(...values), max = Math.max(...values);
    if (max - min < 0.5) { min -= 0.5; max += 0.5; } else { min -= 0.25; max += 0.25; }
    const x = i => left + i * (width - left - right) / (points.length - 1);
    const y = value => top + (max - value) * (height - top - bottom) / (max - min);
    for (let i = 0; i <= 4; i++) {
      const value = max - (max - min) * i / 4, yy = y(value);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', left); line.setAttribute('x2', width - right);
      line.setAttribute('y1', yy); line.setAttribute('y2', yy); line.setAttribute('class', 'progress-grid-line');
      svg.appendChild(line);
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', left - 9); label.setAttribute('y', yy + 4);
      label.setAttribute('text-anchor', 'end'); label.setAttribute('class', 'progress-axis-label');
      label.textContent = value.toFixed(1).replace('.', ','); svg.appendChild(label);
    }
    const path = document.createElementNS(ns, 'polyline');
    path.setAttribute('points', points.map((p, i) => x(i) + ',' + y(Number(p.weight_kg))).join(' '));
    path.setAttribute('class', 'progress-line'); svg.appendChild(path);
    points.forEach((p, i) => {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(Number(p.weight_kg)));
      dot.setAttribute('r', '4.5'); dot.setAttribute('class', 'progress-dot');
      const title = document.createElementNS(ns, 'title');
      title.textContent = p.measured_on + ': ' + Number(p.weight_kg).toFixed(1) + ' кг';
      dot.appendChild(title); svg.appendChild(dot);
    });
    [points[0], points[points.length - 1]].forEach((p, i) => {
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', i ? width - right : left);
      label.setAttribute('y', height - 12);
      label.setAttribute('text-anchor', i ? 'end' : 'start');
      label.setAttribute('class', 'progress-axis-label');
      label.textContent = p.measured_on.slice(5).replace('-', '.'); svg.appendChild(label);
    });
    host.appendChild(svg);
  }

  function renderProgressHistory(entries) {
    const summary = $('progressSummary'), history = $('progressHistory');
    if (!summary || !history) return;
    summary.replaceChildren(); history.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'progress-empty';
      empty.textContent = 'Пока нет замеров. Добавь первый вес и, если хочешь, рост и талию.';
      history.appendChild(empty); renderProgressChart([]); return;
    }
    const newest = entries[0], oldest = entries[entries.length - 1];
    const delta = Number(newest.weight_kg) - Number(oldest.weight_kg);
    [
      ['Последний вес', Number(newest.weight_kg).toFixed(1).replace('.', ',') + ' кг'],
      ['Записей', String(entries.length)],
      ['Изменение за период', entries.length > 1 ? (delta > 0 ? '+' : '') + delta.toFixed(1).replace('.', ',') + ' кг' : '—']
    ].forEach(([label, value]) => {
      const card = document.createElement('div'); card.className = 'progress-stat';
      const small = document.createElement('small'); small.textContent = label;
      const strong = document.createElement('b'); strong.textContent = value;
      card.append(small, strong); summary.appendChild(card);
    });
    renderProgressChart(entries);
    entries.forEach(entry => {
      const row = document.createElement('div'); row.className = 'progress-entry';
      const details = document.createElement('div'); details.className = 'progress-entry-details';
      const date = document.createElement('b');
      date.textContent = new Date(entry.measured_on + 'T00:00:00').toLocaleDateString('ru-RU');
      const values = [Number(entry.weight_kg).toFixed(1).replace('.', ',') + ' кг'];
      if (entry.height_cm) values.push(Number(entry.height_cm).toFixed(1).replace('.', ',') + ' см рост');
      if (entry.waist_cm) values.push(Number(entry.waist_cm).toFixed(1).replace('.', ',') + ' см талия');
      const sub = document.createElement('small'); sub.textContent = values.join(' · ');
      details.append(date, sub);
      if (entry.note) { const note = document.createElement('p'); note.textContent = entry.note; details.appendChild(note); }
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'progress-delete';
      remove.textContent = 'Удалить'; remove.dataset.progressId = entry.id;
      remove.setAttribute('aria-label', 'Удалить замер от ' + entry.measured_on);
      row.append(details, remove); history.appendChild(row);
    });
  }

  async function loadProgressEntries() {
    if (!db || !session) return;
    const history = $('progressHistory'); if (!history) return;
    history.innerHTML = '<p class="progress-empty">Загружаю личные замеры...</p>';
    const { data, error } = await db.from('progress_entries')
      .select('id,measured_on,weight_kg,height_cm,waist_cm,note,created_at')
      .eq('user_id', session.user.id)
      .order('measured_on', { ascending: false })
      .order('created_at', { ascending: false }).limit(100);
    if (error) {
      history.textContent = 'Не удалось загрузить дневник. Выполни миграцию personal_progress.sql: ' + error.message;
      return;
    }
    renderProgressHistory(data || []);
  }

  async function deleteProgressEntry(id) {
    if (!db || !session || !id) return;
    const { error } = await db.from('progress_entries')
      .delete().eq('id', id).eq('user_id', session.user.id);
    if (error) return setMessage('Не удалось удалить замер: ' + error.message, true);
    setMessage('Замер удалён из личного дневника.');
    await loadProgressEntries();
  }

  async function deletePlan(planId) {
    if (!db || !session || !planId) return;
    if (!window.confirm('Удалить этот рацион из личной истории?')) return;
    const { error } = await db.from('meal_plans')
      .delete().eq('id', planId).eq('owner_id', session.user.id);
    if (error) return setMessage('Не удалось удалить рацион: ' + error.message, true);
    if (activePlanId === planId) {
      activePlanId = null;
      activePlanOwner = null;
    }
    setMessage('Рацион удалён из личной истории.');
    await loadHistory();
  }

  async function loadHistory() {
    if (!db || !session) return;
    const list = $('cloudHistory');
    if (!list) return;
    list.innerHTML = '<p>Загружаю личную историю...</p>';
    const { data, error } = await db.from('meal_plans')
      .select('id,title,created_at')
      .order('created_at', { ascending: false }).limit(20);
    if (error) {
      list.textContent = 'Не удалось загрузить историю: ' + error.message;
      return;
    }
    list.replaceChildren();
    if (!data || !data.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Пока нет сохранённых рационов. Составь первый рацион — он появится здесь.';
      list.appendChild(empty);
      return;
    }
    data.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cloud-history-row';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cloud-history-item';
      button.dataset.planId = item.id;
      const title = document.createElement('b');
      title.textContent = item.title || 'Рацион NUTRIX';
      const date = document.createElement('small');
      date.textContent = new Date(item.created_at).toLocaleString('ru-RU');
      button.append(title, date);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'cloud-history-delete';
      remove.dataset.deletePlanId = item.id;
      remove.textContent = 'Удалить';
      remove.setAttribute('aria-label', 'Удалить рацион ' + (item.title || 'NUTRIX'));
      row.append(button, remove);
      list.appendChild(row);
    });
  }

  async function boot() {
    buildPanel();
    $('cloudOpen').addEventListener('click', showDialog);
    $('progressDate').value = localDateValue();
    await initializeClient();
  }

  window.addEventListener('nutrix:plan-rendered', async event => {
    if (loadingPlan || !session || !event.detail || !event.detail.plan) return;
    if (event.detail.newPlan) {
      await saveProfileToCloud();
      await savePlan(event.detail.plan, true);
    } else if (activePlanId && activePlanOwner === session.user.id) {
      await savePlan(event.detail.plan, false);
    }
  });

  const shoppingNode = $('shoppingList');
  if (shoppingNode) shoppingNode.addEventListener('change', () => {
    if (activePlanId && activePlanOwner === (currentUser() && currentUser().id)) {
      window.setTimeout(saveShoppingState, 150);
    }
  });

  boot();
})();
