'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const dayNames = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
  const mealNames = {breakfast:'Завтрак',snack:'Перекус',snack2:'Перекус',lunch:'Обед',dinner:'Ужин'};
  let activeSession = null, restTimer = null, restEnd = 0, restRemaining = 0;
  const getNutritionPlan = () => window.NUTRIX && window.NUTRIX.plan || null;
  const getTrainingPlan = () => window.NUTRIX_TRAINING && window.NUTRIX_TRAINING.plan || null;
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const todayIndex = () => (new Date().getDay()+6)%7;
  function weekStartKey(){
    const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function toast(message){
    if(window.NUTRIX&&typeof window.NUTRIX.showToast==='function')window.NUTRIX.showToast(message);
  }
  function mealDone(plan,day,meal){
    return !!(plan&&plan.completedMeals&&plan.completedMeals[day+':'+meal]);
  }
  function countMealsDone(plan){
    if(!plan||!plan.completedMeals)return 0;
    return Object.keys(plan.completedMeals).filter(k=>plan.completedMeals[k]).length;
  }
  function countWorkoutsDone(plan){
    if(!plan||!plan.completedWorkouts)return 0;
    const prefix=weekStartKey()+':';
    return Object.keys(plan.completedWorkouts).filter(k=>k.startsWith(prefix)).length;
  }
  function renderStats(nutrition,training,dayIndex){
    const stats=$('fitnessStats');if(!stats)return;
    const day=nutrition&&nutrition.days&&nutrition.days[dayIndex];
    const meals=day&&Array.isArray(day.meals)?day.meals:[];
    const done=meals.filter((m,i)=>mealDone(nutrition,dayIndex,i)).length;
    const adult=!!(nutrition&&nutrition.adult&&nutrition.calc&&nutrition.data&&nutrition.data.age>=18&&!nutrition.data.medical);
    let proteinHtml;
    if(adult){
      const eaten=meals.reduce((sum,m,i)=>sum+(mealDone(nutrition,dayIndex,i)?Number(m.p)||0:0),0);
      const target=Math.max(1,Number(nutrition.calc.protein)||1);
      const pct=Math.min(100,Math.round(eaten/target*100));
      proteinHtml='<div class="fitness-stat-card"><div class="fitness-stat-top"><span>Белок за день</span><span>🥚</span></div><b>'+eaten+' <small>/ '+target+' г</small></b><div class="fitness-mini-track"><span style="width:'+pct+'%"></span></div><p>По отмеченным приёмам пищи</p></div>';
    }else{
      proteinHtml='<div class="fitness-stat-card"><div class="fitness-stat-top"><span>Регулярность питания</span><span>🍽️</span></div><b>'+done+' <small>/ '+meals.length+' приёмов</small></b><div class="fitness-mini-track"><span style="width:'+(meals.length?Math.round(done/meals.length*100):0)+'%"></span></div><p>Без подсчёта граммов и жёстких целей</p></div>';
    }
    const workoutsDone=countWorkoutsDone(training);
    const workoutsPlanned=training&&Array.isArray(training.workouts)?training.workouts.length:0;
    const workoutHtml='<div class="fitness-stat-card"><div class="fitness-stat-top"><span>Тренировки за неделю</span><span>🏃</span></div><b>'+workoutsDone+' <small>/ '+workoutsPlanned+'</small></b><div class="fitness-mini-track"><span style="width:'+(workoutsPlanned?Math.min(100,Math.round(workoutsDone/workoutsPlanned*100)):0)+'%"></span></div><p>'+(workoutsPlanned?'Отмечай завершённые занятия':'План тренировок ещё не создан')+'</p></div>';
    const mealsHtml='<div class="fitness-stat-card"><div class="fitness-stat-top"><span>Сегодня по меню</span><span>🌿</span></div><b>'+done+' <small>/ '+meals.length+'</small></b><div class="fitness-mini-track"><span style="width:'+(meals.length?Math.round(done/meals.length*100):0)+'%"></span></div><p>Приёмы пищи отмечаются по факту</p></div>';
    stats.innerHTML=proteinHtml+mealsHtml+workoutHtml;
  }
  function renderMeals(plan,dayIndex){
    const host=$('fitnessMeals'),foot=$('fitnessMealFoot');
    if(!host)return;
    const day=plan&&plan.days&&plan.days[dayIndex];
    if(!day||!day.meals||!day.meals.length){
      host.innerHTML='<p class="fitness-muted">Рацион на сегодня ещё не составлен. Сначала создай меню на неделю.</p>';
      if(foot)foot.textContent='';
      return;
    }
    host.innerHTML=day.meals.map((meal,index)=>{
      const done=mealDone(plan,dayIndex,index);
      const label=mealNames[meal.type]||'Приём пищи';
      const meta=plan.adult?'Б '+(Number(meal.p)||0)+' г · ≈ '+(Number(meal.kcal)||0)+' ккал':'Обычный приём пищи';
      return '<div class="fitness-meal-row'+(done?' is-done':'')+'"><div class="fitness-meal-icon">'+(meal.recipe&&meal.recipe.icon?escapeHtml(meal.recipe.icon):'🍽️')+'</div><div class="fitness-meal-info"><b>'+escapeHtml(label)+'</b><span>'+escapeHtml(meal.recipe&&meal.recipe.name||'Блюдо')+'</span><small>'+meta+'</small></div><button class="fitness-meal-toggle" type="button" data-action="toggle-meal" data-day="'+dayIndex+'" data-meal="'+index+'" aria-pressed="'+done+'">'+(done?'Готово ✓':'Съел(а)')+'</button></div>';
    }).join('');
    if(foot)foot.textContent='Отмечай только то, что действительно съел(а). Можно изменить отметку в любой момент.';
  }
  function renderWorkout(training,dayIndex){
    const host=$('fitnessWorkoutContent');if(!host)return;
    if(!training||!Array.isArray(training.workouts)||!training.workouts.length){
      host.innerHTML='<p class="fitness-muted">Тренировочного плана пока нет.</p><a class="fitness-cta" href="#training">Составить домашний план →</a>';
      return;
    }
    const index=training.workouts.findIndex(w=>w.day===dayNames[dayIndex]);
    if(index<0){
      const next=training.workouts.find(w=>{
        const idx=dayNames.indexOf(w.day);
        return idx>dayIndex;
      })||training.workouts[0];
      host.innerHTML='<div class="fitness-rest-state"><span>🧘</span><h4>Сегодня день восстановления</h4><p>Отдых — часть тренировочного плана. Можно спокойно пройтись или немного подвигаться по самочувствию.</p><small>Следующее занятие: '+escapeHtml(next.day)+' · '+escapeHtml(next.title)+'</small></div>';
      return;
    }
    const workout=training.workouts[index],key=weekStartKey()+':'+index;
    const completed=!!(training.completedWorkouts&&training.completedWorkouts[key]);
    host.innerHTML='<div class="fitness-workout-summary"><div class="fitness-workout-badge">'+(workout.recovery?'🌤️ Лёгкий день':'💪 Силовая практика')+'</div><h4>'+escapeHtml(workout.title)+'</h4><p>'+workout.exercises.length+' упражнений · около '+escapeHtml(workout.duration)+' минут</p><div class="fitness-workout-foot">'+(completed?'<span class="fitness-completed-label">Занятие отмечено ✓</span>':'<span>Двигайся в комфортном темпе</span>')+'<button class="fitness-start-workout" type="button" data-action="start-workout" data-index="'+index+'">'+(completed?'Повторить':'Начать занятие')+' →</button></div></div>';
  }
  function mealSuggestion(day,kind){
    if(!day||!Array.isArray(day.meals)||!day.meals.length)return null;
    const meals=day.meals.slice();
    if(kind==='before'){
      const candidates=meals.filter(m=>m.type==='snack'||m.type==='snack2'||m.type==='breakfast'||m.type==='lunch');
      return (candidates.length?candidates:meals).sort((a,b)=>((Number(b.c)||0)+(Number(b.p)||0)*1.5)-((Number(a.c)||0)+(Number(a.p)||0)*1.5))[0];
    }
    return meals.sort((a,b)=>(Number(b.p)||0)-(Number(a.p)||0))[0];
  }
  function renderTiming(nutrition,training,dayIndex){
    const host=$('fitnessTiming');if(!host)return;
    const day=nutrition&&nutrition.days&&nutrition.days[dayIndex];
    const hasWorkout=training&&training.workouts&&training.workouts.some(w=>w.day===dayNames[dayIndex]);
    if(!hasWorkout){
      host.innerHTML='<p class="fitness-muted">В день занятия можно выбрать обычный приём пищи с углеводами и белком до тренировки, а после — следующий полноценный приём пищи.</p>';
      return;
    }
    const before=mealSuggestion(day,'before'),after=mealSuggestion(day,'after');
    host.innerHTML='<div class="fitness-timing-row"><span>Перед занятием</span><b>'+(before?escapeHtml(before.recipe.name):'Обычный перекус')+'</b><small>Если удобно — примерно за 1–3 часа. Не тренируйся через голод или тяжесть.</small></div><div class="fitness-timing-row"><span>После занятия</span><b>'+(after?escapeHtml(after.recipe.name):'Следующий обычный приём пищи')+'</b><small>Полноценная еда с белком и углеводами. Специальное спортивное питание не обязательно.</small></div>';
  }
  function renderWeek(nutrition,training){
    const host=$('fitnessWeekSummary');if(!host)return;
    const mealsTotal=nutrition&&nutrition.days?nutrition.days.reduce((sum,d)=>sum+(d.meals||[]).length,0):0;
    const mealsDone=countMealsDone(nutrition);
    const workoutsTotal=training&&training.workouts?training.workouts.length:0;
    const workoutsDone=countWorkoutsDone(training);
    const pct=workoutsTotal?Math.min(100,Math.round(workoutsDone/workoutsTotal*100)):0;
    host.innerHTML='<div class="fitness-week-line"><span>Завершённые тренировки</span><b>'+workoutsDone+' из '+workoutsTotal+'</b></div><div class="fitness-week-track"><span style="width:'+pct+'%"></span></div><div class="fitness-week-line"><span>Отмеченные приёмы пищи</span><b>'+mealsDone+' из '+mealsTotal+'</b></div><p>Регулярность важнее идеального выполнения. Пропущенный день не обнуляет твой прогресс.</p>';
  }
  function render(){
    const nutrition=getNutritionPlan(),training=getTrainingPlan();
    const empty=$('fitnessEmpty'),dashboard=$('fitnessDashboard');
    if(!empty||!dashboard)return;
    const dayIndex=todayIndex();
    $('fitnessTodayTitle').textContent=dayNames[dayIndex];
    $('fitnessTodaySubtitle').textContent='День '+(dayIndex+1)+' из 7 · планы обновляются автоматически';
    const hasNutrition=!!(nutrition&&Array.isArray(nutrition.days));
    const hasTraining=!!(training&&Array.isArray(training.workouts));
    empty.hidden=hasNutrition||hasTraining;
    dashboard.hidden=!(hasNutrition||hasTraining);
    if(!hasNutrition&&!hasTraining)return;
    renderStats(nutrition,training,dayIndex);
    renderMeals(nutrition,dayIndex);
    renderWorkout(training,dayIndex);
    renderTiming(nutrition,training,dayIndex);
    renderWeek(nutrition,training);
  }
  function createWorkoutDialog(){
    let dialog=$('fitnessWorkoutDialog');if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.id='fitnessWorkoutDialog';dialog.className='fitness-workout-dialog';
    dialog.innerHTML='<div class="fitness-dialog-inner"><div class="fitness-dialog-head"><div><span class="fitness-card-kicker">NUTRIX / ТРЕНИРОВКА</span><h2 id="fitnessDialogTitle">Тренировка</h2><p id="fitnessDialogSubtitle"></p></div><button id="fitnessDialogClose" class="fitness-dialog-close" type="button" aria-label="Закрыть">×</button></div><div class="fitness-dialog-warmup">🌿 Начни с лёгкой разминки 5 минут: марш на месте, круги плечами и мягкие движения суставами.</div><div class="fitness-exercise-progress"><span id="fitnessExerciseCounter"></span><b id="fitnessSetCounter"></b></div><div class="fitness-exercise-track"><span id="fitnessExerciseFill"></span></div><article class="fitness-exercise-card"><span class="fitness-exercise-icon">💪</span><h3 id="fitnessExerciseName"></h3><b id="fitnessExerciseTarget"></b><p id="fitnessExerciseNote"></p><div class="fitness-exercise-options"><div><small>Проще</small><span id="fitnessExerciseEasier"></span></div><div><small>Вариант сложнее</small><span id="fitnessExerciseHarder"></span></div></div></article><div id="fitnessRestPanel" class="fitness-rest-panel" hidden><div><small>ОТДЫХ МЕЖДУ ПОДХОДАМИ</small><b id="fitnessRestTime">00:00</b></div><button id="fitnessRestSkip" type="button">Пропустить отдых</button></div><div class="fitness-dialog-actions"><button id="fitnessSetDone" class="fitness-primary-action" type="button">Подход выполнен</button><button id="fitnessNextExercise" class="fitness-secondary-action" type="button" hidden>Следующее упражнение →</button><button id="fitnessFinishWorkout" class="fitness-primary-action" type="button" hidden>Завершить тренировку ✓</button></div><p class="fitness-dialog-foot">Оставляй запас повторений и сохраняй чистую технику. При боли остановись.</p></div>';
    document.body.appendChild(dialog);
    $('fitnessDialogClose').addEventListener('click',()=>dialog.close());
    $('fitnessSetDone').addEventListener('click',markSetDone);
    $('fitnessNextExercise').addEventListener('click',nextExercise);
    $('fitnessFinishWorkout').addEventListener('click',finishWorkout);
    $('fitnessRestSkip').addEventListener('click',skipRest);
    dialog.addEventListener('close',stopRestTimer);
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    return dialog;
  }
  function stopRestTimer(){
    if(restTimer){clearInterval(restTimer);restTimer=null;}
    restEnd=0;restRemaining=0;
    if($('fitnessRestPanel'))$('fitnessRestPanel').hidden=true;
    if($('fitnessSetDone'))$('fitnessSetDone').disabled=false;
  }
  function formatTimer(seconds){const s=Math.max(0,Number(seconds)||0);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function updateRestTimer(){
    if(!restEnd)return;
    restRemaining=Math.max(0,Math.ceil((restEnd-Date.now())/1000));
    $('fitnessRestTime').textContent=formatTimer(restRemaining);
    if(restRemaining<=0){stopRestTimer();renderWorkoutStep();}
  }
  function startRestTimer(seconds){
    stopRestTimer();restRemaining=Math.max(1,Number(seconds)||60);restEnd=Date.now()+restRemaining*1000;
    $('fitnessRestPanel').hidden=false;$('fitnessSetDone').disabled=true;
    $('fitnessRestTime').textContent=formatTimer(restRemaining);
    restTimer=setInterval(updateRestTimer,250);
  }
  function skipRest(){stopRestTimer();renderWorkoutStep();}
  function renderWorkoutStep(){
    if(!activeSession)return;
    const w=activeSession.workout,item=w.exercises[activeSession.exerciseIndex],total=w.exercises.length;
    $('fitnessDialogTitle').textContent=w.title;
    $('fitnessDialogSubtitle').textContent=w.day+' · '+w.duration+' минут · упражнение '+(activeSession.exerciseIndex+1)+' из '+total;
    $('fitnessExerciseCounter').textContent='Упражнение '+(activeSession.exerciseIndex+1)+' / '+total;
    $('fitnessSetCounter').textContent='Подходы '+activeSession.setsDone+' / '+item.sets;
    $('fitnessExerciseFill').style.width=Math.round(activeSession.exerciseIndex/Math.max(1,total)*100)+'%';
    $('fitnessExerciseName').textContent=item.name;
    $('fitnessExerciseTarget').textContent=item.sets+' × '+item.target;
    $('fitnessExerciseNote').textContent=item.note;
    $('fitnessExerciseEasier').textContent=item.easier;
    $('fitnessExerciseHarder').textContent=item.harder;
    $('fitnessSetDone').textContent=activeSession.setsDone>=item.sets?'Все подходы выполнены ✓':'Отметить подход '+(activeSession.setsDone+1)+' / '+item.sets;
    $('fitnessSetDone').disabled=activeSession.setsDone>=item.sets||!!restTimer;
    const last=activeSession.exerciseIndex===total-1;
    $('fitnessNextExercise').hidden=last||activeSession.setsDone<item.sets;
    $('fitnessFinishWorkout').hidden=!last||activeSession.setsDone<item.sets;
    $('fitnessNextExercise').disabled=activeSession.setsDone<item.sets;
    $('fitnessFinishWorkout').disabled=activeSession.setsDone<item.sets;
  }
  function markSetDone(){
    if(!activeSession||restTimer)return;
    const item=activeSession.workout.exercises[activeSession.exerciseIndex];
    if(activeSession.setsDone>=item.sets)return;
    activeSession.setsDone++;
    if(activeSession.setsDone<item.sets)startRestTimer(item.rest);
    renderWorkoutStep();
  }
  function nextExercise(){
    if(!activeSession)return;
    const item=activeSession.workout.exercises[activeSession.exerciseIndex];
    if(activeSession.setsDone<item.sets)return;
    stopRestTimer();activeSession.exerciseIndex++;activeSession.setsDone=0;renderWorkoutStep();
  }
  async function finishWorkout(){
    if(!activeSession)return;
    const elapsed=Math.max(1,Math.round((Date.now()-activeSession.startedAt)/60000));
    const index=activeSession.index,exerciseCount=activeSession.workout.exercises.length;
    stopRestTimer();
    const api=window.NUTRIX_TRAINING;
    const result=api&&typeof api.completeWorkout==='function'?await api.completeWorkout(index,{durationMinutes:elapsed,exerciseCount}):{ok:false,error:'Не удалось сохранить тренировку.'};
    const dialog=$('fitnessWorkoutDialog');if(dialog&&dialog.open)dialog.close();
    activeSession=null;render();
    if(result&&result.ok)toast('Тренировка сохранена. Хорошая работа!');
    else toast((result&&result.error)||'Тренировка завершена, но не сохранена.');
  }
  function startWorkout(index){
    const training=getTrainingPlan();if(!training||!training.workouts[index])return;
    const workout=training.workouts[index];
    if(!Array.isArray(workout.exercises)||!workout.exercises.length)return toast('В этом занятии нет упражнений.');
    activeSession={index,workout,exerciseIndex:0,setsDone:0,startedAt:Date.now()};
    stopRestTimer();
    const dialog=createWorkoutDialog();renderWorkoutStep();
    if(!dialog.open)dialog.showModal();
  }
  const hub=$('fitness');
  if(hub)hub.addEventListener('click',event=>{
    const toggle=event.target.closest('[data-action="toggle-meal"]');
    if(toggle){
      const day=Number(toggle.dataset.day),meal=Number(toggle.dataset.meal);
      const source=document.querySelector('.meal-check-button[data-day="'+day+'"][data-meal="'+meal+'"]');
      if(source)source.click();
      else{
        const plan=getNutritionPlan(),key=day+':'+meal;
        if(plan){if(!plan.completedMeals)plan.completedMeals={};if(plan.completedMeals[key])delete plan.completedMeals[key];else plan.completedMeals[key]=true;try{localStorage.setItem('nutrix-meal-progress:'+(plan.progressId||'unknown'),JSON.stringify(plan.completedMeals));}catch(e){}window.dispatchEvent(new CustomEvent('nutrix:meal-progress-changed',{detail:{plan,day,meal,completed:!!plan.completedMeals[key]}}));}
      }
      setTimeout(render,40);return;
    }
    const start=event.target.closest('[data-action="start-workout"]');
    if(start)startWorkout(Number(start.dataset.index));
  });
  ['nutrix:plan-rendered','nutrix:meal-progress-changed','nutrix:training-plan-rendered','nutrix:workout-completed','nutrix:auth-changed'].forEach(name=>window.addEventListener(name,render));
  render();
})();