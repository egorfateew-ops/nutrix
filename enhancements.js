'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const guide = {
    b1:[10,['Налей молоко в небольшой ковш и доведи почти до кипения на среднем огне.','Всыпь овсяные хлопья, убавь огонь и вари 5–7 минут, регулярно помешивая.','Сними кашу с огня и дай постоять под крышкой 1 минуту.','Нарежь банан кружочками, добавь вместе с йогуртом и перемешай.']],
    b2:[12,['Разогрей антипригарную сковороду. Приготовь яйца вкрутую или в виде омлета до полной готовности.','Подсуши хлеб на сухой сковороде или в тостере.','Вымой и нарежь помидор и огурец.','Подай яйца с тостами и овощами.']],
    b3:[5,['Положи творог в миску и разомни вилкой до однородности.','Если творог слишком плотный, добавь ложку воды или йогурта.','Добавь ягоды, овсяные хлопья и мёд, аккуратно перемешай.']],
    b4:[20,['Промой гречку под прохладной водой и переложи в кастрюлю.','Залей водой по инструкции на упаковке, доведи до кипения и вари на слабом огне до мягкости.','Приготовь яйца до полной готовности.','Нарежь огурец и подай всё вместе.']],
    b5:[10,['Подсуши хлеб в тостере или на сухой сковороде.','Разрежь авокадо, удали косточку и разомни мякоть вилкой.','Намажь авокадо на тосты, добавь приготовленные яйца и ломтики помидора.']],
    b6:[5,['Переложи соевый йогурт в глубокую миску.','Добавь овсяные хлопья и перемешай.','Нарежь яблоко небольшими кубиками, добавь вместе с семенами льна.','Дай постоять 2–3 минуты, чтобы хлопья немного размягчились.']],
    b7:[20,['Промой рис до прозрачной воды.','Залей соевым напитком или водой, доведи до кипения и вари на слабом огне 15–18 минут, периодически помешивая.','Если каша становится слишком густой, добавь немного жидкости.','Нарежь яблоко, добавь его и корицу в готовую кашу.']],
    s1:[2,['Тщательно вымой яблоко под проточной водой.','Нарежь дольками или оставь целым.','Отмерь порцию орехов и подай вместе.']],
    s2:[2,['Очисти банан и нарежь кружочками.','Добавь соевый йогурт и перемешай.']],
    s3:[5,['Вымой и очисти морковь.','Нарежь морковь тонкими палочками одинаковой длины.','Разложи хумус и хлебцы рядом, используй хумус как соус.']],
    s4:[3,['Вымой грушу и нарежь небольшими кусочками.','Добавь соевый йогурт и перемешай.']],
    s5:[3,['Положи соевый йогурт в миску.','Если ягоды замороженные, дай им немного оттаять и слей лишнюю жидкость.','Добавь ягоды и семена тыквы, перемешай перед подачей.']],
    s6:[5,['Подсуши хлеб по желанию.','Намажь хумус и добавь ломтики помидора.']],
    s7:[2,['Очисти банан и нарежь кружочками.','Положи арахисовую пасту в небольшую миску или нанеси на кусочки банана.','Не используй этот перекус при аллергии на арахис или возможном перекрёстном загрязнении.']],
    l1:[30,['Промой рис и отвари по инструкции на упаковке.','Нарежь куриное филе небольшими кусочками одинакового размера.','Обжарь курицу на сковороде до готовности внутри; сок должен быть прозрачным, без сырой середины.','Добавь овощную смесь, прогрей до мягкости и подай с рисом.']],
    l2:[35,['Промой гречку и отвари до мягкости.','Нарежь индейку полосками, приготовь на сковороде до полной готовности внутри.','Вымой огурец и помидор, нарежь небольшими кусочками.','Смешай овощи с небольшим количеством масла и подай рядом с гречкой и индейкой.']],
    l3:[20,['Отвари макароны в подсоленной воде по времени на упаковке, затем слей воду.','Промой консервированную фасоль и дай жидкости стечь.','Прогрей фасоль с томатным соусом на сковороде 4–5 минут.','Добавь макароны, перемешай и прогрей ещё минуту.']],
    l4:[20,['Промой красную чечевицу и поставь вариться на 12–15 минут.','Параллельно отвари рис; нарежь морковь и лук мелкими кубиками.','Потуши овощи на сковороде с небольшим количеством воды и масла 4–5 минут.','Смешай готовую чечевицу, рис и овощи, прогрей ещё минуту.']],
    l5:[35,['Разогрей духовку до 180 °C. Положи рыбу в форму, добавь немного соли и готовь 15–20 минут до полной готовности.','Картофель отвари или запеки до мягкости.','Тонко нашинкуй капусту и слегка помни руками, чтобы она стала мягче.','Подай рыбу с картофелем и капустным салатом.']],
    l6:[20,['Отвари лапшу по инструкции и слей воду.','Нарежь тофу кубиками и обжарь на сковороде до золотистой корочки.','Добавь овощную смесь и готовь до мягкости.','Влей соевый соус, перемешай с лапшой и прогрей ещё минуту.']],
    l7:[25,['Отвари картофель в кожуре или запеки до мягкости, затем нарежь кубиками.','Приготовь яйца вкрутую, остуди и нарежь.','Нашинкуй капусту, натри морковь и смешай с небольшим количеством масла.','Соедини овощи с картофелем и яйцами, аккуратно перемешай.']],
    d1:[35,['Разогрей духовку до 180 °C. Выложи рыбу в форму и запекай примерно 15–20 минут до полной готовности.','Нарежь картофель дольками и запеки рядом с рыбой либо отвари до мягкости.','Приготовь брокколи на пару или отвари 4–5 минут, чтобы она оставалась упругой.','Добавь растительное масло и подай горячим.']],
    d2:[30,['Промой гречку и отвари до готовности.','Нарежь куриное филе небольшими кусочками.','Приготовь курицу на сковороде до полной готовности внутри.','Добавь овощную смесь, накрой крышкой и прогрей до мягкости. Подай с гречкой.']],
    d3:[15,['Разбей яйца в миску и взбей вилкой до однородности.','Нарежь помидор, промой и обсуши шпинат.','Слегка прогрей овощи на сковороде, влей яйца и готовь под крышкой на слабом огне до полного схватывания.','Подавай с хлебом.']],
    d4:[20,['Залей булгур кипятком или отвари по инструкции; пока он готовится, нарежь кабачок и помидор.','Потуши овощи на сковороде 6–8 минут до мягкости.','Добавь уже готовый нут, прогрей ещё 2–3 минуты и подай с булгуром.']],
    d5:[20,['Поставь гречку вариться; пока она готовится, нарежь тофу кубиками.','Обжарь тофу на сковороде 5–6 минут до золотистой корочки.','Добавь овощную смесь, прогрей до мягкости и подай с гречкой.']],
    d6:[20,['Нарежь картофель мелким кубиком, морковь и лук — небольшими кусочками.','Выложи картофель на сковороду с 2–3 ложками воды, накрой крышкой и готовь 8–10 минут.','Добавь морковь, лук и фасоль, туши ещё 5–7 минут до мягкости.']],
    d7:[30,['Отвари макароны до состояния, указанного на упаковке, и слей воду.','Нарежь индейку небольшими кусочками и приготовь на сковороде до полной готовности внутри.','Добавь овощную смесь и прогрей до мягкости.','Смешай с макаронами и подавай.']],
    b8:[18,['Нарежь лук и сладкий перец небольшими кубиками. Помидор нарежь или натри.','Разогрей масло на сковороде, обжарь лук и перец 3–4 минуты до мягкости.','Добавь помидор, туши 5–6 минут и сделай две небольшие лунки.','Разбей яйца в лунки, накрой крышкой и готовь 4–6 минут до полной готовности белка. Подай с хлебом.']],
    b9:[25,['Разомни творог вилкой, добавь яйцо и измельчённые овсяные хлопья. Перемешай до густой массы.','Сформируй небольшие сырники влажными руками. Если масса слишком мягкая, дай ей постоять 5 минут.','Готовь на антипригарной сковороде на слабом огне по 3–4 минуты с каждой стороны до полной готовности.','Подай с йогуртом и ягодами.']],
    b10:[15,['Разомни банан вилкой до пюре.','Добавь овсяные хлопья, соевый напиток и молотые семена льна. Перемешай и оставь на 3 минуты.','Выкладывай небольшие порции на разогретую антипригарную сковороду.','Жарь на слабом огне примерно по 2 минуты с каждой стороны.']],
    b11:[7,['Подсуши хлеб в тостере или на сухой сковороде.','Равномерно распредели хумус по ломтикам.','Нарежь помидор и огурец тонкими ломтиками, выложи сверху.']],
    b12:[20,['Промой пшено горячей водой, затем залей водой и провари 5 минут; слей воду.','Добавь соевый напиток и мелко нарезанную тыкву.','Вари на слабом огне 12–15 минут, периодически помешивая, пока пшено и тыква не станут мягкими.','Добавь корицу и дай каше постоять под крышкой 2 минуты.']],
    b13:[5,['Насыпь овсяные хлопья в миску и добавь соевый йогурт.','Нарежь яблоко небольшими кусочками.','Добавь яблоко и измельчённые орехи, перемешай.']],
    b14:[12,['Разомни тофу вилкой на небольшие кусочки.','Разогрей масло, добавь тофу и прогревай 3–4 минуты.','Добавь нарезанный помидор и шпинат, готовь ещё 3–4 минуты.','Подавай с хлебом.']],
    s8:[5,['Положи соевый йогурт, ягоды и кусочки банана в чашу блендера.','Взбей до однородной консистенции.','Если смузи слишком густой, добавь немного воды и перемешай ещё раз.']],
    s9:[5,['Вымой и очисти морковь.','Нарежь её длинными брусочками.','Подавай с хумусом как соусом для макания.']],
    s10:[18,['Разрежь яблоко пополам и удали сердцевину.','Смешай овсяные хлопья с корицей и небольшим количеством воды.','Наполни яблоко смесью и запекай при 180 °C около 12–15 минут до мягкости.']],
    s11:[15,['Мелко нарежь финики; если они сухие, залей тёплой водой на 5 минут и обсуши.','Смешай финики с овсяными хлопьями и молотыми семенами льна.','Сформируй небольшие шарики влажными руками.','Убери в холодильник на 10 минут, чтобы они держали форму.']],
    s12:[5,['Вымой огурец и нарежь толстыми кружками или длинными ломтиками.','Разложи сверху небольшие порции хумуса.','Посыпь кунжутом и подавай сразу.']],
    s13:[3,['Очисти апельсин и раздели на дольки.','Отмерь порцию тыквенных семечек.','Подавай вместе; семечки тщательно пережёвывай.']],
    s14:[5,['Подсуши хлеб на сухой сковороде или в тостере.','Намажь тонким слоем арахисовую пасту.','Добавь нарезанный банан. Не используй при аллергии на арахис.']],
    l8:[30,['Промой булгур и отвари по инструкции на упаковке.','Индейку нарежь полосками, приготовь на сковороде до полной готовности внутри.','Нарежь огурец и помидор, промой шпинат.','Выложи булгур, индейку и овощи в миску, добавь масло.']],
    l9:[20,['Промой рис и отвари до мягкости, затем дай стечь лишней воде.','Слей жидкость с тунца и кукурузы.','Смешай рис с тунцом и кукурузой.','Добавь нарезанный огурец и подавай тёплым или охлаждённым.']],
    l10:[20,['Нарежь куриное филе небольшими полосками и приготовь на сковороде до полной готовности.','Смешай йогурт с небольшим количеством соли и перца, если они есть.','Нарежь огурец и помидор.','Выложи курицу и овощи на лаваш, добавь соус, сверни плотным рулетом.']],
    l11:[20,['Отвари рис почти до готовности. Слей жидкость с фасоли.','Нарежь перец и лук небольшими кусочками.','Потуши перец и лук с томатным соусом 5–7 минут, добавь фасоль и рис.','Прогрей ещё 3–4 минуты до мягкости перца.']],
    l12:[20,['Нарежь кабачок, морковь и лук небольшими кубиками.','Обжарь лук и морковь на масле 3 минуты, добавь кабачок.','Добавь готовый нут и томатный соус, накрой крышкой.','Туши 10–12 минут до мягкости овощей, при необходимости добавь немного воды.']],
    l13:[20,['Промой гречку и отвари до готовности.','Нарежь шампиньоны и лук, обжарь их на сковороде до испарения жидкости.','Добавь нарезанный тофу и прогрей 3–4 минуты.','Смешай с гречкой и подавай.']],
    l14:[15,['Залей кускус кипятком в пропорции, указанной на упаковке, накрой на 5 минут.','Нарежь перец и помидор небольшими кубиками.','Разрыхли кускус вилкой, добавь нут и овощи.','Заправь маслом и лимонным соком.']],
    d8:[35,['Нарежь куриное филе и измельчи ножом или в блендере до фарша.','Добавь половину взбитого яйца, сформируй небольшие котлеты.','Готовь котлеты на антипригарной сковороде под крышкой на среднем-слабом огне до полной готовности внутри.','Отвари картофель, разомни с тёплым молоком. Подай с капустным салатом.']],
    d9:[25,['Промокни рыбу бумажным полотенцем, сбрызни лимонным соком.','Запеки при 180 °C примерно 15–20 минут или приготовь на пару до полной готовности.','Отвари рис и приготовь брокколи на пару или в небольшом количестве воды.','Подай рыбу с рисом и брокколи.']],
    d10:[20,['Отвари картофель до мягкости и яйцо вкрутую. Остуди.','Слей жидкость с тунца, нарежь огурец и помидор.','Нарежь картофель и яйцо, смешай с тунцом и овощами.','Добавь растительное масло и аккуратно перемешай.']],
    d11:[20,['Используй красную чечевицу: отвари её 10–12 минут и хорошо слей воду.','Разомни чечевицу, добавь овсяные хлопья, тёртую морковь и мелко нарезанный лук.','Сформируй небольшие котлеты и обжарь на небольшом количестве масла по 3 минуты с каждой стороны.','Подавай с нашинкованной капустой.']],
    d12:[20,['Нарежь тыкву мелким кубиком, чтобы она приготовилась быстрее.','Поставь булгур вариться по инструкции; параллельно потуши тыкву и лук на сковороде с небольшим количеством воды 10–12 минут.','Добавь готовый нут, прогрей 2–3 минуты.','Смешай с булгуром и подавай.']],
    d13:[20,['Поставь рис вариться; пока он готовится, нарежь тофу кубиками.','Обжарь тофу 4–5 минут, добавь томатный соус и немного воды.','Добавь шпинат и туши ещё 4–5 минут.','Подавай со свежесваренным рисом.']],
    d14:[20,['Натри кабачок, слегка отожми лишнюю жидкость.','Смешай овсяные хлопья с молотыми семенами льна и 2–3 столовыми ложками воды; дай постоять 5 минут.','Добавь кабачок и зелень, сформируй небольшие оладьи.','Обжарь на небольшом количестве масла по 3–4 минуты с каждой стороны. Подавай с соевым йогуртом.']]

  };
  const read = key => { try { return JSON.parse(localStorage.getItem(key)||'{}'); } catch(e) { return {}; } };
  const write = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch(e) {} };
  const plan = () => window.NUTRIX && window.NUTRIX.plan;
  const currentStore = () => plan() && plan().data.store || 'pyaterochka';
  const toast = message => window.NUTRIX && window.NUTRIX.showToast ? window.NUTRIX.showToast(message) : null;

  function ensureDialog(){
    if($('recipeDialog')) return;
    const dialog=document.createElement('dialog');dialog.id='recipeDialog';dialog.className='recipe-dialog';
    dialog.innerHTML='<div class="recipe-dialog-inner"><div class="recipe-dialog-head"><div><div class="eyebrow">РЕЦЕПТ NUTRIX</div><h2 id="recipeTitle"></h2><p id="recipeMeta"></p></div><button class="icon-button" id="recipeClose" type="button" aria-label="Закрыть">×</button></div><div class="recipe-dialog-section"><h3>Ингредиенты на порцию</h3><ul id="recipeIngredients"></ul></div><div class="recipe-dialog-section"><h3>Как приготовить</h3><ol id="recipeSteps"></ol></div><div class="recipe-video-wrap"><a id="recipeVideo" class="recipe-video-link" href="#" target="_blank" rel="noopener noreferrer">▶ Смотреть видео приготовления</a><p>Откроются видеоинструкции по этому блюду на YouTube.</p></div><p class="recipe-dialog-note">Проверяй готовность продуктов и учитывай индивидуальные аллергии. Для точной пищевой ценности сверяйся с упаковками.</p></div>';
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
    const video=$('recipeVideo');
    video.href='https://www.youtube.com/results?search_query='+encodeURIComponent(meal.recipe.name+' пошаговый рецепт приготовление');
    video.setAttribute('aria-label','Найти видео приготовления: '+meal.recipe.name);
    $('recipeDialog').showModal();
  }
  const restoredProgressPlans=new WeakSet();
  function progressStorageKey(p){return 'nutrix-meal-progress:'+(p.progressId||'unknown');}
  function completedCount(p){return Object.values(p.completedMeals||{}).filter(Boolean).length;}
  function totalMealCount(p){return (p.days||[]).reduce((sum,day)=>sum+(day.meals||[]).length,0);}
  function restoreMealProgress(p){
    if(restoredProgressPlans.has(p))return;
    const saved=read(progressStorageKey(p)),clean={};
    Object.entries(saved||{}).forEach(([key,value])=>{if(/^([0-6]):([0-4])$/.test(key)&&value===true)clean[key]=true;});
    p.completedMeals={...clean,...(p.completedMeals||{})};
    Object.keys(p.completedMeals).forEach(key=>{if(p.completedMeals[key]!==true)delete p.completedMeals[key];});
    write(progressStorageKey(p),p.completedMeals);restoredProgressPlans.add(p);
  }
  function updateMealProgressUI(){
    const p=plan();if(!p)return;
    restoreMealProgress(p);
    const done=completedCount(p),total=totalMealCount(p),percent=total?Math.round(done/total*100):0;
    const panel=$('mealWeekProgress');
    if(panel)panel.innerHTML='<div class="meal-week-top"><div><span class="eyebrow">ТВОЯ НЕДЕЛЯ</span><b>'+done+' из '+total+' блюд отмечено</b></div><strong>'+percent+'%</strong></div><div class="meal-week-track"><span style="width:'+percent+'%"></span></div><small>Отмечай блюда после приёма пищи. Прогресс сохраняется вместе с рационом.</small>';
    document.querySelectorAll('#daysGrid .day-card').forEach((card,index)=>{
      const day=p.days[index];if(!day)return;
      const dayDone=day.meals.reduce((sum,meal,mealIndex)=>sum+(p.completedMeals[index+':'+mealIndex]?1:0),0);
      const label=card.querySelector('.day-head span');
      const labelText=dayDone+' / '+day.meals.length+' выполнено';
      if(label&&label.textContent!==labelText){label.textContent=labelText;label.classList.add('day-progress-label');}
      day.meals.forEach((meal,mealIndex)=>{
        const row=card.querySelectorAll('.meal-row')[mealIndex];if(!row)return;
        const button=row.querySelector('.meal-check-button');if(!button)return;
        const checked=!!p.completedMeals[index+':'+mealIndex];
        button.classList.toggle('is-complete',checked);button.setAttribute('aria-pressed',String(checked));
        const buttonText=checked?'Готово ✓':'Отметить';
        if(button.textContent!==buttonText)button.textContent=buttonText;
        button.title=checked?'Убрать отметку о съеденном блюде':'Отметить блюдо как съеденное';
      });
    });
  }
  function ensureMealProgressPanel(){
    const grid=$('daysGrid');if(!grid)return;
    let panel=$('mealWeekProgress');
    if(!panel){panel=document.createElement('section');panel.id='mealWeekProgress';panel.className='meal-week-progress';grid.parentNode.insertBefore(panel,grid);}
  }
  function enhanceMeals(){
    const p=plan();if(!p)return;
    restoreMealProgress(p);ensureMealProgressPanel();
    document.querySelectorAll('#daysGrid .meal-row').forEach(row=>{
      const replace=row.querySelector('.replace-meal');if(!replace)return;
      let actions=row.querySelector('.meal-action-buttons');
      if(!actions){actions=document.createElement('div');actions.className='meal-action-buttons';replace.parentNode.insertBefore(actions,replace);}
      if(!actions.querySelector('.recipe-details')){
        const detail=document.createElement('button');detail.type='button';detail.className='recipe-details';detail.textContent='Рецепт';detail.title='Посмотреть ингредиенты и способ приготовления';detail.dataset.day=replace.dataset.day;detail.dataset.meal=replace.dataset.meal;actions.appendChild(detail);
      }
      if(!actions.querySelector('.meal-check-button')){
        const check=document.createElement('button');check.type='button';check.className='meal-check-button';check.dataset.day=replace.dataset.day;check.dataset.meal=replace.dataset.meal;check.textContent='Отметить';actions.appendChild(check);
      }
      if(replace.parentNode!==actions)actions.appendChild(replace);
    });
    document.querySelectorAll('#daysGrid .day-card').forEach((card,index)=>{
      const summary=card.querySelector('.day-foot span'),total=p.totals[index];if(!summary||!total)return;
      const nextText=p.adult?total.kcal+' ккал · Б '+total.p+' г · Ж '+total.f+' г · У '+total.c+' г':'Порции — примерные';
      if(summary.textContent!==nextText)summary.textContent=nextText;
    });
    updateMealProgressUI();
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
  // Do not observe childList mutations here: enhanceMeals updates text nodes
  // inside #daysGrid, which would retrigger the observer indefinitely.
  // The core app emits this event after every initial or replacement plan render.
  const days=$('daysGrid');
  window.addEventListener('nutrix:plan-rendered',runEnhancements);
  runEnhancements();
  registerOffline();
  if(days)days.addEventListener('click',event=>{
    const check=event.target.closest('.meal-check-button');
    if(check){
      const p=plan();if(!p)return;
      const day=Number(check.dataset.day),meal=Number(check.dataset.meal),key=day+':'+meal;
      if(!p.days[day]||!p.days[day].meals[meal])return;
      if(p.completedMeals[key])delete p.completedMeals[key];else p.completedMeals[key]=true;
      write(progressStorageKey(p),p.completedMeals);updateMealProgressUI();
      window.dispatchEvent(new CustomEvent('nutrix:meal-progress-changed',{detail:{plan:p,day,meal,completed:!!p.completedMeals[key]}}));
      return;
    }
    const button=event.target.closest('.recipe-details');if(button)openRecipe(Number(button.dataset.day),Number(button.dataset.meal));
  });
})();