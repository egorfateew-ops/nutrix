'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const guide = {
    b1:[10,['Залей овсяные хлопья молоком и вари на слабом огне 5–7 минут, помешивая.','Нарежь банан и добавь его вместе с йогуртом в готовую кашу.']],
    b2:[12,['Приготовь яйца до полной готовности.','Подай с хлебом, нарезанными помидором и огурцом.']],
    b3:[5,['Положи творог в миску и разомни вилкой.','Добавь ягоды, овсяные хлопья и немного мёда.']],
    b4:[20,['Промой гречку и отвари до мягкости по инструкции.','Отдельно приготовь яйца и подай с огурцом.']],
    b5:[10,['Подсуши хлеб.','Разомни авокадо, намажь на хлеб и добавь приготовленные яйца и помидор.']],
    b6:[5,['Смешай соевый йогурт с овсяными хлопьями.','Добавь нарезанное яблоко и семена льна.']],
    b7:[20,['Промой рис и вари в соевом напитке или воде до мягкости.','Добавь нарезанное яблоко и корицу.']],
    s1:[2,['Вымой яблоко и нарежь при желании.','Подай с небольшой порцией орехов.']],
    s2:[2,['Очисти банан.','Подай вместе с натуральным йогуртом.']],
    s3:[5,['Нарежь морковь палочками.','Подай с хумусом и хлебцами.']],
    s4:[3,['Нарежь грушу.','Подай с творогом.']],
    s5:[3,['Положи соевый йогурт в миску.','Добавь ягоды и семена тыквы.']],
    s6:[5,['Нарежь хлеб и сыр.','Собери бутерброд с ломтиками помидора.']],
    s7:[2,['Очисти банан и нарежь его.','Добавь арахисовую пасту; не используй при аллергии на арахис.']],
    l1:[30,['Нарежь курицу и приготовь до полной готовности внутри.','Отвари рис по инструкции.','Приготовь овощную смесь и подай с курицей и рисом.']],
    l2:[35,['Отвари гречку.','Приготовь индейку до полной готовности.','Нарежь огурец и помидор, добавь немного масла.']],
    l3:[25,['Отвари макароны и слей воду.','Прогрей фасоль с томатным соусом.','Смешай с макаронами.']],
    l4:[40,['Промой чечевицу и отвари до мягкости.','Отдельно приготовь рис.','Потуши морковь и лук, затем смешай всё вместе.']],
    l5:[35,['Приготовь рыбу в духовке или на пару до полной готовности.','Отвари или запеки картофель.','Нашинкуй капусту и подай как салат.']],
    l6:[20,['Отвари лапшу по инструкции.','Нарежь тофу и обжарь до золотистой корочки.','Добавь овощи и соевый соус, прогрей и смешай с лапшой.']],
    l7:[25,['Отвари или запеки картофель.','Приготовь яйца до полной готовности.','Нашинкуй капусту и морковь, добавь немного масла.']],
    d1:[35,['Запеки рыбу до полной готовности.','Приготовь картофель и брокколи на пару или в духовке.','Добавь немного масла и подай.']],
    d2:[30,['Отвари гречку.','Приготовь курицу до полной готовности.','Добавь овощную смесь и прогрей до мягкости.']],
    d3:[15,['Взбей яйца вилкой.','Добавь нарезанные помидор и шпинат.','Готовь под крышкой до полного схватывания яиц, подай с хлебом.']],
    d4:[35,['Отвари булгур по инструкции.','Потуши кабачок и помидор до мягкости.','Добавь готовый нут, прогрей и подай с булгуром.']],
    d5:[30,['Отвари гречку.','Нарежь тофу и обжарь до золотистой корочки.','Добавь овощную смесь и подай с гречкой.']],
    d6:[35,['Нарежь картофель, морковь и лук.','Туши овощи с небольшим количеством воды до мягкости.','Добавь фасоль и прогрей ещё несколько минут.']],
    d7:[30,['Отвари макароны.','Приготовь индейку до полной готовности.','Добавь овощную смесь, прогрей и смешай с макаронами.']]
  };
  const read = key => { try { return JSON.parse(localStorage.getItem(key)||'{}'); } catch(e) { return {}; } };
  const write = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch(e) {} };
  const plan = () => window.NUTRIX && window.NUTRIX.plan;
  const currentStore = () => plan() && plan().data.store || 'pyaterochka';
  const toast = message => window.NUTRIX && window.NUTRIX.showToast ? window.NUTRIX.showToast(message) : null;

  function ensureDialog(){
    if($('recipeDialog')) return;
    const dialog=document.createElement('dialog');dialog.id='recipeDialog';dialog.className='recipe-dialog';
    dialog.innerHTML='<div class="recipe-dialog-inner"><div class="recipe-dialog-head"><div><div class="eyebrow">РЕЦЕПТ NUTRIX</div><h2 id="recipeTitle"></h2><p id="recipeMeta"></p></div><button class="icon-button" id="recipeClose" type="button" aria-label="Закрыть">×</button></div><div class="recipe-dialog-section"><h3>Ингредиенты на порцию</h3><ul id="recipeIngredients"></ul></div><div class="recipe-dialog-section"><h3>Как приготовить</h3><ol id="recipeSteps"></ol></div><p class="recipe-dialog-note">Проверяй готовность продуктов и учитывай индивидуальные аллергии. Для точной пищевой ценности сверяйся с упаковками.</p></div>';
    document.body.appendChild(dialog);
    $('recipeClose').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }
  function openRecipe(dayIndex,mealIndex){
    const meal=plan() && plan().days[dayIndex] && plan().days[dayIndex].meals[mealIndex];if(!meal)return;
    const info=guide[meal.recipe.id];if(!info){toast('Инструкция для блюда пока недоступна');return;}
    ensureDialog();$('recipeTitle').textContent=meal.recipe.name;
    $('recipeMeta').textContent=info[0]+' минут · '+(meal.recipe.diet.includes('vegan')?'веганское':meal.recipe.diet.includes('vegetarian')?'вегетарианское':'обычное меню');
    const ingredients=$('recipeIngredients');ingredients.replaceChildren();
    meal.ingredients.forEach(item=>{const li=document.createElement('li');let amount;if(item.unit==='шт.')amount=(Math.round(item.amount*2)/2)+' шт.';else if(item.unit==='мл')amount=(Math.round(item.amount/10)*10)+' мл';else amount=(Math.max(1,Math.round(item.amount/5)*5))+' г';li.textContent=item.name+' — '+amount;ingredients.appendChild(li);});
    const steps=$('recipeSteps');steps.replaceChildren();
    info[1].forEach(step=>{const li=document.createElement('li');li.textContent=step;steps.appendChild(li);});
    $('recipeDialog').showModal();
  }
  function enhanceMeals(){
    const p=plan();if(!p)return;
    document.querySelectorAll('#daysGrid .meal-row').forEach(row=>{
      const replace=row.querySelector('.replace-meal');if(!replace||row.querySelector('.recipe-details'))return;
      const actions=document.createElement('div');actions.className='meal-action-buttons';
      const detail=document.createElement('button');detail.type='button';detail.className='recipe-details';detail.textContent='Рецепт';detail.title='Посмотреть ингредиенты и способ приготовления';detail.dataset.day=replace.dataset.day;detail.dataset.meal=replace.dataset.meal;
      replace.parentNode.insertBefore(actions,replace);actions.append(detail,replace);
    });
    document.querySelectorAll('#daysGrid .day-card').forEach((card,index)=>{
      const summary=card.querySelector('.day-foot span');const total=p.totals[index];if(!summary||!total)return;
      const nextText=p.adult?total.kcal+' ккал · Б '+total.p+' г · Ж '+total.f+' г · У '+total.c+' г':'Порции — примерные';if(summary.textContent!==nextText)summary.textContent=nextText;
    });
  }
  function addShoppingControls(){
    const heading=document.querySelector('.shopping-heading');if(!heading||$('clearShoppingChecks'))return;
    const copy=$('copyShopping');const button=document.createElement('button');button.id='clearShoppingChecks';button.type='button';button.className='secondary-button';button.textContent='Снять отметки';
    if(copy){const group=document.createElement('div');group.className='shopping-actions';copy.parentNode.insertBefore(group,copy);group.append(button,copy);}else heading.append(button);
    button.addEventListener('click',()=>{
      const checks=read('nutrix-shopping-checks');const prefix=currentStore()+':';
      Object.keys(checks).forEach(key=>{if(key.startsWith(prefix))delete checks[key];});write('nutrix-shopping-checks',checks);
      document.querySelectorAll('#shoppingList .shopping-item input[type=checkbox]').forEach(input=>input.checked=false);
      toast('Отметки списка покупок очищены');
    });
  }
  function restoreShoppingState(){
    const p=plan();if(!p)return;const checks=read('nutrix-shopping-checks');
    document.querySelectorAll('#shoppingList .shopping-item input[type=checkbox][data-cart-key]').forEach(input=>{
      let key='';try{key=decodeURIComponent(input.dataset.cartKey||'');}catch(e){}
      input.checked=!!checks[p.data.store+':'+key];
    });
  }
  function persistShoppingChanges(){
    const list=$('shoppingList');if(!list||list.dataset.nutrixBound)return;list.dataset.nutrixBound='1';
    list.addEventListener('change',event=>{
      const p=plan();if(!p)return;
      const check=event.target.closest('.shopping-item input[type=checkbox]');
      if(check){let key='';try{key=decodeURIComponent(check.dataset.cartKey||'');}catch(e){}const checks=read('nutrix-shopping-checks');const id=p.data.store+':'+key;if(check.checked)checks[id]=true;else delete checks[id];write('nutrix-shopping-checks',checks);return;}
      const price=event.target.closest('.price-edit');if(!price)return;
      const item=p.cart[Number(price.dataset.index)];if(!item)return;
      const overrides=read('nutrix-price-overrides');overrides[p.data.store+':'+item.name]=Math.max(0,Number(price.value)||0);write('nutrix-price-overrides',overrides);
    });
  }
  function addInstallButton(){
    const theme=$('themeToggle');if(!theme||$('installApp'))return;
    const button=document.createElement('button');button.id='installApp';button.type='button';button.className='icon-button install-button';button.textContent='↓';button.title='Установить NUTRIX';button.setAttribute('aria-label','Установить NUTRIX');
    theme.parentNode.insertBefore(button,theme);
    let deferred=null;
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;button.hidden=false;});
    button.addEventListener('click',async()=>{if(!deferred){toast('В меню браузера выбери «Установить NUTRIX» или «На главный экран»');return;}deferred.prompt();try{await deferred.userChoice;}catch(e){}deferred=null;button.hidden=true;});
    window.addEventListener('appinstalled',()=>{button.hidden=true;toast('NUTRIX установлен');});
  }
  function registerOffline(){
    if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
  function runEnhancements(){enhanceMeals();addShoppingControls();restoreShoppingState();persistShoppingChanges();addInstallButton();}
  const days=$('daysGrid'),shopping=$('shoppingList');
  if(days)new MutationObserver(runEnhancements).observe(days,{childList:true,subtree:true});
  if(shopping)new MutationObserver(runEnhancements).observe(shopping,{childList:true,subtree:true});
  runEnhancements();registerOffline();
  if(days)days.addEventListener('click',event=>{const button=event.target.closest('.recipe-details');if(button)openRecipe(Number(button.dataset.day),Number(button.dataset.meal));});
})();