
// group: normal / elite / 300 / 500. Same-name goods have different IDs.
// 潮流ストア専用。元の孤島ストアとは状態・商品・画像を完全分離。
const items=[
  ['t01','シークレット獣の欠片選択パック',250,10,'normal'],
  ['t02','OCチップ欠片選択ボックス',250,10,'normal'],
  ['t03','プリスティンライフ',130,10,'normal'],
  ['t04','精製チップ',100,10,'normal'],
  ['t05','シーズンの功績（20pt）',20,5,'normal'],
  ['t06','シーズンの功績（40pt）',40,10,'normal'],
  ['t07','シーズンの功績（80pt）',80,20,'normal'],
  ['t08','獣の欠片選択パック',100,20,'normal'],
  ['t09','レジェンドチップ欠片選択ボックス',110,20,'normal'],
  ['t10','初級部隊拡張（4時間）',250,5,'normal'],
  ['t11','訓練レベル2の拡大（5,000）',160,10,'normal'],
  ['t12','回復スピードアップ4時間',70,10,'normal'],
  ['t13','回復スピードアップ60分',30,30,'normal'],
  ['t14','訓練スピードアップ60分',30,30,'normal'],
  ['t15','上級ランダム資源パック（120pt）',120,100,'normal'],
  ['t16','上級ランダム資源パック（180pt）',180,300,'normal'],
  ['t17','中級ランダム資源パック',7,null,'normal'],
  ['t18','救急注射器',650,6,'200'],
  ['t19','訓練スピードアップ4時間',70,20,'200'],
  ['t20','訓練レベル3の拡大（10,000）',320,20,'200'],
  ['t21','ナノ触媒（10個）',300,10,'200']
].map(([id,name,price,max,group])=>({id,name,price,max,group}));
const imageNames=Object.fromEntries(items.map(it=>[it.id,it.id]));
const groupLabels={normal:'通常',200:'200M'};
const storageKey='dls-tide-store-sim-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey))||{}}catch(e){}
const state={budget:Number.isFinite(+saved.budget)?+saved.budget:0,raid:[0,200].includes(+saved.raid)?+saved.raid:0,bought:saved.bought||{},plan:saved.plan||{},hideSold:!!saved.hideSold,limitOn:typeof saved.limitOn==='boolean'?saved.limitOn:true};
const $=id=>document.getElementById(id),fmt=x=>Math.round(x).toLocaleString('ja-JP');
function isUnlocked(g){return g==='normal'||g==='200'&&state.raid>=200}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch(e){}}
function currentPlannedCost(){return items.reduce((sum,it)=>sum+(state.plan[it.id]||0)*it.price,0)}
function maxAffordable(it){return Math.max(0,Math.floor((state.budget-(currentPlannedCost()-(state.plan[it.id]||0)*it.price))/it.price))}
function validPlan(it,target){const available=it.max===null?999999:Math.max(0,it.max-(state.bought[it.id]||0));return Math.min(available,Math.max(0,target),state.limitOn?maxAffordable(it):999999)}
function goalText(g){return g.m===0?'0':g.m<1?`${g.m*1000}K`:`${fmt(g.m)}M`}
function changeCount(it,kind,delta){const b=state.bought[it.id]||0,p=state.plan[it.id]||0;const limit=it.max===null?999999:it.max;if(kind==='bought'){state.bought[it.id]=Math.min(limit,Math.max(0,b+delta));state.plan[it.id]=validPlan(it,Math.min(p,Math.max(0,limit-state.bought[it.id])));}else{if(!isUnlocked(it.group))return;state.plan[it.id]=validPlan(it,Math.max(0,p+delta));}save();render()}
function setPlanCount(it,count){if(!isUnlocked(it.group))return;const available=it.max===null?999999:Math.max(0,it.max-(state.bought[it.id]||0));state.plan[it.id]=validPlan(it,Math.min(available,count));save();render()}
function setBoughtCount(it,count){
 const limit=it.max===null?999999:it.max;
 const next=Math.min(limit,Math.max(0,Math.floor(Number(count)||0)));
 state.bought[it.id]=next;
 state.plan[it.id]=validPlan(it,Math.min(state.plan[it.id]||0,Math.max(0,limit-next)));
 save();render();
}
function setCountInput(it,kind,value){
 const raw=String(value).trim();
 // Blank/non-numeric entries revert to zero; cap to the item exchange limit.
 const count=raw===''?0:Math.floor(Number(raw));
 if(!Number.isFinite(count)){render();return}
 if(kind==='bought')setBoughtCount(it,count);
 else setPlanCount(it,count);
}
function renderCatalog(){
 $('catalog').innerHTML='';
 for(const it of items){
  const p=state.plan[it.id]||0,b=state.bought[it.id]||0,unlocked=isUnlocked(it.group);
  if(state.hideSold&&it.max!==null&&b>=it.max&&p===0)continue;
  const div=document.createElement('div');
  div.className='item'+(unlocked?'':' locked')+(it.max!==null&&b+p>=it.max?' complete':'');
  const available=it.max===null?null:Math.max(0,it.max-b);
  const maxLabel=it.max===null?'なし':fmt(it.max);const affordable=state.limitOn?maxAffordable(it):999999;
  const img=document.createElement('img');img.className='itemimg';img.alt='';img.loading='lazy';
  img.src='images/'+(imageNames[it.id]||it.id)+'.png';img.onerror=()=>{img.style.visibility='hidden'};
  div.appendChild(img);
  const body=document.createElement('div');body.className='itembody';
  body.innerHTML=`<div class="itop"><div class="iname"></div><span class="tag">${groupLabels[it.group]}${unlocked?'':' 🔒'}</span></div><div class="sub"><strong class="price">${fmt(it.price)}<small> pt</small></strong><span class="limit">上限 ${maxLabel} 個</span></div><div class="itemcontrols">
  <div class="bought-control"><label for="b-${it.id}">交換済み</label><div class="quantity"><button type="button" class="bminus" aria-label="交換済みを減らす" ${b<=0?'disabled':''}>−</button><input id="b-${it.id}" class="count-input binput" type="number" min="0" ${it.max!==null?`max="${it.max}"`:''} step="1" inputmode="numeric" aria-label="${it.name}の交換済み数" value="${b}"><button type="button" class="bplus" aria-label="交換済みを増やす" ${it.max!==null&&b>=it.max?'disabled':''}>＋</button></div><div class="plan-shortcuts"><button type="button" class="bzero" ${b===0?'disabled':''}>0個</button><button type="button" class="bmax" ${it.max===null||b>=it.max?'disabled':''} title="交換済み数を交換上限にする">MAX</button></div></div>
  <div class="plan-control"><label for="p-${it.id}">交換予定 ${available===null?'':`(残${available})`}</label><div class="quantity"><button type="button" class="minus" aria-label="交換予定を減らす" ${!unlocked||p<=0?'disabled':''}>−</button><input id="p-${it.id}" class="count-input pinput" type="number" min="0" ${available!==null?`max="${available}"`:''} step="1" inputmode="numeric" aria-label="${it.name}の交換予定数" value="${p}" ${!unlocked?'disabled':''}><button type="button" class="plus" aria-label="交換予定を増やす" ${!unlocked||(available!==null&&p>=available)||(state.limitOn&&p>=affordable)?'disabled':''}>＋</button></div><div class="plan-shortcuts"><button type="button" class="zero" ${!unlocked||p===0?'disabled':''}>0個</button><button type="button" class="max" ${!unlocked||(it.max===null&&!state.limitOn)||(it.max!==null&&p>=available)||(state.limitOn&&p>=affordable)?'disabled':''} title="${it.max===null?'所持ポイントで買える最大数を選択（ON時のみ）':'残り交換可能数をすべて選択'}">MAX</button></div></div></div>`;
  if(it.max!==null&&b+p>=it.max){const t=document.createElement('span');t.className='done-label';t.textContent='✓ 選択完了';body.querySelector('.itop').appendChild(t)}
  body.querySelector('.iname').textContent=it.name;
  for(const [selector,kind,delta] of [['.bminus','bought',-1],['.bplus','bought',1],['.minus','plan',-1],['.plus','plan',1]])body.querySelector(selector).addEventListener('click',()=>changeCount(it,kind,delta));
  body.querySelector('.bzero').addEventListener('click',()=>setBoughtCount(it,0));
  body.querySelector('.bmax').addEventListener('click',()=>setBoughtCount(it,it.max===null?0:it.max));
  body.querySelector('.zero').addEventListener('click',()=>setPlanCount(it,0));
  body.querySelector('.max').addEventListener('click',()=>{if(it.max===null){if(state.limitOn)setPlanCount(it,maxAffordable(it));}else{setPlanCount(it,Math.max(0,it.max-(state.bought[it.id]||0)));}});
  for(const [selector,kind] of [['.binput','bought'],['.pinput','plan']]){
   const field=body.querySelector(selector);
   field.addEventListener('change',()=>setCountInput(it,kind,field.value));
   field.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();field.blur()}});
  }
  div.appendChild(body);$('catalog').appendChild(div);
 }
}
function raidGoal(needed){
 // 潮流イベント専用の報酬段階で試算（孤島レイドとは初期段階が異なる）
 if(needed<=0)return {m:0,reward:0};
 const steps=[[0.7,30],[2.7,70],[6,120],[10,200]];
 for(const [m,reward] of steps){if(needed<=reward)return {m,reward}}
 const n=Math.ceil((needed-200)/500);
 return {m:10+5*n,reward:200+500*n};
}
function rewardForRaidM(m){
 if(m<0.7)return 0;
 if(m<2.7)return 30;
 if(m<6)return 70;
 if(m<10)return 120;
 return 200+500*Math.floor((m-10)/5);
}
function targetWithUnlock(needed,includeBought){
 const g=raidGoal(needed);
 const needs200=items.some(it=>it.group==='200' && ((state.plan[it.id]||0)>0 || (includeBought && (state.bought[it.id]||0)>0)));
 if(needs200 && g.m<200){g.m=200;g.reward=rewardForRaidM(200)}
 return g;
}
function render(){
 const cost=currentPlannedCost(),remaining=state.budget-cost;
 document.querySelectorAll('[data-limit]').forEach(el=>el.classList.toggle('active',state.limitOn===(el.dataset.limit==='on')));
 $('modeHelp').textContent=state.limitOn
  ? 'ON：所持ポイントを超える交換予定は追加できません。交換済み数は残高から引きません。'
  : 'OFF：所持ポイントを超えて交換予定を選択できます。下に必要な潮流イベントの累計ポイントを表示します。';
 $('goalBox').hidden=state.limitOn;
 const boughtCost=items.reduce((s,it)=>s+(state.bought[it.id]||0)*it.price,0);
 const gPlan=targetWithUnlock(cost,false);
 const gTotal=targetWithUnlock(cost+boughtCost,true);
 $('raidTarget').textContent=goalText(gPlan);
 $('rewardAtTarget').textContent='交換ポイント累計 '+fmt(gPlan.reward)+' pt';
 $('raidTargetTotal').textContent=goalText(gTotal);
 $('rewardAtTotal').textContent='交換ポイント累計 '+fmt(gTotal.reward)+' pt';
 $('budgetStat').textContent=fmt(state.budget);
 $('costStat').textContent=fmt(cost);
 $('remainStat').textContent=fmt(remaining);
 $('remainStat').className=remaining<0?'red':'green';
 $('warning').innerHTML=remaining<0?`<div class="warn">⚠️ ポイントが ${fmt(-remaining)} 不足しています。${state.limitOn?'交換予定を減らしてください。':'OFFモードでは必要な潮流イベントの累計ポイントを下に表示しています。'}</div>`:'';
 document.querySelectorAll('[data-raid]').forEach(el=>el.classList.toggle('active',+el.dataset.raid===state.raid));
 $('budget').value=state.budget;
 renderCatalog();
 const chosen=items.filter(it=>(state.plan[it.id]||0)>0);
 $('summary').innerHTML=chosen.length
  ? '<table><thead><tr><th>商品</th><th>単価</th><th>個数</th><th>小計</th></tr></thead><tbody>'+chosen.map(it=>`<tr><td>${it.name}</td><td>${fmt(it.price)}</td><td>${fmt(state.plan[it.id])}</td><td>${fmt(it.price*state.plan[it.id])}</td></tr>`).join('')+`</tbody><tfoot><tr><th>合計</th><th></th><th>${fmt(chosen.reduce((s,x)=>s+state.plan[x.id],0))}</th><th>${fmt(cost)}</th></tr></tfoot></table>`
  : '<div class="empty">まだ交換予定の商品がありません。</div>';
}
function normalizePlans(){let remain=state.budget;for(const it of items){const b=state.bought[it.id]||0,p=state.plan[it.id]||0;const capped=Math.max(0,Math.min(p,it.max===null?p:it.max-b,Math.floor(remain/it.price)));state.plan[it.id]=capped;remain-=capped*it.price}}
$('limitBtns').addEventListener('click',e=>{const btn=e.target.closest('[data-limit]');if(!btn)return;const next=btn.dataset.limit==='on';if(next&&currentPlannedCost()>state.budget){if(!confirm('上限をONにすると、予算を超えている交換予定を商品順に減らします。よろしいですか？'))return;normalizePlans()}state.limitOn=next;save();render()});
$('budget').addEventListener('change',e=>{state.budget=Math.max(0,Math.floor(+e.target.value||0));if(state.limitOn)normalizePlans();save();render()});$('raidBtns').addEventListener('click',e=>{const el=e.target.closest('[data-raid]');if(!el)return;state.raid=+el.dataset.raid;items.filter(x=>!isUnlocked(x.group)).forEach(x=>state.plan[x.id]=0);save();render()});$('hideSold').checked=state.hideSold;$('hideSold').addEventListener('change',e=>{state.hideSold=e.target.checked;save();renderCatalog()});function resetPlannedOnly(){if(confirm('交換予定だけをすべて0にしますか？（交換済み数は維持）')){state.plan={};save();render()}}$('resetPlan').addEventListener('click',resetPlannedOnly);$('resetPlanTop').addEventListener('click',resetPlannedOnly);$('resetAll').addEventListener('click',()=>{if(confirm('保有ポイント・解放状況・交換済み数・交換予定をすべて初期化しますか？')){state.budget=0;state.raid=0;state.bought={};state.plan={};state.hideSold=false;state.limitOn=true;$('hideSold').checked=false;save();render()}});$('copy').addEventListener('click',async()=>{const chosen=items.filter(x=>state.plan[x.id]>0),total=chosen.reduce((s,x)=>s+x.price*state.plan[x.id],0),msg=['【潮流ストア｜交換予定】',...chosen.map(x=>`${x.name} × ${state.plan[x.id]}（${fmt(x.price*state.plan[x.id])}pt）`),`合計：${fmt(total)} pt`,`残高：${fmt(state.budget-total)} pt`].join('\n');try{await navigator.clipboard.writeText(msg);alert('交換予定リストをコピーしました')}catch(e){prompt('こちらをコピーしてください',msg)}});if(state.limitOn&&currentPlannedCost()>state.budget)state.limitOn=false;render();
