'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const guide = {
  "b1": [
    10,
    [
      "Залей хлопья водой так, чтобы она слегка их покрывала.",
      "Вари на слабом огне 5–7 минут, периодически помешивая.",
      "Нарежь банан кружочками и добавь в готовую кашу."
    ]
  ],
  "b2": [
    12,
    [
      "Приготовь яйца вкрутую или сделай яичницу до полной готовности.",
      "Подсуши хлеб на сухой сковороде или в тостере.",
      "Вымой и нарежь помидор с огурцом, подай вместе с яйцами."
    ]
  ],
  "b3": [
    5,
    [
      "Разомни творог вилкой. Если он сухой, добавь ложку воды или йогурта.",
      "Вымой яблоко и нарежь небольшими кубиками.",
      "Добавь яблоко и овсяные хлопья, перемешай."
    ]
  ],
  "b4": [
    25,
    [
      "Промой гречку и отвари до мягкости.",
      "Нарежь шампиньоны и лук. Обжарь лук на масле 2 минуты, добавь грибы.",
      "Готовь, пока не выпарится жидкость из грибов, затем смешай с гречкой."
    ]
  ],
  "b5": [
    12,
    [
      "Нарежь хлеб и помидор, натри или тонко нарежь сыр.",
      "Выложи сыр и помидор на хлеб, прогрей под крышкой на сковороде до расплавления сыра.",
      "Яйцо приготовь отдельно до полной готовности и подай с бутербродами."
    ]
  ],
  "b6": [
    10,
    [
      "Налей молоко в ковш и доведи почти до кипения.",
      "Добавь овсяные хлопья и вари 5–7 минут на слабом огне, помешивая.",
      "Нарежь яблоко кубиками и добавь в готовую кашу."
    ]
  ],
  "b7": [
    25,
    [
      "Промой рис до почти прозрачной воды.",
      "Залей водой примерно в пропорции, указанной на упаковке, и вари на слабом огне 18–20 минут.",
      "Нарежь яблоко, добавь в кашу вместе с корицей."
    ]
  ],
  "b8": [
    15,
    [
      "Мелко нарежь лук и помидор.",
      "Обжарь лук на масле 2 минуты, добавь помидор и готовь ещё 3–4 минуты.",
      "Разбей яйца, накрой крышкой и готовь до полной готовности белка. Подай с хлебом."
    ]
  ],
  "b9": [
    25,
    [
      "Разомни творог, добавь яйцо и овсяные хлопья, перемешай.",
      "Сформируй небольшие сырники влажными руками.",
      "Готовь на слабом огне под крышкой по 3–4 минуты с каждой стороны до полной готовности.",
      "Подай с нарезанным яблоком и йогуртом."
    ]
  ],
  "b10": [
    15,
    [
      "Разомни банан вилкой до пюре.",
      "Добавь овсяные хлопья и 2–3 ложки воды, перемешай и оставь на 3 минуты.",
      "Выкладывай небольшие оладьи на слегка смазанную сковороду.",
      "Жарь на слабом огне по 2–3 минуты с каждой стороны."
    ]
  ],
  "b11": [
    7,
    [
      "Нарежь хлеб ломтиками.",
      "Вымой и нарежь помидор с огурцом.",
      "Слегка сбрызни хлеб маслом и выложи овощи."
    ]
  ],
  "b12": [
    20,
    [
      "Промой пшено горячей водой.",
      "Залей водой и вари на слабом огне 15–18 минут, периодически помешивая.",
      "Добавь нарезанное яблоко и немного корицы, дай постоять под крышкой 2 минуты."
    ]
  ],
  "b13": [
    5,
    [
      "Переложи йогурт в миску и добавь овсяные хлопья.",
      "Нарежь яблоко и банан небольшими кусочками.",
      "Смешай всё и дай постоять 2–3 минуты."
    ]
  ],
  "b14": [
    12,
    [
      "Взбей яйца вилкой.",
      "Нарежь помидор и лук, слегка прогрей на сковороде с маслом.",
      "Влей яйца и готовь под крышкой на слабом огне до полного схватывания. Подай с хлебом."
    ]
  ],
  "s1": [
    2,
    [
      "Вымой яблоко и нарежь дольками.",
      "Очисти банан и подай вместе с яблоком."
    ]
  ],
  "s2": [
    2,
    [
      "Очисти банан и нарежь кружочками.",
      "Добавь натуральный йогурт и перемешай."
    ]
  ],
  "s3": [
    3,
    [
      "Нарежь хлеб и сыр.",
      "Вымой огурец и нарежь кружочками.",
      "Собери бутерброд и подай."
    ]
  ],
  "s4": [
    3,
    [
      "Выложи творог в миску.",
      "Вымой яблоко и нарежь небольшими кусочками.",
      "Добавь яблоко к творогу."
    ]
  ],
  "s5": [
    2,
    [
      "Налей кефир в стакан.",
      "Нарежь банан небольшими кусочками и съешь вместе с кефиром."
    ]
  ],
  "s6": [
    5,
    [
      "Подсуши хлеб на сухой сковороде или в тостере.",
      "Нарежь помидор и огурец.",
      "Выложи овощи на тост и подавай."
    ]
  ],
  "s7": [
    8,
    [
      "Отвари яйцо вкрутую 9–10 минут и остуди.",
      "Очисти яйцо и банан.",
      "Подай вместе."
    ]
  ],
  "s8": [
    3,
    [
      "Выложи йогурт в миску.",
      "Вымой яблоко и нарежь небольшими кусочками.",
      "Добавь яблоко и перемешай."
    ]
  ],
  "s9": [
    5,
    [
      "Вымой и очисти морковь.",
      "Нарежь морковь и огурец тонкими палочками.",
      "Подай как свежий овощной перекус."
    ]
  ],
  "s10": [
    18,
    [
      "Разогрей духовку до 180 °C.",
      "Разрежь яблоко пополам и удали сердцевину.",
      "Смешай овсяные хлопья с ложкой воды и корицей, выложи в яблоко.",
      "Запекай 12–15 минут до мягкости."
    ]
  ],
  "s11": [
    18,
    [
      "Разомни банан вилкой.",
      "Добавь овсяные хлопья и перемешай до густой массы.",
      "Выложи небольшие лепёшки на противень с бумагой.",
      "Запекай при 180 °C около 12–15 минут."
    ]
  ],
  "s12": [
    5,
    [
      "Вымой огурец и помидор.",
      "Нарежь овощи небольшими кусочками, лук — очень тонко.",
      "Заправь небольшим количеством масла и перемешай."
    ]
  ],
  "s13": [
    3,
    [
      "Очисти апельсин и раздели на дольки.",
      "Вымой яблоко и нарежь кусочками.",
      "Подай фрукты вместе."
    ]
  ],
  "s14": [
    5,
    [
      "Подсуши хлеб.",
      "Разомни творог вилкой и намажь на тост.",
      "Добавь нарезанный банан."
    ]
  ],
  "l1": [
    30,
    [
      "Промой рис и отвари по инструкции на упаковке.",
      "Нарежь куриное филе небольшими кусочками, морковь натри, лук нарежь.",
      "Обжарь курицу на сковороде до полной готовности внутри.",
      "Добавь морковь и лук, готовь до мягкости и подай с рисом."
    ]
  ],
  "l2": [
    35,
    [
      "Промой гречку и отвари до мягкости.",
      "Нарежь курицу полосками и приготовь на сковороде до полной готовности.",
      "Вымой и нарежь огурец с помидором.",
      "Подай курицу с гречкой и овощным салатом."
    ]
  ],
  "l3": [
    20,
    [
      "Отвари макароны по инструкции и слей воду.",
      "Промой фасоль и дай жидкости стечь.",
      "Прогрей фасоль с томатным соусом на сковороде 4–5 минут.",
      "Добавь макароны, перемешай и прогрей ещё минуту."
    ]
  ],
  "l4": [
    25,
    [
      "Промой рис и отвари до готовности.",
      "Нарежь лук, морковь натри на крупной тёрке.",
      "Потуши овощи на масле с парой ложек воды до мягкости.",
      "Добавь промытую фасоль, прогрей и смешай с рисом."
    ]
  ],
  "l5": [
    35,
    [
      "Разморозь минтай в холодильнике и промокни бумажным полотенцем.",
      "Запеки рыбу при 180 °C примерно 15–20 минут или приготовь под крышкой до полной готовности.",
      "Отвари картофель до мягкости.",
      "Нашинкуй капусту, добавь немного масла и подай с рыбой и картофелем."
    ]
  ],
  "l6": [
    20,
    [
      "Отвари макароны и слей воду.",
      "Нарежь лук, натри морковь и слегка обжарь до мягкости.",
      "Взбей яйца, добавь к овощам и готовь, помешивая, до полной готовности.",
      "Смешай с макаронами."
    ]
  ],
  "l7": [
    25,
    [
      "Отвари картофель до мягкости и нарежь кусочками.",
      "Свари яйца вкрутую, остуди и нарежь.",
      "Нашинкуй капусту и натри морковь.",
      "Смешай овощи с маслом и подай с картофелем и яйцами."
    ]
  ],
  "l8": [
    30,
    [
      "Промой гречку и отвари до готовности.",
      "Нарежь курицу небольшими кусочками и обжарь до полной готовности.",
      "Нарежь огурец и помидор.",
      "Подай всё вместе, добавив немного масла к овощам."
    ]
  ],
  "l9": [
    20,
    [
      "Промой рис и отвари до мягкости.",
      "Слей жидкость с кукурузы.",
      "Нарежь огурец и помидор небольшими кубиками.",
      "Смешай овощи с тёплым рисом и кукурузой."
    ]
  ],
  "l10": [
    20,
    [
      "Нарежь куриное филе тонкими кусочками и приготовь на сковороде до полной готовности.",
      "Смешай йогурт с солью и перцем, если они есть.",
      "Нарежь овощи.",
      "Выложи курицу и овощи на хлеб, добавь соус и накрой вторым ломтиком."
    ]
  ],
  "l11": [
    20,
    [
      "Отвари рис до готовности.",
      "Нарежь лук и помидор, слегка потуши на масле.",
      "Добавь фасоль и томатный соус, прогрей 5 минут.",
      "Подай с рисом."
    ]
  ],
  "l12": [
    25,
    [
      "Нарежь картофель небольшими кубиками, нашинкуй капусту, морковь натри, лук нарежь.",
      "Потуши картофель с морковью и луком с небольшим количеством воды 10 минут.",
      "Добавь капусту, фасоль и томатный соус.",
      "Туши под крышкой ещё 8–10 минут до мягкости овощей."
    ]
  ],
  "l13": [
    25,
    [
      "Промой гречку и отвари до готовности.",
      "Нарежь шампиньоны и лук.",
      "Обжарь лук, добавь грибы и готовь, пока не выпарится жидкость.",
      "Смешай грибы с гречкой и подавай."
    ]
  ],
  "l14": [
    35,
    [
      "Отвари картофель до мягкости и разомни в пюре.",
      "Нашинкуй капусту, натри морковь и потуши их до мягкости.",
      "Выложи половину картофеля в форму, добавь овощи и накрой оставшимся пюре.",
      "Смажь томатным соусом и запекай при 180 °C около 15 минут."
    ]
  ],
  "d1": [
    35,
    [
      "Разморозь минтай в холодильнике и обсуши.",
      "Запеки рыбу при 180 °C 15–20 минут или приготовь под крышкой до полной готовности.",
      "Отвари картофель до мягкости.",
      "Нашинкуй капусту и подай с рыбой и картофелем."
    ]
  ],
  "d2": [
    30,
    [
      "Отвари промытую гречку.",
      "Нарежь курицу небольшими кусочками и приготовь на сковороде до полной готовности.",
      "Добавь нарезанный лук и натёртую морковь, туши до мягкости.",
      "Подай с гречкой."
    ]
  ],
  "d3": [
    15,
    [
      "Нарежь помидор и лук.",
      "Слегка прогрей овощи на сковороде.",
      "Взбей яйца, вылей к овощам и готовь под крышкой до полной готовности.",
      "Подай с хлебом."
    ]
  ],
  "d4": [
    25,
    [
      "Отвари рис до готовности.",
      "Натри морковь и нарежь лук.",
      "Потуши овощи с небольшим количеством масла и воды до мягкости.",
      "Добавь промытую фасоль, прогрей и подай с рисом."
    ]
  ],
  "d5": [
    25,
    [
      "Отвари гречку до готовности.",
      "Нарежь грибы и лук.",
      "Обжарь лук, добавь шампиньоны и готовь до испарения жидкости.",
      "Смешай с гречкой."
    ]
  ],
  "d6": [
    25,
    [
      "Нарежь картофель небольшими кубиками, морковь натри, лук измельчи.",
      "Положи картофель в сковороду с несколькими ложками воды, накрой и туши 10 минут.",
      "Добавь морковь, лук и промытую фасоль.",
      "Готовь ещё 8–10 минут до мягкости картофеля."
    ]
  ],
  "d7": [
    30,
    [
      "Отвари макароны по инструкции.",
      "Нарежь курицу небольшими кусочками и приготовь до полной готовности.",
      "Добавь лук и натёртую морковь, туши до мягкости.",
      "Смешай с макаронами."
    ]
  ],
  "d8": [
    35,
    [
      "Измельчи куриное филе ножом или в блендере.",
      "Добавь яйцо, перемешай и сформируй небольшие котлеты.",
      "Готовь котлеты под крышкой на слабом огне до полной готовности внутри.",
      "Отвари картофель, разомни с тёплым молоком и подай с капустным салатом."
    ]
  ],
  "d9": [
    30,
    [
      "Отвари рис до готовности.",
      "Нарежь лук и натри морковь, потуши до мягкости.",
      "Добавь минтай и немного воды, готовь под крышкой до полной готовности рыбы.",
      "Подай с рисом."
    ]
  ],
  "d10": [
    20,
    [
      "Отвари картофель до мягкости и дай немного остыть.",
      "Промой фасоль и дай жидкости стечь.",
      "Нарежь картофель, огурец и помидор.",
      "Смешай с фасолью и небольшим количеством масла."
    ]
  ],
  "d11": [
    25,
    [
      "Отвари картофель и разомни в пюре.",
      "Добавь овсяные хлопья и мелко нарезанный лук, дай постоять 5 минут.",
      "Сформируй котлеты и обжарь на небольшом количестве масла до румяной корочки с двух сторон.",
      "Подай с нашинкованной капустой и тёртой морковью."
    ]
  ],
  "d12": [
    25,
    [
      "Нарежь картофель небольшими кубиками, морковь натри, лук измельчи.",
      "Туши картофель с морковью и луком под крышкой с небольшим количеством воды 12–15 минут.",
      "Добавь промытую фасоль и прогрей ещё 5 минут.",
      "Проверь мягкость картофеля и подавай."
    ]
  ],
  "d13": [
    25,
    [
      "Промой рис и поставь вариться.",
      "Нарежь курицу небольшими кусочками, обжарь до изменения цвета.",
      "Добавь лук и томатный соус с небольшим количеством воды.",
      "Туши под крышкой до полной готовности курицы и подай с рисом."
    ]
  ],
  "d14": [
    25,
    [
      "Нашинкуй капусту очень тонко и обдай кипятком на 2 минуты, затем слей воду.",
      "Смешай капусту с мукой и 2–3 ложками воды до густой массы.",
      "Выкладывай небольшие оладьи на разогретую сковороду с маслом.",
      "Обжарь с двух сторон до готовности и подай с томатным соусом."
    ]
  ],
  "b15": [
    15,
    [
      "Нарежь куриное филе и приготовь на сковороде до полной готовности.",
      "Добавь помидор и прогрей 1–2 минуты.",
      "Взбей яйца, залей курицу с овощами и готовь под крышкой.",
      "Посыпь сыром, дай ему расплавиться и подай с хлебом."
    ]
  ],
  "b16": [
    10,
    [
      "Свари яйцо вкрутую 9–10 минут и остуди.",
      "Слей жидкость с тунца и разомни его вилкой с йогуртом.",
      "Нарежь яйцо и огурец, смешай с тунцом.",
      "Выложи начинку на хлеб или подсушенные тосты."
    ]
  ],
  "b17": [
    15,
    [
      "Нарежь курицу и приготовь на сковороде до полной готовности.",
      "Нарежь огурец, сыр натри.",
      "Смажь лаваш йогуртом, выложи курицу, огурец и сыр.",
      "Сверни рулет и прогрей на сухой сковороде с двух сторон."
    ]
  ],
  "b18": [
    30,
    [
      "Разомни творог, добавь яйцо, овсяные хлопья и йогурт.",
      "Нарежь яблоко маленькими кубиками и вмешай в массу.",
      "Переложи смесь в небольшую форму.",
      "Запекай при 180 °C около 20–25 минут до плотной середины."
    ]
  ],
  "s15": [
    3,
    [
      "Переложи творог в миску.",
      "Добавь йогурт и перемешай.",
      "Нарежь банан и добавь сверху."
    ]
  ],
  "s16": [
    10,
    [
      "Отвари яйца вкрутую 9–10 минут и остуди.",
      "Нарежь хлеб и огурец.",
      "Очисти яйца и подай всё вместе."
    ]
  ],
  "s17": [
    12,
    [
      "Нарежь курицу тонкими кусочками и приготовь до полной готовности.",
      "Смешай йогурт с солью, если используешь.",
      "Нарежь огурец.",
      "Собери сэндвич с курицей, огурцом и соусом."
    ]
  ],
  "s18": [
    5,
    [
      "Слей жидкость с тунца и кукурузы.",
      "Нарежь огурец небольшими кубиками.",
      "Смешай тунец, огурец и кукурузу.",
      "Добавь йогурт и перемешай."
    ]
  ],
  "l15": [
    25,
    [
      "Отвари макароны по инструкции.",
      "Нарежь куриное филе и приготовь до полной готовности.",
      "Добавь лук и томатный соус, туши 4–5 минут.",
      "Смешай с макаронами."
    ]
  ],
  "l16": [
    30,
    [
      "Промой рис и отвари.",
      "Нарежь индейку небольшими кусочками.",
      "Потуши индейку с луком и морковью до полной готовности.",
      "Подай с рисом."
    ]
  ],
  "l17": [
    25,
    [
      "Промой гречку и отвари.",
      "Нарежь лук, морковь натри.",
      "Обжарь фарш, разбивая комочки, до полной готовности.",
      "Добавь овощи, потуши до мягкости и подай с гречкой."
    ]
  ],
  "l18": [
    30,
    [
      "Отвари очищенный картофель до мягкости.",
      "Промой печень, удали крупные прожилки и нарежь.",
      "Потуши лук, добавь печень и готовь до полной готовности внутри.",
      "Добавь йогурт, прогрей и подай с пюре."
    ]
  ],
  "l19": [
    35,
    [
      "Нарежь свинину небольшими кусочками.",
      "Обжарь мясо до изменения цвета, добавь лук и немного воды.",
      "Туши под крышкой до мягкости мяса.",
      "Добавь картофель и капусту, готовь до мягкости."
    ]
  ],
  "d15": [
    30,
    [
      "Промой гречку и отвари.",
      "Смешай фарш с яйцом и мелко нарезанным луком.",
      "Сформируй котлеты и приготовь под крышкой до полной готовности внутри.",
      "Подай с гречкой."
    ]
  ],
  "d16": [
    30,
    [
      "Промой рис и отвари.",
      "Нарежь куриное бедро кусочками.",
      "Потуши курицу с луком и морковью до полной готовности мяса.",
      "Подай с рисом."
    ]
  ],
  "d17": [
    30,
    [
      "Отвари макароны.",
      "Мелко нарежь индейку или измельчи в фарш, смешай с яйцом.",
      "Сформируй фрикадельки и туши в томатном соусе с луком до полной готовности.",
      "Подай с макаронами."
    ]
  ],
  "d18": [
    25,
    [
      "Промой рис и отвари.",
      "Нарежь лук, морковь натри и потуши.",
      "Добавь промытую и нарезанную печень.",
      "Готовь до полной готовности печени и подай с рисом."
    ]
  ]
};
  const read = key => { try { return JSON.parse(localStorage.getItem(key)||'{}'); } catch(e) { return {}; } };
  const write = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch(e) {} };
  const plan = () => window.NUTRIX && window.NUTRIX.plan;
  const currentStore = () => plan() && plan().data.store || 'pyaterochka';
  const toast = message => window.NUTRIX && window.NUTRIX.showToast ? window.NUTRIX.showToast(message) : null;

  let activeCookInfo=null,cookStepIndex=0,cookDoneSteps=[],cookTimerId=null,cookTimerEnd=0,cookTimerRemaining=0;
  function paintCookTimer(){
    const display=$('cookTimerDisplay');if(!display)return;
    display.textContent=String(Math.floor(cookTimerRemaining/60)).padStart(2,'0')+':'+String(cookTimerRemaining%60).padStart(2,'0');
  }
  function stopCookTimer(){
    if(cookTimerId){clearInterval(cookTimerId);cookTimerId=null;}
    cookTimerEnd=0;
    if($('cookTimerToggle'))$('cookTimerToggle').textContent='Запустить таймер';
  }
  function updateCookTimer(){
    if(!cookTimerEnd)return;
    cookTimerRemaining=Math.max(0,Math.ceil((cookTimerEnd-Date.now())/1000));
    paintCookTimer();
    if(cookTimerRemaining<=0){stopCookTimer();toast('Время вышло. Проверь готовность блюда.');}
  }
  function resetCookTimer(){
    stopCookTimer();cookTimerRemaining=(Number($('cookTimerMinutes')?.value)||5)*60;paintCookTimer();
  }
  function toggleCookTimer(){
    if(cookTimerId){
      cookTimerRemaining=Math.max(0,Math.ceil((cookTimerEnd-Date.now())/1000));stopCookTimer();paintCookTimer();$('cookTimerToggle').textContent='Продолжить';return;
    }
    if(!cookTimerRemaining)resetCookTimer();
    cookTimerEnd=Date.now()+cookTimerRemaining*1000;$('cookTimerToggle').textContent='Пауза';cookTimerId=setInterval(updateCookTimer,250);
  }
  function renderCookStep(){
    if(!activeCookInfo)return;
    const steps=activeCookInfo[1],total=steps.length;
    $('cookStepCounter').textContent='Шаг '+(cookStepIndex+1)+' из '+total;
    $('cookStepText').textContent=steps[cookStepIndex];
    $('cookProgressFill').style.width=Math.round((cookStepIndex+1)/total*100)+'%';
    $('cookStepDone').textContent=cookDoneSteps[cookStepIndex]?'Шаг выполнен ✓':'Отметить шаг';
    $('cookStepDone').classList.toggle('is-done',!!cookDoneSteps[cookStepIndex]);
    $('cookPrevStep').disabled=cookStepIndex===0;
    $('cookNextStep').textContent=cookStepIndex===total-1?'Завершить':'Следующий шаг →';
  }
  function startCookMode(){
    if(!activeCookInfo)return;
    cookStepIndex=0;cookDoneSteps=activeCookInfo[1].map(()=>false);
    $('recipeView').hidden=true;$('cookMode').hidden=false;resetCookTimer();renderCookStep();
  }
  function ensureDialog(){
    if($('recipeDialog')) return;
    const dialog=document.createElement('dialog');dialog.id='recipeDialog';dialog.className='recipe-dialog';
    dialog.innerHTML='<div class="recipe-dialog-inner"><div class="recipe-dialog-head"><div><div class="eyebrow">NUTRIX / РЕЦЕПТ</div><h2 id="recipeTitle"></h2><p id="recipeMeta"></p></div><button class="icon-button" id="recipeClose" type="button" aria-label="Закрыть">×</button></div><div id="recipeView"><div class="recipe-dialog-section"><h3>Ингредиенты на порцию</h3><ul id="recipeIngredients"></ul></div><div class="recipe-dialog-section"><h3>Как приготовить</h3><ol id="recipeSteps"></ol></div><div class="recipe-video-wrap"><a id="recipeVideo" class="recipe-video-link" href="#" target="_blank" rel="noopener noreferrer">▶ Смотреть видео приготовления</a><p>Откроются видеоинструкции по этому блюду на YouTube.</p></div><button class="cook-start-button" id="startCooking" type="button">Начать готовить <span>→</span></button><p class="recipe-dialog-note">Проверяй готовность продуктов. Для точной пищевой ценности сверяйся с упаковками.</p></div><section id="cookMode" class="cook-mode" hidden><div class="cook-mode-kicker">РЕЖИМ ГОТОВКИ</div><div class="cook-step-top"><span id="cookStepCounter">Шаг 1 из 3</span><span>Следуй по порядку</span></div><div class="cook-progress"><span id="cookProgressFill"></span></div><article class="cook-step-card"><div class="cook-step-visual">👨‍🍳</div><p id="cookStepText"></p><button id="cookStepDone" class="cook-step-done" type="button">Отметить шаг</button></article><div class="cook-timer-card"><div><b>Таймер</b><small>Для варки, жарки или запекания</small></div><strong id="cookTimerDisplay" aria-live="off">05:00</strong><div class="cook-timer-controls"><select id="cookTimerMinutes" aria-label="Длительность таймера"><option value="1">1 мин</option><option value="3">3 мин</option><option value="5" selected>5 мин</option><option value="10">10 мин</option><option value="15">15 мин</option><option value="20">20 мин</option><option value="30">30 мин</option></select><button id="cookTimerToggle" type="button">Запустить таймер</button><button id="cookTimerReset" type="button">Сбросить</button></div></div><div class="cook-step-nav"><button id="cookPrevStep" type="button">← Назад</button><button id="cookNextStep" type="button">Следующий шаг →</button></div><button id="cookBackRecipe" class="cook-back-recipe" type="button">Вернуться к рецепту</button></section></div>';
    document.body.appendChild(dialog);
    $('recipeClose').addEventListener('click',()=>dialog.close());
    $('startCooking').addEventListener('click',startCookMode);
    $('cookPrevStep').addEventListener('click',()=>{if(cookStepIndex>0){cookStepIndex--;renderCookStep();}});
    $('cookNextStep').addEventListener('click',()=>{
      if(!activeCookInfo)return;
      if(cookStepIndex===activeCookInfo[1].length-1){stopCookTimer();$('cookMode').hidden=true;$('recipeView').hidden=false;toast('Приготовление завершено. Проверь готовность блюда.');return;}
      cookStepIndex++;renderCookStep();
    });
    $('cookStepDone').addEventListener('click',()=>{
      cookDoneSteps[cookStepIndex]=!cookDoneSteps[cookStepIndex];renderCookStep();
      if(cookDoneSteps.every(Boolean))toast('Все шаги отмечены. Проверь готовность блюда.');
    });
    $('cookTimerToggle').addEventListener('click',toggleCookTimer);
    $('cookTimerReset').addEventListener('click',resetCookTimer);
    $('cookTimerMinutes').addEventListener('change',resetCookTimer);
    $('cookBackRecipe').addEventListener('click',()=>{stopCookTimer();$('cookMode').hidden=true;$('recipeView').hidden=false;});
    dialog.addEventListener('close',stopCookTimer);
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }
  function openRecipe(dayIndex,mealIndex){
    const meal=plan() && plan().days[dayIndex] && plan().days[dayIndex].meals[mealIndex];if(!meal)return;
    const info=guide[meal.recipe.id];if(!info){toast('Инструкция для блюда пока недоступна');return;}
    ensureDialog();stopCookTimer();$('cookMode').hidden=true;$('recipeView').hidden=false;activeCookInfo=info;$('recipeTitle').textContent=meal.recipe.name;
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
    const heading=document.querySelector('.shopping-heading');if(!heading)return;
    const copy=$('copyShopping');let group=heading.querySelector('.shopping-actions');
    if(!group){group=document.createElement('div');group.className='shopping-actions';if(copy){copy.parentNode.insertBefore(group,copy);group.append(copy);}else heading.append(group);}
    if(!$('clearShoppingChecks')){
      const button=document.createElement('button');button.id='clearShoppingChecks';button.type='button';button.className='secondary-button';button.textContent='Снять отметки';group.insertBefore(button,copy||null);
      button.addEventListener('click',()=>{
        const checks=read('nutrix-shopping-checks');const prefix=currentStore()+':';
        Object.keys(checks).forEach(key=>{if(key.startsWith(prefix))delete checks[key];});write('nutrix-shopping-checks',checks);
        document.querySelectorAll('#shoppingList .shopping-item input[type=checkbox]').forEach(input=>input.checked=false);
        toast('Отметки о покупках очищены');
      });
    }
    if(!$('clearPantry')){
      const clear=document.createElement('button');clear.id='clearPantry';clear.type='button';clear.className='secondary-button';clear.textContent='Очистить остатки';group.insertBefore(clear,copy||null);clear.addEventListener('click',clearPantry);
    }
  }
  function restoreShoppingState(){
    const p=plan();if(!p)return;const checks=read('nutrix-shopping-checks');
    document.querySelectorAll('#shoppingList .shopping-item input[type=checkbox][data-cart-key]').forEach(input=>{
      let key='';try{key=decodeURIComponent(input.dataset.cartKey||'');}catch(e){}
      input.checked=!!checks[p.data.store+':'+key];
    });
  }
  function formatAmount(amount,unit){
    if(unit==='шт.')return Math.round(amount*2)/2+' шт.';
    if(unit==='мл')return Math.round(amount/10)*10+' мл';
    return Math.round(amount/5)*5+' г';
  }
  function updateSmartCartLine(input){
    const p=plan();if(!p)return;
    let key='';try{key=decodeURIComponent(input.dataset.cartKey||'');}catch(e){}
    const item=p.cart.find(x=>x.key===key);if(!item)return;
    const home=Math.max(0,Number(input.value)||0);
    item.homeAmount=home;item.needAmount=Math.max(0,item.amount-home);
    item.packCount=item.needAmount>0?Math.ceil(item.needAmount/item.packSize):0;
    item.total=item.packCount*item.price;
    const pantry=read('nutrix-pantry');pantry[key]=home;write('nutrix-pantry',pantry);
    const line=input.closest('.shopping-line');
    if(line){
      const required=line.querySelector('.cart-required'),toBuy=line.querySelector('.cart-to-buy'),packs=line.querySelector('.cart-packs'),total=line.querySelector('.line-total');
      if(required)required.textContent=formatAmount(item.amount,item.unit);
      if(toBuy)toBuy.textContent=formatAmount(item.needAmount,item.unit);
      if(packs)packs.textContent=String(item.packCount);
      if(total)total.textContent=item.total.toLocaleString('ru-RU');
      line.classList.toggle('has-stock',home>0);
    }
    if(window.NUTRIX?.updateCartTotals)window.NUTRIX.updateCartTotals(p);
    if(window.NUTRIX?.renderCartSummary)window.NUTRIX.renderCartSummary(p);
    if(window.NUTRIX?.renderBudgetNotice)window.NUTRIX.renderBudgetNotice(p);
  }
  function clearPantry(){
    const p=plan();if(!p)return;
    write('nutrix-pantry',{});
    document.querySelectorAll('#shoppingList .home-amount').forEach(input=>{input.value='0';updateSmartCartLine(input);});
    toast('Остатки продуктов очищены');
  }
  function persistShoppingChanges(){
    const list=$('shoppingList');if(!list||list.dataset.nutrixBound)return;list.dataset.nutrixBound='1';
    list.addEventListener('change',event=>{
      const p=plan();if(!p)return;
      const home=event.target.closest('.home-amount');if(home){updateSmartCartLine(home);return;}
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