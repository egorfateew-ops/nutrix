'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const GUEST_KEY = 'nutrix-training-plan-v1:guest';
  let currentPlan = null, cloudSyncBusy = false;
  const cloud = () => window.NUTRIX_CLOUD || null;
  const storageKey = () => cloud() && cloud().userId ? 'nutrix-training-plan-v1:user:' + cloud().userId : GUEST_KEY;
  const number = id => $(id).value.trim() === '' ? null : Number($(id).value);
  const expLabel = {beginner:'начинаю с нуля',returning:'возвращаюсь после перерыва',regular:'тренируюсь регулярно'};
  const goalLabel = {general:'общая физическая форма',strength:'развитие силы',endurance:'выносливость',mobility:'подвижность и контроль тела'};
  const formData = () => ({
    age:number('trainingAge'),height:number('trainingHeight'),weight:number('trainingWeight'),
    experience:$('trainingExperience').value,goal:$('trainingGoal').value,
    frequency:Number($('trainingFrequency').value),duration:Number($('trainingDuration').value),
    pushups:number('trainingPushups'),squats:number('trainingSquats'),plank:number('trainingPlank'),
    limitations:$('trainingLimitations').checked
  });
  function status(id,text,error){
    $(id).textContent=text||'';
    $(id).classList.toggle('is-error',!!error);
  }
  function validate(d){
    if(!Number.isInteger(d.age)||d.age<13||d.age>100)return 'Укажи возраст от 13 до 100 лет.';
    if(d.height!==null&&(d.height<100||d.height>230))return 'Рост должен быть от 100 до 230 см.';
    if(d.weight!==null&&(d.weight<30||d.weight>250))return 'Вес должен быть от 30 до 250 кг.';
    if(d.pushups!==null&&(!Number.isInteger(d.pushups)||d.pushups<0||d.pushups>100))return 'Отжимания: укажи целое число от 0 до 100.';
    if(d.squats!==null&&(!Number.isInteger(d.squats)||d.squats<0||d.squats>150))return 'Приседания: укажи целое число от 0 до 150.';
    if(d.plank!==null&&(!Number.isInteger(d.plank)||d.plank<0||d.plank>300))return 'Планка: укажи целое число от 0 до 300 секунд.';
    if(d.limitations)return 'Ты отметил травму, боль или медицинские ограничения. Сначала согласуй упражнения со специалистом — подбирать нагрузку вслепую не будем.';
    return '';
  }
  function ex(name,target,note,easier,harder,sets,rest,recovery){
    return {name,target,note,easier,harder,sets:sets||2,rest:rest||60,recovery:!!recovery};
  }
  function push(d,sets,light){
    const n=d.pushups;
    const name=n!==null?(n<=3?'Отжимания от стены':n<=8?'Отжимания с колен':'Отжимания от пола')
      :(d.experience==='beginner'?'Отжимания от стены':d.experience==='returning'?'Отжимания с колен':'Отжимания от пола');
    let target=name==='Отжимания от стены'?'8–12 повторений':name==='Отжимания с колен'?(d.goal==='strength'?'5–8 повторений':'6–10 повторений')
      :(n!==null&&n<=15?'5–8 повторений':d.goal==='endurance'?'10–12 повторений':'6–10 повторений');
    if(light)target=name==='Отжимания от пола'?'4–6 повторений':'6–8 повторений';
    const easier=name==='Отжимания от стены'?'Подойди ближе к стене и сократи амплитуду.':name==='Отжимания с колен'?'Перейди к отжиманиям от стены.':'Перейди к отжиманиям с колен.';
    return ex(name,target,'Корпус напряжён, поясница не провисает. Остановись до потери чистой техники.',easier,'Замедли опускание до 3 секунд или добавь паузу; не гонись за максимумом.',sets,90);
  }
  function squat(d,sets){
    const low=d.squats!==null&&d.squats<8,slow=d.squats!==null&&d.squats>25;
    return ex(low?'Неглубокие приседания':slow?'Медленные приседания':'Приседания с весом тела',
      low?'6–8 повторений':d.goal==='endurance'?'12–15 повторений':'8–12 повторений',
      'Стопы остаются на полу, колени движутся по линии носков. Глубина комфортная.',
      'Уменьши глубину и двигайся медленнее.','Опускайся 3 секунды, сохраняя контроль.',sets,75);
  }
  function plank(d,sets){
    const short=d.plank!==null?d.plank<20:d.experience==='beginner';
    return ex(short?'Планка с колен':'Планка на предплечьях',
      short?'10–20 секунд':d.plank!==null&&d.plank>45?'25–40 секунд':'20–30 секунд',
      'Держи корпус ровно и дыши. Закончи подход до провисания поясницы.',
      'Сократи время до 8–10 секунд.','Добавляй по 3–5 секунд только при ровной технике.',sets,60);
  }
  function workout(d,code,day,baseSets,count){
    const light=code==='D',sets=light?1:baseSets;
    let list=[];
    if(d.goal==='mobility'&&code!=='D')list=[
      ex('Кошка-корова','8–10 плавных циклов','Мягко двигай позвоночником в комфортной амплитуде, без боли.','Сократи амплитуду.','Замедли движение.',1,30),
      ex('Скольжение руками по стене','8–12 повторений','Не поднимай плечи к ушам, двигайся только в комфортной амплитуде.','Сократи амплитуду.','Добавь паузу наверху.',2,30),
      ex('Птица-собака','6–8 на сторону','Сохраняй устойчивый таз, не прогибай поясницу.','Вытягивай по одной конечности.','Пауза 3 секунды.',2,45),
      ex('Ягодичный мост','10–12 повторений','Плавно поднимай таз за счёт ягодиц.','Сократи амплитуду.','Добавь паузу 2 секунды.',2,45),
      ex('Приседания с комфортной амплитудой','8–10 повторений','Стопы на полу, колени направлены по линии носков.','Сократи глубину.','Замедли опускание.',2,45),
      ex('Марш на месте','60 секунд','Спокойный темп и ровное дыхание.','Снизь темп.','Добавь немного темпа без прыжков.',1,20)
    ];
    else if(code==='A')list=[
      push(d,sets),squat(d,sets),
      ex('Ягодичный мост лёжа','10–15 повторений','Поднимай таз за счёт ягодиц, не переразгибай поясницу.','Уменьши высоту подъёма.','Задержись наверху на 2 секунды.',sets),
      ex('Разведения рук лёжа на животе (W)','8–12 повторений','Лоб направлен в пол; мягко своди лопатки, не задирай голову.','Сократи амплитуду.','Задержи руки в верхней точке на 2 секунды.',sets),
      ex('Мёртвый жук','6–10 на сторону','Поясница спокойно касается пола; двигай противоположными рукой и ногой.','Двигай только ногами или только руками.','Замедли движение на 3 секунды.',sets),
      ex('Подъёмы на носки стоя','12–20 повторений','Поднимайся плавно, без раскачки.','Сделай меньше повторений.','Добавь паузу наверху.',Math.max(1,sets-1))
    ];
    else if(code==='B')list=[
      ex('Обратные выпады','6–10 на каждую ногу','Шагай назад, корпус устойчивый, глубина комфортная.','Делай неглубокие выпады.','Опускайся медленно 3 секунды.',sets,75),
      ex('Отжимания лопатками у стены','8–12 повторений','Локти почти прямые; мягко своди и разводи лопатки.','Уменьши амплитуду.','Добавь паузу в сведении лопаток.',sets),
      ex('Снежный ангел лёжа на животе','8–10 повторений','Веди руками по дуге рядом с полом; не поднимай плечи к ушам.','Сократи амплитуду.','Выполняй медленнее.',sets),
      ex('Ягодичный мост с паузой','10–12 повторений','Задержись наверху на 2 секунды, не прогибай поясницу.','Обычный ягодичный мост.','Увеличь паузу на 1 секунду.',sets),
      ex('Птица-собака','6–10 на сторону','Не вращай таз; вытягивай противоположные руку и ногу.','Вытягивай только руку или только ногу.','Задержись на 3 секунды.',sets),
      ex('Подъёмы на носки стоя','12–20 повторений','Работай без раскачки.','Уменьши количество повторений.','Добавь паузу наверху.',Math.max(1,sets-1))
    ];
    else if(code==='C')list=[
      push(d,sets,true),
      ex('Сплит-присед на месте','6–8 на каждую ногу','Стой устойчиво, колено направлено по линии стопы. При необходимости слегка коснись стены для равновесия.','Сократи глубину или замени обычным приседом.','Постепенно добавляй повторения.',sets,75),
      ex('Птица-собака','8–10 на сторону','Сохраняй неподвижный корпус, не прогибай поясницу.','Двигай одной конечностью.','Добавь паузу 3 секунды.',sets),
      ex('Подъём рук лёжа на животе (Y)','6–10 повторений','Поднимай руки невысоко; шея продолжает линию позвоночника.','Поднимай по одной руке.','Добавь паузу 2 секунды.',sets),
      plank(d,sets),
      ex('Кошка-корова','6–10 плавных циклов','Двигайся мягко, без боли и рывков.','Уменьши амплитуду.','Замедли движение.',1,30)
    ];
    else list=[
      ex('Марш на месте','60–90 секунд','Спокойный темп, ровное дыхание, без прыжков.','Снизь темп.','Немного ускорься без подпрыгиваний.',1,20,true),
      ex('Кошка-корова','8–10 плавных циклов','Мягко округляй и разгибай спину в комфортной амплитуде.','Уменьши амплитуду.','Двигайся медленнее.',1,20,true),
      ex('Скольжение руками по стене','8–12 повторений','Не поднимай плечи к ушам, сохраняй комфортное положение.','Сократи амплитуду.','Добавь паузу в верхней точке.',1,20,true),
      ex('Птица-собака','6–8 на сторону','Сохраняй устойчивый таз и спокойное дыхание.','Двигай только одной конечностью.','Пауза 2 секунды.',1,20,true),
      ex('Ягодичный мост','10–12 повторений','Плавно поднимай и опускай таз.','Сократи амплитуду.','Пауза наверху 2 секунды.',1,20,true),
      ex('Подъёмы на носки стоя','12–15 повторений','Держи равновесие, не раскачивайся.','Сделай меньше повторений.','Пауза наверху.',1,20,true)
    ];
    return {day,code,title:light?'Лёгкое восстановление и подвижность':code==='A'?'Всё тело · базовые движения':code==='B'?'Ноги, корпус и контроль лопаток':'Всё тело · техника и устойчивость',duration:d.duration,recovery:light,exercises:list.slice(0,count)};
  }
  function createPlan(d){
    const teen=d.age<18;
    if(teen)d.frequency=Math.min(3,d.frequency);
    const schedule=d.frequency===2?[['A','Понедельник'],['B','Четверг']]
      :d.frequency===3?[['A','Понедельник'],['B','Среда'],['C','Пятница']]
      :[['A','Понедельник'],['D','Вторник'],['B','Четверг'],['C','Суббота']];
    const sets=teen?2:d.experience==='regular'?3:2;
    const count=d.duration===20?4:d.duration===30?5:6;
    return {version:1,createdAt:new Date().toISOString(),data:{...d},isTeen:teen,
      note:teen?'Подростковый режим: умеренный объём, без работы до отказа и без проверок максимума.':'Работай с запасом 1–3 качественных повтора. Не выполняй подходы через боль.',
      workouts:schedule.map(x=>workout(d,x[0],x[1],sets,count))};
  }
  function node(tag,cls,text){
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(text!==undefined)n.textContent=text;
    return n;
  }
  function render(plan){
    currentPlan=plan;
    if(!plan.completedWorkouts||typeof plan.completedWorkouts!=='object'||Array.isArray(plan.completedWorkouts))plan.completedWorkouts={};
    $('trainingResult').hidden=false;
    $('trainingPlanTitle').textContent=plan.data.frequency+' тренировки в неделю';
    const bits=[plan.data.age+' лет',plan.data.height?plan.data.height+' см':'',plan.data.weight?plan.data.weight+' кг':'',expLabel[plan.data.experience],goalLabel[plan.data.goal],plan.data.duration+' минут'].filter(Boolean);
    $('trainingPlanSummary').textContent=bits.join(' · ');
    $('trainingSafetyNotice').textContent=plan.isTeen
      ?'Подростковый режим: оставляй 2–3 повтора в запасе, не тренируйся до отказа и не проверяй максимум. Сосредоточься на технике и восстановлении. При боли или недомогании остановись и обсуди нагрузку со взрослым и медицинским специалистом.'
      :'Рост и вес не используются для назначения количества подходов. Остановись, если техника распадается, появляется боль, головокружение или необычная одышка.';
    const week=$('trainingWeek');week.replaceChildren();
    plan.workouts.forEach(w=>{
      const card=node('article','training-day-card'),head=node('div','training-day-head'),left=node('div');
      left.append(node('span','training-day-label',w.day),node('h3','',w.title));
      head.append(left,node('span',w.recovery?'training-day-tag recovery':'training-day-tag',w.recovery?'Лёгкий день':w.duration+' мин'));
      card.append(head,node('p','training-day-warmup','Разминка 5 минут: марш на месте, круги плечами и тазом, мягкие приседания, движения кистями.'));
      const list=node('div','training-exercise-list');
      w.exercises.forEach((item,i)=>{
        const row=node('div','training-exercise-row'),body=node('div','training-exercise-body'),meta=node('div','training-exercise-meta');
        body.append(node('b','',item.name),node('p','',item.note),node('small','training-exercise-options','Проще: '+item.easier+' Сложнее: '+item.harder));
        meta.append(node('b','',item.sets+' × '+item.target),node('small','','Отдых '+item.rest+' сек.'));
        row.append(node('span','training-exercise-number',String(i+1).padStart(2,'0')),body,meta);list.append(row);
      });
      card.append(list);
      if(w.recovery)card.append(node('p','training-recovery-tag','Не превращай этот день в ещё одну тяжёлую тренировку.'));
      card.append(node('p','training-day-foot','Заминка 3–5 минут: спокойная ходьба и мягкая подвижность без боли.'));
      week.append(card);
    });
    $('trainingWarmup').textContent='5 минут: марш на месте, круги плечами и тазом, мягкие приседания, движения кистями. Начни с лёгкой амплитуды.';
    $('trainingProgression').textContent='Когда все подходы достигают верхней границы повторений с чистой техникой на двух тренировках подряд, добавь 1–2 повтора или немного замедли опускание. Не усложняй всё сразу.';
    $('trainingRecovery').textContent='Оставляй между силовыми занятиями день отдыха, спи достаточно, пей воду и прекращай упражнение при боли. Каждые 4–6 недель оценивай технику и самочувствие.';
    $('trainingResult').scrollIntoView({behavior:'smooth',block:'start'});
    status('trainingSaveStatus','План готов. Сохрани его, чтобы не потерять.');
    window.dispatchEvent(new CustomEvent('nutrix:training-plan-rendered',{detail:{plan}}));
  }
  function applyForm(d){
    if(!d)return;
    ['age','height','weight','pushups','squats','plank'].forEach(k=>{$('training'+k[0].toUpperCase()+k.slice(1)).value=d[k]??'';});
    ['experience','goal','frequency','duration'].forEach(k=>{if(d[k]!==undefined)$('training'+k[0].toUpperCase()+k.slice(1)).value=String(d[k]);});
    $('trainingLimitations').checked=!!d.limitations;
  }
  function saveLocal(plan){
    try{localStorage.setItem(storageKey(),JSON.stringify(plan));return true;}catch(_){return false;}
  }
  function loadLocal(){
    try{const p=JSON.parse(localStorage.getItem(storageKey())||'null');return p&&p.version===1&&p.data&&Array.isArray(p.workouts)?p:null;}catch(_){return null;}
  }
  async function savePlan(){
    if(!currentPlan)return;
    if(!saveLocal(currentPlan))return status('trainingSaveStatus','Не удалось сохранить план в браузере. Освободи место в хранилище.',true);
    if(!cloud()||!cloud().signedIn)return status('trainingSaveStatus','План сохранён на этом устройстве. Войди через «Облако», чтобы синхронизировать его между устройствами.');
    status('trainingSaveStatus','Сохраняю план в личный аккаунт…');
    const result=await cloud().saveTrainingPlan(currentPlan);
    if(result&&result.ok)status('trainingSaveStatus','План сохранён в твоём аккаунте NUTRIX.');
    else status('trainingSaveStatus','Локальная копия сохранена, но облако ответило ошибкой: '+((result&&result.error)||'неизвестная ошибка'),true);
  }
  function currentWeekKey(){
    const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  async function completeWorkout(index,meta){
    if(!currentPlan||!currentPlan.workouts[index])return {ok:false,error:'Тренировочный план не найден.'};
    if(!currentPlan.completedWorkouts||typeof currentPlan.completedWorkouts!=='object')currentPlan.completedWorkouts={};
    const key=currentWeekKey()+':'+index;
    currentPlan.completedWorkouts[key]={
      completedAt:new Date().toISOString(),
      durationMinutes:Math.max(0,Number(meta&&meta.durationMinutes)||0),
      exerciseCount:Math.max(0,Number(meta&&meta.exerciseCount)||0)
    };
    const keys=Object.keys(currentPlan.completedWorkouts).sort();
    if(keys.length>60)keys.slice(0,keys.length-60).forEach(k=>delete currentPlan.completedWorkouts[k]);
    saveLocal(currentPlan);
    await savePlan();
    window.dispatchEvent(new CustomEvent('nutrix:workout-completed',{detail:{index,key,plan:currentPlan}}));
    return {ok:true,key};
  }
  async function syncCloudPlan(){
    if(cloudSyncBusy||!cloud())return;
    cloudSyncBusy=true;
    try{
      if(cloud().signedIn){
        currentPlan=null;
        $('trainingForm').reset();
        $('trainingResult').hidden=true;
        const result=await cloud().loadTrainingPlan();
        if(result&&result.error)status('trainingSaveStatus','Не удалось загрузить план из облака: '+result.error,true);
        else if(result&&result.plan){
          currentPlan=result.plan;saveLocal(currentPlan);applyForm(currentPlan.data);render(currentPlan);
          status('trainingSaveStatus','Личный план загружен из облака.');
        }else{currentPlan=null;$('trainingForm').reset();$('trainingResult').hidden=true;status('trainingSaveStatus','В этом аккаунте пока нет сохранённого плана тренировок.');}
      }else{
        const guest=loadLocal();
        if(guest){currentPlan=guest;applyForm(guest.data);render(guest);}
        else{currentPlan=null;$('trainingResult').hidden=true;}
      }
    }catch(error){status('trainingSaveStatus','Ошибка облачной синхронизации: '+error.message,true);}
    finally{cloudSyncBusy=false;}
  }
  function download(){
    if(!currentPlan)return;
    const d=currentPlan.data;
    let out='NUTRIX — ДОМАШНИЙ ПЛАН КАЛИСТЕНИКИ\n'+d.age+' лет · '+(d.height||'рост не указан')+' см · '+(d.weight||'вес не указан')+' кг\nОпыт: '+expLabel[d.experience]+'\nЦель: '+goalLabel[d.goal]+'\nЧастота: '+d.frequency+' раза в неделю · '+d.duration+' минут\n\n';
    currentPlan.workouts.forEach(w=>{
      out+=w.day+' — '+w.title+'\nРазминка: 5 минут\n';
      w.exercises.forEach(x=>{out+='- '+x.name+': '+x.sets+' × '+x.target+'; отдых '+x.rest+' сек.\n  '+x.note+'\n';});
      out+='Заминка: 3–5 минут\n\n';
    });
    out+='Правило нагрузки: '+currentPlan.note+'\nБез инвентаря нельзя полноценно заменить тяговые упражнения для спины.\n';
    const url=URL.createObjectURL(new Blob([out],{type:'text/plain;charset=utf-8'}));
    const a=node('a');a.href=url;a.download='nutrix-trenirovki.txt';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  function syncProfile(){
    const p=window.NUTRIX&&window.NUTRIX.getFormData?window.NUTRIX.getFormData():null;
    if(!p)return status('trainingFormMessage','Профиль питания пока недоступен. Заполни данные вручную.',true);
    if(p.age)$('trainingAge').value=p.age;if(p.height)$('trainingHeight').value=p.height;if(p.weight)$('trainingWeight').value=p.weight;
    status('trainingFormMessage','Возраст, рост и вес перенесены из профиля питания. Проверь их перед созданием плана.');
  }
  $('trainingUseProfile').addEventListener('click',syncProfile);
  $('trainingForm').addEventListener('submit',e=>{
    e.preventDefault();const d=formData(),error=validate(d);
    if(error)return status('trainingFormMessage',error,true);
    if(d.age<18&&d.frequency>3){d.frequency=3;$('trainingFrequency').value='3';status('trainingFormMessage','Для возраста до 18 лет выбрано не более трёх занятий в неделю.');}
    else status('trainingFormMessage','');
    currentPlan=createPlan(d);saveLocal(currentPlan);render(currentPlan);
    if(cloud()&&cloud().signedIn)savePlan();
  });
  $('trainingSave').addEventListener('click',savePlan);
  $('trainingDownload').addEventListener('click',download);
  $('trainingPrint').addEventListener('click',()=>{document.body.classList.add('training-print-mode');window.print();document.body.classList.remove('training-print-mode');});
  $('trainingReset').addEventListener('click',async()=>{
    const key=storageKey();currentPlan=null;localStorage.removeItem(key);$('trainingForm').reset();$('trainingResult').hidden=true;
    window.dispatchEvent(new CustomEvent('nutrix:training-plan-rendered',{detail:{plan:null}}));
    status('trainingFormMessage','Параметры тренировок сброшены.');status('trainingSaveStatus','');
    if(cloud()&&cloud().signedIn){const result=await cloud().deleteTrainingPlan();if(result&&!result.ok)status('trainingSaveStatus','Локальный план удалён, но облачный удалить не удалось: '+result.error,true);}
  });
  window.NUTRIX_TRAINING={get plan(){return currentPlan;},completeWorkout};
    window.addEventListener('nutrix:auth-changed',syncCloudPlan);
  const saved=loadLocal();
  if(saved){currentPlan=saved;applyForm(saved.data);render(saved);status('trainingSaveStatus','Найден сохранённый план на этом устройстве.');}
  if(cloud()&&cloud().signedIn)syncCloudPlan();
})();