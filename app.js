'use strict';
(() => {
const $=s=>document.querySelector(s);
const dishes=[['pizza','Пицца'],['sushi','Суши'],['burger','Бургер'],['pasta','Паста'],['rollton','Ролтон'],['ramen','Рамен']];
const key='invitation-response-v1';
const fresh=()=>({step:0,date:'',time:'',foods:[],opened:false});
let state=fresh(),busy=false;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<=4){state={...fresh(),...saved};state.foods=Array.isArray(saved.foods)?saved.foods.filter(id=>dishes.some(d=>d[0]===id)):[];if(!validDate(state.date,state.time)&&state.step>2)state.step=2;if(!state.foods.length&&state.step===4)state.step=3}}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
function validDate(date,time){return /^\d{4}-\d{2}-\d{2}$/.test(date)&&/^\d{2}:\d{2}$/.test(time)&&Number.isFinite(new Date(date+'T'+time).getTime())&&new Date(date+'T'+time).getTime()>Date.now()}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
const img=(path,alt='',cls='hero')=>'<img class="'+cls+'" src="./assets/'+path+'" alt="'+alt+'" draggable="false">';
const title=text=>'<h1 id="heading" tabindex="-1">'+text+'</h1>';
const button=(id,text,extra='')=>'<button class="btn '+extra+'" id="'+id+'" type="button">'+text+'</button>';
function dateLabel(){return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(state.date+'T'+state.time))}
function selected(){return dishes.filter(d=>state.foods.includes(d[0]))}
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function go(step){
if(busy)return;
busy=true;
const screen=$('.screen');
screen.classList.add('screen-exit');
setTimeout(()=>{state.step=step;save();render(true);busy=false;if(step===4)burst($('#heading'))},reducedMotion()?0:180);
}
function advance(step,el){
if(busy)return;
busy=true;el.classList.add('shake');el.setAttribute('aria-disabled','true');burst(el);
setTimeout(()=>{busy=false;go(step)},reducedMotion()?0:480);
}
document.addEventListener('click',e=>{
const el=e.target.closest('button');
if(!el||el.disabled||el.id==='no'||el.id==='skip'||reducedMotion())return;
el.getAnimations().filter(a=>a.id==='tap-feedback').forEach(a=>a.cancel());
const animation=el.animate([{scale:1},{scale:.94,offset:.25},{scale:1.035,offset:.65},{scale:1}],{duration:360,easing:'ease-out'});
animation.id='tap-feedback';
},true);
function render(focus=false){
const progress=state.step*25;$('#fill').style.width=progress+'%';$('#heart').style.left=progress+'%';$('#progress').setAttribute('aria-valuenow',state.step+1);$('#progress').setAttribute('aria-label','Шаг '+(state.step+1)+' из 5');
let html='';
if(state.step===0)html=img('foto-meeting-step1-1.webp')+title('Ты пойдешь со мной\nна свидание?')+'<div class="actions">'+button('yes','Да')+'<div class="no-wrap">'+button('no','Нет','secondary')+img('meeting-kiss.webp','','kiss')+'</div></div>';
if(state.step===1)html=img('foto-meeting-step2-2.webp')+title('Подожди, ты действительно сказала да?')+button('confirm','Да Да');
if(state.step===2)html=img('foto-meeting-step3-1.webp')+title('И так... Когда ты свободна?')+'<form id="date-form" class="actions"><div class="fields"><label for="date">Дата<input id="date" type="date" required min="'+today()+'"></label><label for="time">Время<input id="time" type="time" required></label></div><p id="date-error" class="error" aria-live="polite"></p><button class="btn" id="date-next" type="submit" disabled>Выбери дату ❤️</button></form>';
if(state.step===3)html='<div class="food-intro">'+title('Что ты хочешь?')+'<p>)</p></div><div class="foods" role="group" aria-label="Выбери одно или несколько блюд">'+dishes.map(([id,name])=>'<button type="button" class="food" data-food="'+id+'" aria-pressed="'+state.foods.includes(id)+'">'+img('foto-meeting-food-'+id+'.webp',name,'')+'<span>'+name+'</span></button>').join('')+'</div>'+button('food-next','Дальше ❤️');
if(state.step===4)html='<div class="stack" aria-label="Выбранные блюда">'+selected().map(([id,name])=>img('foto-meeting-food-'+id+'.webp',name,'')).join('')+'</div>'+title('Рад то что не отказалась.')+'<p>Будь готова к '+dateLabel()+' в '+state.time+', я приеду за тобой</p><p class="summary-food">'+selected().map(d=>d[1]).join(' · ')+'</p><div class="final-tools">'+button('calendar','Добавить в календарь')+'<button id="share" class="text-button" type="button">Поделиться ответом</button><p id="share-status" role="status"></p></div>';
$('#card').innerHTML='<div class="screen">'+html+'</div>';
$('#navigation').innerHTML=(state.step>0?'<button class="text-button" id="back" type="button">Назад</button>':'')+(state.step===4?'<button class="text-button" id="restart" type="button">Пройти заново</button>':'');
if($('#back'))$('#back').onclick=()=>go(state.step-1);
if($('#restart'))$('#restart').onclick=()=>{state=fresh();save();render();setupScratch()};
if(state.step===0){
$('#yes').onclick=()=>advance(1,$('#yes'));
$('#no').onclick=()=>{
if(busy)return;
const no=$('#no'),kiss=$('.kiss');
if(no.disabled)return;
no.disabled=true;no.classList.add('no-disappear');kiss.classList.add('show');
$('#announcement').textContent='Лови поцелуй!';
setTimeout(()=>{
no.hidden=true;
if(no.isConnected&&document.activeElement===no)$('#yes').focus({preventScroll:true});
$('#announcement').textContent='';
},reducedMotion()?0:850);
};
}
if(state.step===1)$('#confirm').onclick=()=>advance(2,$('#confirm'));
if(state.step===2){$('#date').value=state.date;$('#time').value=state.time;const update=()=>{state.date=$('#date').value;state.time=$('#time').value;save();const valid=validDate(state.date,state.time);$('#date-next').disabled=!valid;$('#date-error').textContent=state.date&&state.time&&!valid?'Выбери дату и время в будущем.':''};$('#date').oninput=update;$('#time').oninput=update;$('#date-form').onsubmit=e=>{e.preventDefault();update();if(validDate(state.date,state.time))advance(3,$('#date-next'))};update()}
if(state.step===3){$('#food-next').disabled=!state.foods.length;document.querySelectorAll('[data-food]').forEach(b=>b.onclick=()=>{const id=b.dataset.food;state.foods=state.foods.includes(id)?state.foods.filter(x=>x!==id):[...state.foods,id];b.setAttribute('aria-pressed',state.foods.includes(id));$('#food-next').disabled=!state.foods.length;save()});$('#food-next').onclick=()=>{if(!validDate(state.date,state.time)){go(2);return}if(state.foods.length)advance(4,$('#food-next'))}}
if(state.step===4){$('#calendar').onclick=downloadCalendar;$('#share').onclick=share}
if(focus){$('#heading').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})}
}
function burst(el){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=el.getBoundingClientRect();for(let i=0;i<24;i++){const p=document.createElement('span');p.className='particle';p.textContent=['♥','💗','✨'][i%3];p.style.cssText='left:'+(r.x+r.width/2)+'px;top:'+(r.y+r.height/2)+'px;color:#f85589;--x:'+((Math.random()-.5)*440)+'px;--y:'+((Math.random()-.65)*390)+'px;--r:'+((Math.random()-.5)*240)+'deg';$('#effects').append(p);setTimeout(()=>p.remove(),1100)}}
function downloadCalendar(){const start=new Date(state.date+'T'+state.time),end=new Date(start.getTime()+2*60*60*1000);const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const text=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Invitation//Date//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+stamp(start)+'-date@invitation.local','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:Наше свидание ❤️','DESCRIPTION:'+selected().map(d=>d[1]).join(' / '),'END:VEVENT','END:VCALENDAR',''].join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Наше свидание.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function share(){const text='Да, идём на свидание! ❤️\n'+dateLabel()+' в '+state.time+'\n'+selected().map(d=>d[1]).join(', ');try{if(navigator.share){await navigator.share({title:'Наше свидание',text})}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);$('#share-status').textContent='Ответ скопирован — отправь его в сообщении.'}else{$('#share-status').textContent=text}}catch(e){if(e.name!=='AbortError')$('#share-status').textContent=text}}
let scratchCleanup=()=>{};
function setupScratch(){scratchCleanup();const layer=$('#scratch-layer'),canvas=$('#scratch'),ctx=canvas.getContext('2d',{willReadFrequently:true});layer.hidden=false;layer.classList.remove('leaving');$('#main').inert=true;let down=false,last=null,done=false,w=0,h=0,marks=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function stroke(a,b){ctx.globalCompositeOperation='destination-out';ctx.lineWidth=Math.max(52,Math.min(w,h)*.13);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(a.x*w,a.y*h);ctx.lineTo(b.x*w,b.y*h);ctx.stroke();ctx.beginPath();ctx.arc(b.x*w,b.y*h,ctx.lineWidth/2,0,Math.PI*2);ctx.fill()}
function paint(){w=innerWidth;h=innerHeight;const scale=Math.min(devicePixelRatio||1,2);canvas.width=w*scale;canvas.height=h*scale;ctx.setTransform(scale,0,0,scale,0,0);ctx.globalCompositeOperation='source-over';const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#ed9cba');gradient.addColorStop(.5,'#f5bad0');gradient.addColorStop(1,'#eaa2c1');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);ctx.fillStyle='#ffffff25';for(let x=32;x<w;x+=100)for(let y=35;y<h;y+=100){ctx.font='25px serif';ctx.fillText('♡',x,y)}ctx.textAlign='center';ctx.fillStyle='#713249';ctx.font='700 '+Math.min(38,w/10)+'px Comfortaa, sans-serif';ctx.fillText('Сотри меня ✨',w/2,h/2);ctx.font='600 14px Comfortaa, sans-serif';ctx.fillText('Здесь кое-что для тебя',w/2,h/2+40);marks.forEach(m=>stroke(m[0],m[1]))}
function open(){if(done)return;done=true;state.opened=true;save();$('#main').inert=false;layer.classList.add('leaving');scratchCleanup();setTimeout(()=>{layer.hidden=true;$('#heading').focus({preventScroll:true})},reduced?0:620)}
function point(e){return{x:e.clientX/w,y:e.clientY/h}}
function move(e){if(!down||done)return;e.preventDefault();const p=point(e);stroke(last,p);marks.push([last,p]);last=p}
function end(){if(!down)return;down=false;last=null;const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let clear=0,total=0;for(let i=3;i<data.length;i+=64){total++;if(data[i]<100)clear++}if(clear/total>.37)open()}
function start(e){if(e.button!==0&&e.pointerType==='mouse')return;down=true;last=point(e);canvas.setPointerCapture(e.pointerId);move(e)}
canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);window.addEventListener('resize',paint);$('#skip').onclick=open;
scratchCleanup=()=>{canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);window.removeEventListener('resize',paint)};
paint();document.fonts.ready.then(()=>{if(!done)paint()});
}
for(let i=0;i<28;i++){const flake=document.createElement('i');flake.className='flake';const size=3+Math.random()*6;flake.style.cssText='left:'+Math.random()*100+'%;width:'+size+'px;height:'+size+'px;animation-duration:'+(7+Math.random()*8)+'s;animation-delay:-'+Math.random()*15+'s';$('#snow').append(flake)}
render();if(state.opened)$('#scratch-layer').hidden=true;else setupScratch();
})();
(() => {
const audio=document.getElementById('music');
const toggle=document.getElementById('music-toggle');
let enabled=true,pending=false;
try{enabled=localStorage.getItem('invitation-music-enabled')!=='false'}catch{}
audio.volume=.35;
function update(){
const playing=!audio.paused&&!audio.ended;
toggle.setAttribute('aria-pressed',String(playing));
toggle.setAttribute('aria-label',playing?'Выключить музыку':'Включить музыку');
toggle.title=playing?'Выключить музыку':'Включить музыку';
toggle.querySelector('span').textContent=playing?'Музыка вкл.':'Музыка выкл.';
}
async function start(){
if(!enabled||pending||!audio.paused)return;
pending=true;
try{await audio.play();if(!enabled)audio.pause()}catch{}finally{pending=false;update()}
}
toggle.addEventListener('click',()=>{
enabled=audio.paused?true:false;
try{localStorage.setItem('invitation-music-enabled',String(enabled))}catch{}
if(enabled)start();else audio.pause();
update();
});
for(const type of ['pointerdown','pointerup','click','keydown']){
document.addEventListener(type,event=>{
if(event.target.closest?.('#music-toggle'))return;
start();
},{capture:true,passive:true});
}
audio.addEventListener('play',update);
audio.addEventListener('pause',update);
audio.addEventListener('error',()=>{
toggle.querySelector('span').textContent='Музыка недоступна';
toggle.title='Не удалось загрузить музыку';
});
update();start();
})();
