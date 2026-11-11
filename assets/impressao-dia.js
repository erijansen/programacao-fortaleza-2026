/* REV24 — Botões de impressão por dia; folha A4 completa, independente dos filtros. */
(function(){
'use strict';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.createElement('div');root.id='print-sheet';root.setAttribute('aria-label','Programação para impressão');document.body.appendChild(root);
function addHomeButtons(){
 document.querySelectorAll('#home-days .home-day').forEach(day=>{
  if(day.parentElement.classList.contains('home-day-wrap'))return;
  const d=day.dataset.home;const wrap=document.createElement('div');wrap.className='home-day-wrap';
  day.parentNode.insertBefore(wrap,day);wrap.appendChild(day);
  const b=document.createElement('button');b.type='button';b.className='home-day-print';b.textContent='🖨 PDF do dia';
  b.setAttribute('aria-label','Imprimir programação completa de '+dayName(d));b.onclick=()=>printDay(d);wrap.appendChild(b);
 });
}
function addDayButtons(){
 document.querySelectorAll('#events > section').forEach(sec=>{
  if(sec.querySelector('.day-print'))return;
  const h=sec.querySelector('h2');if(!h)return;
  const d=EVENTS.find(e=>dayName(e.date)===h.textContent.trim())?.date;
  if(!d)return;
  const row=document.createElement('div');row.className='day-heading';h.parentNode.insertBefore(row,h);row.appendChild(h);
  const b=document.createElement('button');b.type='button';b.className='day-print';b.textContent='🖨 Imprimir este dia em PDF';
  b.onclick=()=>printDay(d);row.appendChild(b);
 });
}
function printDay(d){printDays([d]);}
function printDays(days){
 const sheets=days.map(d=>{
  const ordered=orderDayEvents(EVENTS.filter(e=>e.date===d));
  const rows=ordered.map(e=>{
   const hour=safe(e.time)+(e.end?' – '+safe(e.end):'');
   const owner=e.owner?'<div class="print-meta">Responsável: '+safe(e.owner)+'</div>':'';
   const uniform=e.uniform&&!e.uniform.startsWith('Oficiais da ativa:')?'<div class="print-meta">Uniforme: '+safe(e.uniform)+'</div>':'';
   const notes=e.notes?'<div class="print-note">'+safe(e.notes)+'</div>':'';
   return '<tr><td class="print-time">'+hour+'</td><td><div class="print-title">'+safe(e.title)+'</div>'+owner+uniform+'</td><td>'+safe(e.location||'A confirmar')+'</td><td>'+(e.dn?'<span class="print-dn">DN-01 previsto</span>':'')+notes+'</td></tr>';
  }).join('');
  return '<section class="print-day-block'+(ordered.length>=20?' dense':'')+'"><div class="print-head"><div><h1>FORTALEZA 2026 · PROGRAMAÇÃO INTEGRADA</h1><p>Com3ºDN · Reunião Funcional DPC · IAM EAMCE / CPCE</p></div><div class="print-day">'+safe(dayName(d))+'</div></div><div class="print-sub">Horário local de Fortaleza · ASD: a ser definido · Previsões sujeitas a confirmação</div><table class="print-table"><colgroup><col style="width:11%"><col style="width:39%"><col style="width:15%"><col style="width:35%"></colgroup><thead><tr><th>Horário</th><th>Atividade e responsável</th><th>Local</th><th>DN-01 / Observações</th></tr></thead><tbody>'+rows+'</tbody></table><div class="print-footer"><span>REV30 · 11NOV2026 · '+safe(d.slice(8))+'NOV</span><span>Fonte: Programação Integrada · Com3ºDN</span></div></section>';
 }).join('');
 root.innerHTML=sheets;window.print();
}
function printSelected(){
 const selected=document.querySelector('#days [data-d].active')?.dataset.d;
 printDays(selected&&selected!=='all'?[selected]:[...new Set(EVENTS.map(e=>e.date))].sort());
}
window.printDay=printDay;window.printSelected=printSelected;
function syncBottomDays(){
 const top=document.getElementById('days'),eventsEl=document.getElementById('events');
 if(!top||!eventsEl)return;
 let bottom=document.getElementById('days-bottom');
 if(!bottom){
  bottom=document.createElement('nav');bottom.id='days-bottom';bottom.className='days';
  bottom.setAttribute('aria-label','Alternar entre os dias ao final da programação');
  eventsEl.insertAdjacentElement('afterend',bottom);
 }
 bottom.innerHTML=top.innerHTML;
 bottom.querySelectorAll('button[data-d]').forEach(b=>{
  b.type='button';
  b.onclick=()=>{
   const target=top.querySelector('button[data-d="'+b.dataset.d+'"]');
   if(!target)return;
   target.click();
   const title=document.getElementById('daytitle');
   if(title)title.scrollIntoView({block:'start',behavior:'smooth'});
  };
 });
}
addHomeButtons();addDayButtons();syncBottomDays();
const target=document.getElementById('events');
if(target)new MutationObserver(()=>{addDayButtons();syncBottomDays();}).observe(target,{childList:true});
const old=document.querySelector('.actions .act');
if(old){old.onclick=printSelected;old.textContent='🖨 Imprimir em PDF (dia selecionado ou todos)';}
})();