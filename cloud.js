'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const CONFIG_KEY = 'nutrix-cloud-config';
  let db = null;
  let session = null;
  let activePlanId = null;
  let activePlanOwner = null;
  let activeShareToken = null;
  let loadingPlan = false;
  let configExpanded = false;
  let pendingShareToken = null;
  let sharedData = null;
  let sharedChannel = null;
  let sharedSaving = false;
  let sharedSaveQueued = false;

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
  const showDialog = () => {
    updatePanel();
    if (!$('cloudDialog').open) $('cloudDialog').showModal();
    if (session) loadHistory();
  };
  const hideDialog = () => { if ($('cloudDialog').open) $('cloudDialog').close(); };

  function buildPanel() {
    $('cloudContent').innerHTML =
      '<div class="cloud-modal-head"><div><div class="eyebrow">NUTRIX CLOUD</div><h2>Общий аккаунт и база</h2><p>Профиль, сохранённые рационы и совместные покупки.</p></div><button class="icon-button" id="cloudClose" type="button" aria-label="Закрыть">×</button></div>' +
      '<div id="cloudMessage" class="cloud-message" role="status"></div>' +
      '<section class="cloud-section" id="cloudConfigSection"><div class="cloud-section-head"><div><h3>Подключение базы</h3><p>Supabase Project URL и Publishable key</p></div><span id="cloudConnectionState" class="cloud-state">Не подключено</span></div>' +
      '<div id="cloudConfigForm" class="cloud-config-form"><label>Project URL<input id="cloudProjectUrl" type="url" placeholder="https://xxxx.supabase.co" autocomplete="url"></label><label>Publishable key<input id="cloudPublishableKey" type="password" placeholder="sb_publishable_..." autocomplete="off"></label><button class="cloud-primary" id="cloudSaveConfig" type="button">Подключить базу</button><small>Используй только Publishable key. Secret key и service_role сюда вставлять нельзя.</small></div>' +
      '<div id="cloudConfigSummary" class="cloud-config-summary" hidden><span id="cloudProjectLabel"></span><button class="cloud-link-button" id="cloudChangeConfig" type="button">Изменить подключение</button></div></section>' +
      '<section class="cloud-section" id="cloudAuthSection"><div class="cloud-section-head"><div><h3>Аккаунт</h3><p>Регистрация и вход по электронной почте</p></div></div>' +
      '<div id="cloudAuthForm" class="cloud-auth-form"><label>Имя для отображения<input id="cloudDisplayName" type="text" placeholder="Как тебя называть"></label><label>Электронная почта<input id="cloudEmail" type="email" placeholder="name@example.com" autocomplete="email"></label><label>Пароль<input id="cloudPassword" type="password" placeholder="Не менее 8 символов" autocomplete="current-password"></label><div class="cloud-button-row"><button class="cloud-primary" id="cloudSignIn" type="button">Войти</button><button class="cloud-secondary" id="cloudSignUp" type="button">Создать аккаунт</button></div></div>' +
      '<div id="cloudAccount" class="cloud-account" hidden><div class="cloud-user-line"><div class="cloud-avatar">N</div><div><b id="cloudUserEmail"></b><small id="cloudUserName"></small></div></div><div class="cloud-button-row"><button class="cloud-primary" id="cloudSaveProfile" type="button">Сохранить профиль</button><button class="cloud-secondary" id="cloudLoadProfile" type="button">Загрузить профиль</button></div><button class="cloud-link-button" id="cloudSignOut" type="button">Выйти из аккаунта</button></div></section>' +
      '<section class="cloud-section" id="cloudPlansSection"><div class="cloud-section-head"><div><h3>Мои рационы</h3><p>История сохранённых планов</p></div><button class="cloud-link-button" id="cloudHistoryRefresh" type="button">Обновить</button></div>' +
      '<div class="cloud-button-row"><button class="cloud-primary" id="cloudSaveCurrentPlan" type="button">Сохранить текущий рацион</button><button class="cloud-secondary" id="cloudCreateShare" type="button">Создать ссылку</button></div><div id="cloudShareResult" class="cloud-share-result" hidden><input id="cloudShareUrl" readonly><button class="cloud-secondary" id="cloudCopyShare" type="button">Копировать</button><button class="cloud-link-button" id="cloudDisableShare" type="button">Отключить ссылку</button></div><div id="cloudHistory" class="cloud-history"><p>Войди в аккаунт, чтобы увидеть историю.</p></div></section>' +
      '<div class="cloud-footer-note">Без подключения облака генератор продолжает работать локально. Облачная база активируется после настройки Supabase.</div>';

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
    $('cloudCreateShare').addEventListener('click', createShareLink);
    $('cloudCopyShare').addEventListener('click', copyShareLink);
    $('cloudDisableShare').addEventListener('click', disableShareLink);
    $('cloudHistoryRefresh').addEventListener('click', loadHistory);
    $('cloudHistory').addEventListener('click', event => {
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
        if (pendingShareToken) await loadSharedView(pendingShareToken);
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
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return setMessage(error.message, true);
    setMessage('Вход выполнен.');
    await loadHistory();
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
    else setMessage('Аккаунт создан. Добро пожаловать в NUTRIX.');
  }

  async function signOut() {
    if (!db) return;
    const { error } = await db.auth.signOut();
    if (error) return setMessage(error.message, true);
    session = null;
    activePlanId = null;
    activePlanOwner = null;
    updatePanel();
    setMessage('Ты вышел из аккаунта. Локальный генератор продолжает работать.');
    if (pendingShareToken) await loadSharedView(pendingShareToken);
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
    $('avoid').value = Array.isArray(profile.avoid) ? profile.avoid.join(', ') : (profile.avoid || '');
    $('avoid').dispatchEvent(new Event('input', { bubbles: true }));
    const radio = document.querySelector('input[name="goal"][value="' + (profile.goal || 'maintain') + '"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function loadProfileFromCloud() {
    if (!db || !session) return;
    const { data, error } = await db.from('profiles')
      .select('display_name,profile_json')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) return setMessage('Не удалось загрузить профиль: ' + error.message, true);
    if (!data) return setMessage('В облаке пока нет сохранённого профиля.');
    applyProfile(data.profile_json);
    if (data.display_name) $('cloudDisplayName').value = data.display_name;
    setMessage('Профиль загружен из облака.');
    toast('Профиль загружен');
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
      }).select('id,share_token').single();
      if (result.error) return setMessage('Не удалось сохранить рацион: ' + result.error.message, true);
      activePlanId = result.data.id;
      activeShareToken = result.data.share_token;
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
      .select('id,owner_id,title,plan_data,share_token,share_enabled')
      .eq('id', planId).single();
    if (error) return setMessage('Не удалось открыть рацион: ' + error.message, true);
    const shoppingResult = await db.from('shopping_lists')
      .select('checked_items,price_overrides')
      .eq('plan_id', planId).maybeSingle();
    if (shoppingResult.error) return setMessage('Не удалось загрузить список покупок: ' + shoppingResult.error.message, true);
    activePlanId = data.id;
    activePlanOwner = data.owner_id;
    activeShareToken = data.share_token;
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

  async function loadHistory() {
    if (!db || !session) return;
    const list = $('cloudHistory');
    list.innerHTML = '<p>Загружаю историю...</p>';
    const { data, error } = await db.from('meal_plans')
      .select('id,title,created_at,share_enabled')
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
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cloud-history-item';
      button.dataset.planId = item.id;
      const title = document.createElement('b');
      title.textContent = item.title || 'Рацион NUTRIX';
      const date = document.createElement('small');
      date.textContent = new Date(item.created_at).toLocaleString('ru-RU') + (item.share_enabled ? ' · доступ по ссылке включён' : '');
      button.append(title, date);
      list.appendChild(button);
    });
  }

  async function createShareLink() {
    if (!db || !session) return setMessage('Сначала войди в аккаунт.', true);
    if (!activePlanId) {
      const plan = window.NUTRIX && window.NUTRIX.plan;
      if (!plan) return setMessage('Сначала составь рацион.');
      await savePlan(plan, true);
      if (!activePlanId) return;
    }
    const { data, error } = await db.from('meal_plans')
      .update({ share_enabled: true, updated_at: new Date().toISOString() })
      .eq('id', activePlanId).eq('owner_id', session.user.id)
      .select('share_token').single();
    if (error) return setMessage('Не удалось создать ссылку: ' + error.message, true);
    activeShareToken = data.share_token;
    const url = location.origin + location.pathname + '?share=' + encodeURIComponent(activeShareToken);
    $('cloudShareUrl').value = url;
    $('cloudShareResult').hidden = false;
    setMessage('Ссылка создана. Её можно отправить другу.');
  }

  async function copyShareLink() {
    const url = $('cloudShareUrl').value;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Ссылка скопирована.');
      toast('Ссылка скопирована');
    } catch (_) {
      $('cloudShareUrl').focus();
      $('cloudShareUrl').select();
      setMessage('Нажми Ctrl+C, чтобы скопировать ссылку.');
    }
  }

  async function disableShareLink() {
    if (!db || !session || !activePlanId) return;
    const { error } = await db.from('meal_plans')
      .update({ share_enabled: false, updated_at: new Date().toISOString() })
      .eq('id', activePlanId).eq('owner_id', session.user.id);
    if (error) return setMessage('Не удалось отключить ссылку: ' + error.message, true);
    $('cloudShareResult').hidden = true;
    setMessage('Общий доступ по ссылке отключён.');
  }

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderSharedView(data) {
    sharedData = data;
    const main = document.querySelector('main#top');
    if (!main) return;
    ['.hero','.trust-strip','#profile','#results','.how-section'].forEach(selector => {
      const item = document.querySelector(selector);
      if (item) item.hidden = true;
    });
    let section = $('sharedView');
    if (!section) {
      section = node('section', 'shared-view');
      section.id = 'sharedView';
      main.prepend(section);
    }
    section.replaceChildren();
    const head = node('div', 'shared-view-head');
    const eyebrow = node('div', 'eyebrow', 'NUTRIX · СОВМЕСТНЫЙ РАЦИОН');
    const title = node('h1', '', data.title || 'Рацион на неделю');
    const subtitle = node('p', '', 'Семидневное меню и общий список покупок. Личные параметры владельца скрыты.');
    head.append(eyebrow, title, subtitle);
    const meta = node('div', 'shared-meta');
    meta.append(node('span','', 'Магазин: ' + (data.store === 'baton' ? 'Батон' : data.store === 'pyaterochka' ? 'Пятёрочка' : 'Средние цены')));
    meta.append(node('span','', 'Бюджет: ' + Number(data.budget || 0).toLocaleString('ru-RU') + ' ₽'));
    head.append(meta);
    section.appendChild(head);

    const daysHeading = node('h2','shared-section-title','Меню на неделю');
    section.appendChild(daysHeading);
    const daysGrid = node('div','shared-days-grid');
    (data.plan.days || []).forEach(day => {
      const card = node('article','shared-day-card');
      const dayHead = node('h3','',day.name || 'День');
      card.appendChild(dayHead);
      (day.meals || []).forEach(meal => {
        const row = node('div','shared-meal');
        const icon = node('span','shared-meal-icon', meal.recipe && meal.recipe.icon ? meal.recipe.icon : '🍽️');
        const info = node('div','shared-meal-info');
        const mealName = node('b','',(meal.type || 'Приём пищи') + ': ' + (meal.recipe && meal.recipe.name ? meal.recipe.name : 'Блюдо'));
        const ingredients = node('small','',(meal.ingredients || []).map(item => item.name + ' — ' + (item.unit === 'шт.' ? Math.round(item.amount * 2) / 2 + ' шт.' : Math.round(item.amount) + ' ' + item.unit)).join(' · '));
        info.append(mealName, ingredients);
        row.append(icon,info);
        card.appendChild(row);
      });
      daysGrid.appendChild(card);
    });
    section.appendChild(daysGrid);

    const shopHead = node('div','shared-shop-head');
    shopHead.append(node('h2','shared-section-title','Общий список покупок'));
    const permission = data.is_owner || data.is_member;
    shopHead.append(node('span',permission?'cloud-state is-online':'cloud-state',permission?'Совместный доступ активен':'Только просмотр'));
    section.appendChild(shopHead);
    const cart = node('div','shared-cart');
    const checked = new Set(data.shopping && Array.isArray(data.shopping.checked_items) ? data.shopping.checked_items : []);
    const priceOverrides = data.shopping && data.shopping.price_overrides ? data.shopping.price_overrides : {};
    (data.plan.cart || []).forEach(item => {
      const row = node('div','shared-cart-row');
      const label = node('label','shared-cart-label');
      const checkbox = node('input','');
      checkbox.type = 'checkbox';
      checkbox.dataset.cartKey = item.key;
      checkbox.checked = checked.has(item.key);
      checkbox.disabled = !permission;
      const details = node('span','');
      details.append(node('b','',item.name));
      details.append(node('small','', 'Нужно: ' + Math.round(item.amount) + ' ' + item.unit + ' · купить: ' + item.packCount + ' × ' + item.packLabel));
      label.append(checkbox,details);
      const priceWrap = node('label','shared-cart-price','₽ / уп.');
      const price = node('input','');
      price.type = 'number'; price.min = '0'; price.step = '1'; price.disabled = !permission;
      price.dataset.priceKey = item.key;
      price.value = priceOverrides[item.key] !== undefined ? priceOverrides[item.key] : item.price;
      priceWrap.appendChild(price);
      row.append(label,priceWrap);
      cart.appendChild(row);
    });
    if (!(data.plan.cart || []).length) cart.appendChild(node('p','','Список покупок пуст.'));
    section.appendChild(cart);

    const actions = node('div','shared-actions');
    if (!permission) {
      const action = node('button','cloud-primary', session ? 'Присоединиться к общему списку' : 'Войти, чтобы присоединиться');
      action.type = 'button';
      action.addEventListener('click', () => {
        if (!session) showDialog();
        else joinSharedPlan();
      });
      actions.appendChild(action);
    } else {
      actions.appendChild(node('p','shared-live-note','Отметки и цены синхронизируются между участниками.'));
      const copy = node('button','cloud-secondary','Скопировать ссылку');
      copy.type = 'button';
      copy.addEventListener('click', async () => {
        const url = location.href;
        try { await navigator.clipboard.writeText(url); toast('Ссылка скопирована'); }
        catch (_) { toast('Скопируй ссылку из адресной строки'); }
      });
      actions.appendChild(copy);
    }
    const back = node('a','cloud-link-button','Открыть генератор NUTRIX');
    back.href = location.pathname;
    actions.appendChild(back);
    section.appendChild(actions);

    cart.addEventListener('change', saveSharedShopping);
    subscribeSharedRealtime();
  }

  async function loadSharedView(token) {
    pendingShareToken = token;
    if (!db) {
      renderSharedView({
        title:'Облачная база не подключена',
        store:'average',budget:0,
        plan:{days:[],cart:[]},
        shopping:{checked_items:[],price_overrides:{}},
        is_owner:false,is_member:false
      });
      const section = $('sharedView');
      const message = node('p','cloud-message is-error','Чтобы открыть эту ссылку, владелец и приглашённый участник должны подключить проект Supabase в разделе «Облако».');
      section.appendChild(message);
      return;
    }
    const { data, error } = await db.functions.invoke('get-shared-plan', { body: { token } });
    if (error || !data || data.error) {
      renderSharedView({
        title:'Не удалось открыть рацион',
        store:'average',budget:0,plan:{days:[],cart:[]},
        shopping:{checked_items:[],price_overrides:{}},is_owner:false,is_member:false
      });
      $('sharedView').appendChild(node('p','cloud-message is-error',data && data.error ? data.error : (error && error.message) || 'Проверь ссылку и подключение базы.'));
      return;
    }
    renderSharedView(data);
  }

  async function joinSharedPlan() {
    if (!db || !session || !pendingShareToken) return showDialog();
    const { data, error } = await db.functions.invoke('join-shared-plan', { body: { token: pendingShareToken } });
    if (error || !data || data.error) {
      toast(data && data.error ? data.error : (error && error.message) || 'Не удалось присоединиться');
      return;
    }
    toast('Ты добавлен в общий рацион');
    await loadSharedView(pendingShareToken);
  }

  async function saveSharedShopping() {
    if (!db || !session || !sharedData || !(sharedData.is_owner || sharedData.is_member)) return;
    const section = $('sharedView');
    if (!section) return;
    if (sharedSaving) { sharedSaveQueued = true; return; }
    sharedSaving = true;
    const checked = [];
    section.querySelectorAll('input[data-cart-key]:checked').forEach(input => checked.push(input.dataset.cartKey));
    const prices = {};
    section.querySelectorAll('input[data-price-key]').forEach(input => {
      prices[input.dataset.priceKey] = Math.max(0, Number(input.value) || 0);
    });
    const { error } = await db.from('shopping_lists').upsert({
      plan_id: sharedData.id,
      checked_items: checked,
      price_overrides: prices,
      updated_at: new Date().toISOString()
    }, { onConflict: 'plan_id' });
    sharedSaving = false;
    if (error) toast('Не удалось сохранить список: ' + error.message);
    else {
      sharedData.shopping = { checked_items: checked, price_overrides: prices };
      toast('Общий список обновлён');
    }
    if (sharedSaveQueued) {
      sharedSaveQueued = false;
      await saveSharedShopping();
    }
  }

  function subscribeSharedRealtime() {
    if (sharedChannel && db) {
      db.removeChannel(sharedChannel);
      sharedChannel = null;
    }
    if (!db || !sharedData || !(sharedData.is_owner || sharedData.is_member)) return;
    sharedChannel = db.channel('nutrix-shopping-' + sharedData.id)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'shopping_lists',
        filter: 'plan_id=eq.' + sharedData.id
      }, payload => {
        if (!payload.new) return;
        sharedData.shopping = payload.new;
        const checked = new Set(payload.new.checked_items || []);
        const prices = payload.new.price_overrides || {};
        const section = $('sharedView');
        if (!section) return;
        section.querySelectorAll('input[data-cart-key]').forEach(input => {
          input.checked = checked.has(input.dataset.cartKey);
        });
        section.querySelectorAll('input[data-price-key]').forEach(input => {
          const key = input.dataset.priceKey;
          if (prices[key] !== undefined && document.activeElement !== input) input.value = prices[key];
        });
      }).subscribe();
  }

  async function boot() {
    buildPanel();
    $('cloudOpen').addEventListener('click', showDialog);
    await initializeClient();
    const token = new URLSearchParams(location.search).get('share');
    if (token) {
      pendingShareToken = token;
      await loadSharedView(token);
    }
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
