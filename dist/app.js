const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
/* 시작하기는 제일 먼저 묶어 둔다 — 아래에서 무엇이 터져도 첫 화면에 갇히지는 않도록.
   (옛 저장본 때문에 초기화가 죽어 버튼이 아예 안 붙은 적이 있다) */
$('#enter-app').onclick=()=>{$('#landing').classList.add('hidden');
 $$('.app > :not(#landing)').forEach(e=>e.inert=false);
 $$('.page').forEach(e=>e.classList.toggle('hidden',e.id!=='home'))};
const paths={home:'<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3Z"/>',book:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 3v18m3-13h5m-5 4h5"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14q4 5 8 0M8 8v1m8-1v1"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',plus:'<path d="M12 4v16M4 12h16"/>',image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8 11 8-5m-8 7 8 5"/>',back:'<path d="m14 5-7 7 7 7"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M5 21v-3a7 7 0 0 1 14 0v3Z"/>',palette:'<path d="M12 3a9 9 0 1 0 0 18c4 0 1-5 4-5h2c5 0 4-13-6-13Z"/><path d="M7 9h.01M10 6h.01M15 7h.01M7 14h.01"/>',trash:'<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',pen:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',download:'<path d="M12 3v11m0 0 4.5-4.5M12 14l-4.5-4.5M4 20h16"/>'};
Object.assign(paths,{bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/>',shop:'<path d="M3 9h18l-2-6H5L3 9Zm1 0v12h16V9M9 21v-7h6v7M3 9q2 5 4.5 0 2 5 4.5 0 2 5 4.5 0 2 5 4.5 0"/>',feed:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 16h5"/><rect x="8" y="10" width="8" height="3" rx="1"/>'});
$$('[data-icon]').forEach(e=>e.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[e.dataset.icon]||paths.book}</svg>`);
const photos={dusk:'assets/photos/dusk.jpg',clouds:'assets/photos/clouds.jpg',harbor:'assets/photos/harbor.jpg',forest:'assets/photos/forest.jpg',garden:'assets/photos/garden.jpg',lanterns:'assets/photos/lanterns.jpg',sky:'assets/photos/sky.jpg',street:'assets/photos/street.jpg',cat:'assets/photos/cat.jpg'};
const PACKS=[
{id:'hand',name:'손그림',file:'assets/stickers.png',blend:'multiply',cells:[['고양이','동물'],['토끼','동물'],['반짝 별','감성'],['하트','감성'],['데이지','꽃'],['카메라','일상'],['튤립','꽃'],['아기 고양이','동물'],['커피','일상'],['나비','꽃'],['달과 별','감성'],['초록 잎','꽃'],['곰인형','동물'],['비행기','일상'],['편지','감성'],['체크 리본','감성']]},
{id:'pixel',name:'도트',file:'assets/stickers-pixel.png',blend:'normal',cells:[['도트 고양이','동물'],['도트 강아지','동물'],['도트 병아리','동물'],['도트 개구리','동물'],['도트 튤립','꽃'],['도트 선인장','꽃'],['도트 해바라기','꽃'],['네잎클로버','꽃'],['플로피 디스크','일상'],['게임기','일상'],['컵라면','일상'],['자판기','일상'],['도트 하트','감성'],['도트 별','감성'],['말풍선','감성'],['무지개','감성']]},
{id:'retro',name:'레트로',file:'assets/stickers-retro.png',blend:'normal',cells:[['호랑이','동물'],['오리','동물'],['판다','동물'],['꿀벌','동물'],['데이지','꽃'],['장미','꽃'],['야자수','꽃'],['레몬','꽃'],['카세트','일상'],['롤러스케이트','일상'],['소다','일상'],['전화기','일상'],['번개','감성'],['무지개','감성'],['스마일','감성'],['별똥별','감성']]},
{id:'ink',name:'먹선',file:'assets/stickers-ink.png',blend:'normal',cells:[['고양이','동물'],['작은 새','동물'],['물고기','동물'],['토끼','동물'],['잎 줄기','꽃'],['유칼립투스','꽃'],['민들레','꽃'],['국화','꽃'],['만년필','일상'],['책','일상'],['찻잔','일상'],['안경','일상'],['초승달','감성'],['작은 별','감성'],['하트','감성'],['리본','감성']]},
{id:'jelly',name:'젤리',file:'assets/stickers-jelly.png',blend:'normal',cells:[['젤리 고양이','동물'],['젤리 곰','동물'],['젤리 토끼','동물'],['젤리 오리','동물'],['젤리 꽃','꽃'],['젤리 잎','꽃'],['체리','꽃'],['복숭아','꽃'],['우유팩','일상'],['소프트콘','일상'],['사탕','일상'],['비누방울','일상'],['젤리 하트','감성'],['젤리 별','감성'],['작은 구름','감성'],['물방울','감성']]},
{id:'foil',name:'금박',file:'assets/stickers-foil.png',blend:'normal',cells:[['고양이','동물'],['작은 새','동물'],['나비','동물'],['물고기','동물'],['나뭇가지','꽃'],['깃털','꽃'],['잎','꽃'],['꽃 한 송이','꽃'],['열쇠','일상'],['편지','일상'],['찻잔','일상'],['책','일상'],['초승달','감성'],['별자리','감성'],['하트','감성'],['리본','감성']]},
{id:'press',name:'압화',file:'assets/stickers-press.png',blend:'normal',cells:[['나비 표본','동물'],['잠자리','동물'],['무당벌레','동물'],['달팽이','동물'],['팬지','꽃'],['안개꽃','꽃'],['네잎클로버','꽃'],['고사리','꽃'],['티백','일상'],['편지 조각','일상'],['실','일상'],['단추','일상'],['마른 장미','감성'],['라벤더','감성'],['깃털','감성'],['단풍잎','감성']]},
{id:'stamp',name:'도장',file:'assets/stickers-stamp.png',blend:'normal',cells:[['고양이 우표','동물'],['새 우표','동물'],['토끼 도장','동물'],['물고기 도장','동물'],['꽃 우표','꽃'],['잎 도장','꽃'],['나무 우표','꽃'],['열매 도장','꽃'],['소인','일상'],['항공 우표','일상'],['기차 우표','일상'],['커피 도장','일상'],['하트 도장','감성'],['별 우표','감성'],['달 도장','감성'],['리본 우표','감성']]},
{id:'clay',name:'펠트',file:'assets/stickers-clay.png',blend:'normal',cells:[['곰','동물'],['양','동물'],['오리','동물'],['고슴도치','동물'],['튤립','꽃'],['잎','꽃'],['버섯','꽃'],['도토리','꽃'],['머그','일상'],['책','일상'],['양말','일상'],['주전자','일상'],['하트','감성'],['별','감성'],['구름','감성'],['무지개','감성']]}];
const PACK_BY_ID=Object.fromEntries(PACKS.map(p=>[p.id,p]));
const stickers=PACKS[0].cells.map((c,i)=>[c[0],c[1],i]);
const PAPERS=[['plain','무지'],['ruled','줄글'],['dot','땡땡이'],['grid','모눈'],['month','월간 플래너'],['weekly','주간 플래너'],['todo','체크리스트'],['note','공책'],['staff','오선지'],['graph','작은 모눈'],['dash','사선'],['iso','삼각 격자']];
const WEEKDAYS=['일','월','화','수','목','금','토'];
/* 종이의 일부로 얹히는 글자. 자리는 1200×1000 기준 %라 미리보기에서도 같이 줄어든다. */
const PAPER_CHROME={
 month:()=>[...WEEKDAYS,'메모'].map((text,i)=>({text,left:i*150/12,top:3.4,width:150/12,
  cls:'mid '+(i===0?'sun':i===6?'sat':i===7?'memo':'')})),
 weekly:()=>['월','화','수','목','금','토','일','메모'].map((text,i)=>({text,
  left:((i<4?0:600)+24)/12,top:(i%4*250+9)/10,width:120/12,
  cls:'left '+(text==='일'?'sun':text==='토'?'sat':text==='메모'?'memo':'')}))};
const PAPER_COLORS=['#fffdf7','#fdf4e9','#f6f3ea','#edf2f9','#f8eff1','#eef4ee','#e8ebf4','#ffffff'];
let customStickers;try{customStickers=JSON.parse(localStorage.getItem('diaru-stickers-v1'))}catch{}if(!Array.isArray(customStickers))customStickers=[];
function saveCustom(){try{localStorage.setItem('diaru-stickers-v1',JSON.stringify(customStickers));return true}catch{toast('스티커 보관함이 꽉 찼어요. 쓰지 않는 걸 지워주세요.');return false}}
function customArt(s){const i=el('img','custom-art');i.src=s.src;i.alt=s.name||'내 스티커';return i}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}function art(i,cls='',pack='hand'){const a=el('span','art pack-'+(PACK_BY_ID[pack]?pack:'hand')+' '+cls);a.style.setProperty('--sx',(i%4)*100/3+'%');a.style.setProperty('--sy',Math.floor(i/4)*100/3+'%');return a}
let diaries;try{diaries=JSON.parse(localStorage.getItem('diaru-diaries-v1'))}catch{}if(!Array.isArray(diaries))diaries=[];
/* 견본 기록은 두지 않는다 — 가입하고 들어오면 '나의 기록'은 비어 있어야 한다.
   예전 판에서 깔려 저장된 것이 있으면 여기서 걷어낸다. */
const kept=diaries.filter(d=>d&&!String(d.id||'').startsWith('sample-'));
if(kept.length!==diaries.length){diaries=kept;try{localStorage.setItem('diaru-diaries-v1',JSON.stringify(diaries))}catch{}}
else diaries=kept;
let current=null,selected=null,dirty=false,scale=1,zoom=1,activePage=0,toastTimer;function toast(m){$('#toast').textContent=m;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
function goto(page){$('#landing').classList.add('hidden');$$('.app > :not(#landing)').forEach(e=>e.inert=false);$$('.page').forEach(e=>e.classList.toggle('hidden',e.id!==page));$$('.bottom-nav [data-page]').forEach(e=>e.classList.toggle('active',e.dataset.page===(page==='stickers'?'shop':page)));$('main').scrollTop=0;if(page==='feed')renderFeed();if(page==='notifications'){renderNotifications();$('.notification-button').classList.remove('unread')}}
$$('[data-page]').forEach(b=>b.onclick=()=>goto(b.dataset.page));$$('[data-goto]').forEach(b=>b.onclick=()=>goto(b.dataset.goto));$('.logo').onclick=e=>{e.preventDefault();goto('home')};
const shortDate=s=>{const m=/^(\d{4})\.(\d{2})\.(\d{2})$/.exec(s||'');if(!m)return s||'';return m[2]+'.'+m[3]+' ('+'일월화수목금토'[new Date(+m[1],+m[2]-1,+m[3]).getDay()]+')'};
function renderDiaries(filter='전체'){['#home-diaries','#all-diaries','#profile-diaries'].forEach(target=>{const root=$(target);root.replaceChildren();let list=target==='#all-diaries'?diaries.filter(d=>filter==='전체'||d.subtitle===filter):diaries.slice(0,3);list.forEach(d=>{const card=el('button','diary-card open');card.append(spreadPreview(d),el('p','',shortDate(d.date)),el('h3','',target==='#home-diaries'?(d.subtitle||d.title):d.title));card.onclick=()=>openEditor(d);root.append(card)});if(target==='#profile-diaries'&&!list.length){const empty=el('p','storage-note','아직 남긴 기록이 없어요.');root.append(empty)}
 if(target!=='#profile-diaries'){const add=el('button','blank');add.setAttribute('aria-label','새 다이어리 만들기');add.append(el('b','','＋'),el('span','','새로운 기록'));add.onclick=()=>openEditor();root.append(add)}});$('#diary-total').textContent=diaries.length;$('#profile-count').textContent=diaries.length;renderFeed()}
$$('.diary-chips button').forEach(b=>b.onclick=()=>{$$('.diary-chips button').forEach(c=>c.classList.toggle('selected',c===b));renderDiaries(b.textContent)});
let category='전체',stickerPack='손그림'; // 처음엔 한 팩만 — '전체'를 누르면 시트 아홉 장을 한꺼번에 받는다
function uploadTile(label){const b=el('button','add-sticker');b.append(el('b','','＋'));if(label)b.append(el('small','',label));b.setAttribute('aria-label','사진으로 내 스티커 만들기');b.onclick=()=>$('#sticker-input').click();return b}
function renderStickers(){const q=$('#sticker-search').value.trim(),grid=$('#sticker-grid');grid.replaceChildren();grid.append(uploadTile('사진 올리기'));
const mine=(stickerPack==='전체'||stickerPack==='내 스티커')?customStickers.filter(s=>!q||(s.name||'').includes(q)):[];
mine.forEach(s=>{const b=el('button','custom-sticker');b.setAttribute('aria-label',(s.name||'내 스티커')+' 스티커');b.append(customArt(s),el('small','',s.name||'내 스티커'));const del=el('i','del','×');del.onclick=e=>{e.stopPropagation();if(!confirm('이 스티커를 지울까요?'))return;customStickers=customStickers.filter(x=>x.id!==s.id);saveCustom();renderStickers();renderEditorStickers()};b.append(del);b.onclick=()=>{openEditor();placePiece({type:'sticker',src:s.src,content:s.name||'내 스티커',x:380,y:350})};grid.append(b)});
const list=stickerPack==='내 스티커'?[]:PACKS.filter(p=>stickerPack==='전체'||p.name===stickerPack).flatMap(p=>p.cells.map((c,i)=>({pack:p,name:c[0],cat:c[1],i}))).filter(s=>(category==='전체'||category===s.cat)&&(!q||(s.name+s.cat+s.pack.name).includes(q)));
list.forEach(s=>{const b=el('button');b.setAttribute('aria-label',s.pack.name+' '+s.name+' 스티커');b.append(art(s.i,'',s.pack.id),el('small','',s.name));b.onclick=()=>{openEditor();placePiece({type:'sticker',sprite:s.i,pack:s.pack.id,content:s.name,x:380,y:350})};grid.append(b)});
$('#sticker-count').textContent=(PACKS.length*16+customStickers.length)+' STICKERS';
$('#sticker-heading').textContent=stickerPack==='전체'?'화풍별 스티커':stickerPack;
if(!list.length&&!mine.length)grid.append(el('p','storage-note','검색 결과가 없어요.'))}
['전체',...PACKS.map(p=>p.name),'내 스티커'].forEach(c=>{const b=el('button',c===stickerPack?'selected':'',c);b.onclick=()=>{stickerPack=c;$$('#sticker-packs button').forEach(x=>x.classList.toggle('selected',x===b));renderStickers()};$('#sticker-packs').append(b)});
['전체','동물','꽃','일상','감성'].forEach(c=>{const b=el('button',c==='전체'?'selected':'',c);b.onclick=()=>{category=c;$$('#sticker-categories button').forEach(x=>x.classList.toggle('selected',x===b));renderStickers()};$('#sticker-categories').append(b)});$('#sticker-search').oninput=renderStickers;
$('#sticker-input').onchange=e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(!file.type.startsWith('image/')){toast('이미지 파일을 선택해주세요.');return}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas'),r=Math.min(1,360/Math.max(img.width,img.height));c.width=Math.round(img.width*r)||1;c.height=Math.round(img.height*r)||1;c.getContext('2d').drawImage(img,0,0,c.width,c.height);const src=c.toDataURL('image/png'),name=((file.name||'').replace(/\.[^.]+$/,'').slice(0,12)||'내 스티커');const s={id:'cs-'+Date.now().toString(36),name,src},prev=customStickers;customStickers=[s,...customStickers].slice(0,30);if(!saveCustom()){customStickers=prev;return}renderStickers();renderEditorStickers();if($('#editor').classList.contains('hidden'))toast('내 스티커에 담았어요.');else{placePiece({type:'sticker',src,content:name,x:140+Math.random()*260,y:200+Math.random()*300});$('#editor-drawer').classList.add('hidden');toast('내 스티커를 붙였어요.')}};img.onerror=()=>toast('JPG 또는 PNG 사진으로 다시 시도해주세요.');img.src=reader.result};reader.readAsDataURL(file)};
let drawerPack='hand';
function renderEditorStickers(){const root=$('#editor-stickers');if(!root)return;root.replaceChildren();root.append(uploadTile());
if(drawerPack==='mine'){if(!customStickers.length)root.append(el('p','storage-note','＋ 를 눌러 사진을 스티커로 만들어요.'));customStickers.forEach(s=>{const b=el('button','custom-sticker');b.title=s.name||'내 스티커';b.setAttribute('aria-label',(s.name||'내 스티커')+' 붙이기');b.append(customArt(s));b.onclick=()=>{placePiece({type:'sticker',src:s.src,content:s.name||'내 스티커',x:100+Math.random()*320,y:150+Math.random()*370});$('#editor-drawer').classList.add('hidden')};root.append(b)});return}
const pack=PACK_BY_ID[drawerPack]||PACKS[0];pack.cells.forEach((c,i)=>{const b=el('button');b.title=c[0];b.setAttribute('aria-label',c[0]+' 붙이기');b.append(art(i,'',pack.id));b.onclick=()=>{placePiece({type:'sticker',sprite:i,pack:pack.id,content:c[0],x:100+Math.random()*320,y:150+Math.random()*370});$('#editor-drawer').classList.add('hidden')};root.append(b)})}
[...PACKS.map(p=>[p.id,p.name]),['mine','내 것']].forEach(([id,name])=>{const b=el('button',id===drawerPack?'selected':'',name);b.onclick=()=>{drawerPack=id;$$('#drawer-packs button').forEach(x=>x.classList.toggle('selected',x===b));renderEditorStickers()};$('#drawer-packs').append(b)});
function openDrawer(kind){const d=$('#editor-drawer');if(!d.classList.contains('hidden')&&d.dataset.kind===kind){d.classList.add('hidden');return}d.dataset.kind=kind;d.classList.remove('hidden');$('#drawer-title').textContent=kind==='papers'?'속지 바꿔 끼우기':'스티커 붙이기';$('#drawer-packs').classList.toggle('hidden',kind!=='stickers');$('#editor-stickers').classList.toggle('hidden',kind!=='stickers');$('#editor-papers').classList.toggle('hidden',kind!=='papers')}
function chromeNode(pick,mini){const spec=PAPER_CHROME[pick];if(!spec)return null;
 const chrome=el('div','paper-chrome'+(mini?' mini':''));
 spec().forEach(s=>{const n=el('span',s.cls,s.text);n.style.left=s.left+'%';n.style.top=s.top+'%';n.style.width=s.width+'%';chrome.append(n)});
 return chrome}
function paintPaperChrome(pick){const paper=$('#paper');paper.querySelector('.paper-chrome')?.remove();
 const chrome=chromeNode(pick,false);if(chrome)paper.prepend(chrome)}
function applyPaper(id){const p=$('#paper'),pick=PAPERS.some(([k])=>k===id)?id:'plain';PAPERS.forEach(([k])=>p.classList.toggle('p-'+k,k===pick));p.dataset.paper=pick;paintPaperChrome(pick);$$('#paper-patterns button').forEach(b=>b.classList.toggle('selected',b.dataset.paper===pick))}
function markSwatch(c){const hex=String(c||'').toLowerCase();$$('#paper-swatches button').forEach(b=>b.classList.toggle('selected',b.dataset.color===hex))}
PAPERS.forEach(([id,name])=>{const b=el('button');b.dataset.paper=id;b.setAttribute('aria-label',name+' 속지');b.append(el('i','paper-tile paper-surface p-'+id),el('small','',name));b.onclick=()=>{applyPaper(id);dirty=true};$('#paper-patterns').append(b)});
PAPER_COLORS.forEach(c=>{const b=el('button');b.dataset.color=c;b.style.background=c;b.setAttribute('aria-label',c+' 속지 색');b.onclick=()=>{$('#paper-color').value=c;$('#paper').style.backgroundColor=c;markSwatch(c);dirty=true};$('#paper-swatches').append(b)});
function resizePaper(){const w=$('.paper-area').clientWidth-24;if(w<=0)return;scale=Math.min(1,w/1200)*zoom;$('#paper').style.transform=`scale(${scale})`;$('.paper-frame').style.width=1200*scale+'px';$('.paper-frame').style.height=1000*scale+'px'}window.addEventListener('resize',resizePaper);
function choosePage(page){activePage=page;['#select-left','#select-right'].forEach((s,i)=>{$(s).classList.toggle('selected',i===page);$(s).setAttribute('aria-pressed',String(i===page))});if(zoom>1)$('.paper-area').scrollLeft=page*600*scale}
const FONT_STYLES={gaegu:'"Gaegu", cursive',nanum:'"Nanum Pen Script", cursive',sans:'"Noto Sans KR", sans-serif',serif:'"Noto Serif KR", serif'};
function applyPieceStyle(p,data){const rotation=Number.isFinite(Number(data.rotation))?Number(data.rotation):0;p.dataset.rotation=rotation;p.style.transform='rotate('+rotation+'deg)';if(p.dataset.type==='text'){const font=Object.hasOwn(FONT_STYLES,data.font)?data.font:'gaegu';p.dataset.font=font;p.dataset.bold=String(data.bold===true);p.dataset.italic=String(data.italic===true);p.style.fontFamily=FONT_STYLES[font];p.style.fontWeight=data.bold===true?'700':'400';p.style.fontStyle=data.italic===true?'italic':'normal'}}
function syncSelectionToolbar(){const toolbar=$('#selection-toolbar');toolbar.classList.toggle('hidden',!selected);if(!selected)return;const text=selected.dataset.type==='text';$('#selection-kind').textContent={text:'텍스트',photo:'사진',sticker:'스티커',ink:'손글씨'}[selected.dataset.type];$('#text-options').classList.toggle('hidden',!text);const rotation=Number(selected.dataset.rotation||0);$('#rotation-slider').value=rotation;$('#rotation-value').textContent=rotation+'°';if(text){$('#font-family').value=selected.dataset.font||'gaegu';$('#font-bold').setAttribute('aria-pressed',selected.dataset.bold||'false');$('#font-italic').setAttribute('aria-pressed',selected.dataset.italic||'false')}}
function selectPiece(p){if(selected&&selected!==p&&selected.isContentEditable)selected.blur();$$('#paper .piece').forEach(x=>x.classList.toggle('selected',x===p));selected=p;syncSelectionToolbar()}
function setRotation(value){if(!selected)return;const angle=Math.max(-180,Math.min(180,Math.round(value)));selected.dataset.rotation=angle;selected.style.transform='rotate('+angle+'deg)';dirty=true;syncSelectionToolbar()}
$('#rotation-slider').oninput=e=>setRotation(Number(e.target.value));$('#rotate-left').onclick=()=>setRotation(Number(selected?.dataset.rotation||0)-15);$('#rotate-right').onclick=()=>setRotation(Number(selected?.dataset.rotation||0)+15);$('#rotation-reset').onclick=()=>setRotation(0);$('#deselect-piece').onclick=()=>selectPiece(null);
$('#font-family').onchange=e=>{if(selected?.dataset.type!=='text')return;selected.dataset.font=e.target.value;selected.style.fontFamily=FONT_STYLES[e.target.value];dirty=true};
for(const [id,key,property,on,off] of [['#font-bold','bold','fontWeight','700','400'],['#font-italic','italic','fontStyle','italic','normal']]){$(id).onclick=()=>{if(selected?.dataset.type!=='text')return;const enabled=selected.dataset[key]!=='true';selected.dataset[key]=String(enabled);selected.style[property]=enabled?on:off;dirty=true;syncSelectionToolbar()}}
$$('#selection-toolbar button').forEach(b=>b.onpointerdown=e=>e.preventDefault());
function placePiece(data){const p=addPiece({...data,x:data.x+activePage*600});selectPiece(p)}

function openEditor(d=null){current=d?JSON.parse(JSON.stringify(d)):{id:globalThis.crypto?.randomUUID?.()||'diary-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:new Date().toLocaleDateString('ko-KR')+' 오늘의 기록',date:new Date().toLocaleDateString('sv-SE').replaceAll('-','.'),image:null,subtitle:'일상',paper:'plain',shared:false,layout:'spread',items:[]};$('#title-input').value=current.title;setScope(current.shared===true);$('#paper').replaceChildren();$('#paper').style.backgroundColor=current.background||'#fffdf7';$('#paper-color').value=current.background||'#fffdf7';markSwatch(current.background||'#fffdf7');applyPaper(current.paper||'plain');const items=Array.isArray(current.items)?current.items:[];items.forEach(addPiece);selectPiece(null);dirty=false;zoom=1;choosePage(0);$('#zoom-paper').textContent='확대 ＋';$('#zoom-paper').setAttribute('aria-pressed','false');setInkMode(false);$('#editor').classList.remove('hidden');$('#editor-drawer').classList.add('hidden');document.querySelector('.app').inert=true;resizePaper();$('.paper-area').scrollTo(0,0);}
$('#select-left').onclick=()=>choosePage(0);$('#select-right').onclick=()=>choosePage(1);function setZoom(z,keep){zoom=Math.min(3,Math.max(1,z));
 $('#zoom-paper').textContent=zoom>1.02?'전체 보기':'확대 ＋';
 $('#zoom-paper').setAttribute('aria-pressed',String(zoom>1.02));
 resizePaper();if(!keep)choosePage(activePage)}
$('#zoom-paper').onclick=()=>setZoom(zoom>1.02?1:2);

/* 두 손가락으로 확대·축소 — 집은 자리를 손가락 사이에 그대로 붙들어 둔다. */
(function pinchZoom(){const area=$('.paper-area'),pts=new Map();
 let startGap=0,startZoom=1,cx=0,cy=0;
 const two=()=>[...pts.values()].slice(-2); /* 늘 '가장 최근 두 손가락' — 떼는 신호를 놓쳐도 다음 제스처가 산다 */
 const gap=()=>{const [p,q]=two();return Math.hypot(p.x-q.x,p.y-q.y)};
 const mid=()=>{const [p,q]=two(),r=area.getBoundingClientRect();
  return{x:(p.x+q.x)/2-r.left,y:(p.y+q.y)/2-r.top}};
 /* 손가락이 늘거나 줄 때마다 기준을 다시 잡는다 — 하나를 떼도 배율이 튀지 않는다 */
 const rebase=()=>{if(pts.size<2){startGap=0;return}
  const m=mid();cx=(area.scrollLeft+m.x)/scale;cy=(area.scrollTop+m.y)/scale;
  startGap=gap()||1;startZoom=zoom};
 area.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size>=2){rebase();$$('#paper .piece').forEach(p=>{p.onpointermove=null})}},true);
 area.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size!==2||!startGap)return;
  e.preventDefault();
  const next=startZoom*gap()/startGap;
  if(Math.abs(next-zoom)<0.004)return;
  setZoom(next,true);
  const m=mid();
  area.scrollLeft=cx*scale-m.x;area.scrollTop=cy*scale-m.y},true);
 const lift=e=>{if(!pts.delete(e.pointerId))return;rebase()};
 area.addEventListener('pointerup',lift,true);
 area.addEventListener('pointercancel',lift,true);
 area.addEventListener('pointerleave',lift,true)})();
$('#paper').addEventListener('pointerdown',e=>{if(e.target!==$('#paper'))return;selectPiece(null);choosePage((e.clientX-$('#paper').getBoundingClientRect().left)/scale>=600?1:0)});
/* ── 손글씨 ──────────────────────────────────────────
   획은 점 [x,y,압력] 의 줄. 굵기는 압력(없으면 속도)으로 변한다.
   테두리 다각형을 한 번 만들어 두고 화면(SVG)과 내보내기(캔버스)가 같이 쓴다. */
function inkOutline(pts,base){
 if(!pts.length)return[];
 if(pts.length===1){const [x,y,p=.5]=pts[0],r=base*(.3+.7*p)/2,out=[];
  for(let i=0;i<10;i++){const t=i/10*Math.PI*2;out.push([x+Math.cos(t)*r,y+Math.sin(t)*r])}return out}
 const left=[],right=[];
 for(let i=0;i<pts.length;i++){const [x,y,p=.5]=pts[i];
  const [px,py]=pts[Math.max(0,i-1)],[nx,ny]=pts[Math.min(pts.length-1,i+1)];
  let dx=nx-px,dy=ny-py;const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
  const r=base*(.3+.7*p)/2;
  left.push([x-dy*r,y+dx*r]);right.push([x+dy*r,y-dx*r])}
 return left.concat(right.reverse())}
const inkPath=(pts,base)=>{const o=inkOutline(pts,base);
 return o.length?'M'+o.map(([x,y])=>x.toFixed(1)+' '+y.toFixed(1)).join('L')+'Z':''};
function inkSvg(strokes,w,h){
 return '<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">'
  +strokes.map(s=>'<path d="'+inkPath(s.p,s.w||9)+'" fill="'+(s.c||'#2a3a57')+'"/>').join('')+'</svg>'}
function inkBounds(strokes,pad){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 strokes.forEach(s=>s.p.forEach(([x,y,p=.5])=>{const r=(s.w||9)*(.3+.7*p)/2+1;
  x0=Math.min(x0,x-r);y0=Math.min(y0,y-r);x1=Math.max(x1,x+r);y1=Math.max(y1,y+r)}));
 if(x1<x0)return{x:0,y:0,w:1,h:1};
 return{x:x0-pad,y:y0-pad,w:x1-x0+pad*2,h:y1-y0+pad*2}}

function addPiece(data){const p=el('div','piece '+data.type);p.dataset.type=data.type;p.style.left=data.x+'px';p.style.top=data.y+'px';
if(data.type==='ink'){const strokes=Array.isArray(data.strokes)?data.strokes:[];
 const w=data.w||inkBounds(strokes,0).w,hgt=data.h||inkBounds(strokes,0).h;
 p.style.width=w+'px';p.style.height=hgt+'px';p.dataset.strokes=JSON.stringify(strokes);
 p.innerHTML=inkSvg(strokes,w,hgt);p.setAttribute('aria-label','손글씨');}
else if(data.type==='photo'){const img=el('img');img.src=data.content;img.alt='다이어리 사진';p.append(img);p.style.width=(data.w||220)+'px';p.style.height=(data.h||190)+'px'}else if(data.type==='sticker'){if(typeof data.src==='string'&&data.src.startsWith('data:')){p.dataset.src=data.src;p.classList.add('custom');p.setAttribute('aria-label',data.content||'내 스티커');p.style.backgroundImage='url('+data.src+')'}else{const n=Number.isInteger(data.sprite)?data.sprite:2,pack=PACK_BY_ID[data.pack]||PACKS[0];p.dataset.sprite=n;p.dataset.pack=pack.id;p.classList.add('pack-'+pack.id);p.setAttribute('aria-label',data.content||pack.cells[n]?.[0]||'스티커');p.style.backgroundPosition=`${(n%4)*100/3}% ${Math.floor(n/4)*100/3}%`}}else p.textContent=data.content;
applyPieceStyle(p,data);p.onpointerdown=e=>{selectPiece(p);if(p.isContentEditable)return;const box=p.getBoundingClientRect();if(data.type==='photo'&&e.clientX>box.right-18&&e.clientY>box.bottom-18){dirty=true;return}e.preventDefault();p.setPointerCapture(e.pointerId);const x=e.clientX,y=e.clientY,left=p.offsetLeft,top=p.offsetTop;p.onpointermove=ev=>{p.style.left=Math.max(0,Math.min(1200-p.offsetWidth,left+(ev.clientX-x)/scale))+'px';p.style.top=Math.max(0,Math.min(1000-p.offsetHeight,top+(ev.clientY-y)/scale))+'px';dirty=true};p.onpointerup=p.onpointercancel=()=>{p.onpointermove=null}};
if(data.type==='text'){p.ondblclick=()=>{selectPiece(p);p.contentEditable='true';p.focus()};p.onblur=()=>{p.contentEditable='false';dirty=true};p.oninput=()=>dirty=true;p.onpaste=e=>{e.preventDefault();const sel=window.getSelection();if(sel.rangeCount){const r=sel.getRangeAt(0);r.deleteContents();r.insertNode(document.createTextNode(e.clipboardData.getData('text/plain')));sel.collapseToEnd()}}}$('#paper').append(p);dirty=true;return p;}
function capture(){return{...current,layout:'spread',title:$('#title-input').value.trim()||'이름 없는 하루',background:$('#paper-color').value,paper:$('#paper').dataset.paper||'plain',shared:$('#share-scope').getAttribute('aria-pressed')==='true',items:$$('#paper .piece').map(p=>({type:p.dataset.type,content:p.dataset.type==='photo'?p.querySelector('img').getAttribute('src'):p.dataset.type==='sticker'?p.getAttribute('aria-label'):p.dataset.type==='ink'?'손글씨':p.innerText,sprite:p.dataset.sprite===undefined?undefined:Number(p.dataset.sprite),pack:p.dataset.pack,src:p.dataset.src,strokes:p.dataset.strokes?JSON.parse(p.dataset.strokes):undefined,rotation:Number(p.dataset.rotation||0),font:p.dataset.font,bold:p.dataset.bold==='true',italic:p.dataset.italic==='true',x:p.offsetLeft,y:p.offsetTop,w:p.offsetWidth,h:p.offsetHeight}))}}
function save(){if(!current)return;const d=capture(),next=diaries.some(x=>x.id===d.id)?diaries.map(x=>x.id===d.id?d:x):[d,...diaries];try{localStorage.setItem('diaru-diaries-v1',JSON.stringify(next));diaries=next;current=d;dirty=false;renderDiaries();recordNotification(d);closeEditor(true);goto('home');toast('오늘의 기록을 저장했어요 ♡')}catch{toast('저장 공간이 부족해요. 공유 파일로 먼저 보관해주세요.')}}
$('#save').onclick=save;$('#title-input').oninput=()=>dirty=true;$('#paper-color').oninput=e=>{$('#paper').style.backgroundColor=e.target.value;markSwatch(e.target.value);dirty=true};function closeEditor(force){setInkMode(false);if(!force&&dirty&&!confirm('저장하지 않은 내용이 있어요. 닫을까요?'))return;dirty=false;selectPiece(null);$('#editor').classList.add('hidden');$('#editor-drawer').classList.add('hidden');document.body.style.overflow='';document.querySelector('.app').inert=false}
$('#close-editor').onclick=()=>closeEditor();$$('.new').forEach(b=>b.onclick=()=>openEditor());/* 손글씨 모드: 켜면 조각은 잠들고 종이가 받아 적는다. 끄면 그때까지 쓴 획이 한 덩어리로 굳는다. */
let inkMode=false,inkPiece=null,inkStrokes=[],inkDrawing=null,inkColor='#2a3a57',inkWidth=9;
const INK_COLORS=['#2a3a57','#8c6b4f','#7d8f6e','#a8697a'];
function renderInkPiece(){const box=inkBounds(inkStrokes,2);
 const rel=inkStrokes.map(s=>({c:s.c,w:s.w,p:s.p.map(([x,y,pr])=>[+(x-box.x).toFixed(1),+(y-box.y).toFixed(1),+pr.toFixed(2)])}));
 if(!inkPiece){inkPiece=addPiece({type:'ink',x:box.x,y:box.y,w:box.w,h:box.h,strokes:rel});selectPiece(null)}
 else{inkPiece.style.left=box.x+'px';inkPiece.style.top=box.y+'px';
  inkPiece.style.width=box.w+'px';inkPiece.style.height=box.h+'px';
  inkPiece.dataset.strokes=JSON.stringify(rel);inkPiece.innerHTML=inkSvg(rel,box.w,box.h)}
 dirty=true}
function sealInk(){inkPiece=null;inkStrokes=[];inkDrawing=null}
function setInkMode(on){inkMode=on;sealInk();
 $('#paper').classList.toggle('drawing',on);
 $('#add-ink').setAttribute('aria-pressed',String(on));
 $('#add-ink').classList.toggle('on',on);
 $('#pen-bar').classList.toggle('hidden',!on);
 $('.edit-hint').classList.toggle('hidden',on);
 if(on)selectPiece(null)}
INK_COLORS.forEach(c=>{const b=el('button','ink-color'+(c===inkColor?' selected':''));b.style.background=c;
 b.setAttribute('aria-label','잉크 색 '+c);
 b.onclick=()=>{inkColor=c;sealInk();$$('#pen-bar .ink-color').forEach(x=>x.classList.toggle('selected',x===b))};
 $('#pen-bar').append(b)});
[['가늘게',5],['보통',9],['굵게',15]].forEach(([name,w])=>{const b=el('button','ink-nib'+(w===inkWidth?' selected':''),name);
 b.onclick=()=>{inkWidth=w;sealInk();$$('#pen-bar .ink-nib').forEach(x=>x.classList.toggle('selected',x===b))};
 $('#pen-bar').append(b)});
$('#add-ink').onclick=()=>setInkMode(!inkMode);
(function writing(){const paper=$('#paper');
 const at=e=>{const r=paper.getBoundingClientRect();return[(e.clientX-r.left)/scale,(e.clientY-r.top)/scale]};
 const press=(e,[x,y])=>{if(e.pointerType==='pen'&&e.pressure>0)return e.pressure;
  const last=inkDrawing&&inkDrawing.p[inkDrawing.p.length-1];
  if(!last)return .7;
  const v=Math.hypot(x-last[0],y-last[1]);
  return Math.max(.45,Math.min(1,1-v/90))}; /* 빠를수록 가늘게 — 종이 좌표 기준 */
 paper.addEventListener('pointerdown',e=>{if(!inkMode)return;
  e.preventDefault();e.stopPropagation();paper.setPointerCapture(e.pointerId);
  const pt=at(e);inkDrawing={c:inkColor,w:inkWidth,p:[[+pt[0].toFixed(1),+pt[1].toFixed(1),.7]]};
  inkStrokes.push(inkDrawing);renderInkPiece()},true);
 paper.addEventListener('pointermove',e=>{if(!inkMode||!inkDrawing)return;
  /* 브라우저는 한 프레임 사이의 이동을 하나로 합쳐 준다. 합쳐진 것까지 꺼내야 획이 끊기지 않는다. */
  const moves=(e.getCoalescedEvents&&e.getCoalescedEvents().length?e.getCoalescedEvents():[e]);
  let added=false;
  for(const m of moves){const pt=at(m),last=inkDrawing.p[inkDrawing.p.length-1];
   if(Math.hypot(pt[0]-last[0],pt[1]-last[1])<1.6)continue;
   inkDrawing.p.push([+pt[0].toFixed(1),+pt[1].toFixed(1),+press(m,pt).toFixed(2)]);added=true}
  if(added)renderInkPiece()},true);
 const end=()=>{if(inkDrawing){inkDrawing=null;renderInkPiece()}};
 paper.addEventListener('pointerup',end,true);
 paper.addEventListener('pointercancel',end,true)})();
$('#add-text').onclick=()=>{placePiece({type:'text',content:'나의 이야기를 적어보세요',x:60,y:350});toast('글을 두 번 눌러 수정해요.')};$('#show-stickers').onclick=()=>openDrawer('stickers');$('#show-papers').onclick=()=>openDrawer('papers');$('#close-drawer').onclick=()=>$('#editor-drawer').classList.add('hidden');$('#add-photo').onclick=()=>$('#photo-input').click();$('#quick-photo').onclick=()=>{openEditor();$('#photo-input').click()};$('#quick-share').onclick=()=>{openEditor(diaries[0]||null);toast('오른쪽 위 내려받기를 누르면 이미지로 저장돼요.')};
/* ── 사진 여러 장 → 자동 배치 ─────────────────────────
   견본을 깔지 않는다. 무작위로 배치를 수백 번 만들어 점수를 매기고 가장 높은 것을 쓴다.
   점수: 종이를 적당히 채웠는가(너무 비어도 너무 꽉 차도 감점) · 겹치지 않는가 ·
         여백이 한쪽으로 쏠리지 않는가 · 크기와 기울기가 지루하지 않은가. */
function shrinkPhoto(file){return new Promise((ok,no)=>{
 if(!file.type.startsWith('image/'))return no(new Error('image'));
 const reader=new FileReader();
 reader.onload=()=>{const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas'),r=Math.min(1,1100/img.width,1100/img.height);
   c.width=img.width*r;c.height=img.height*r;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   ok({src:c.toDataURL('image/jpeg',.82),ratio:img.width/img.height})};
  img.onerror=no;img.src=reader.result};
 reader.onerror=no;reader.readAsDataURL(file)})}

function layoutScore(boxes,W,H){
 let area=0,overlap=0,out=0,cx=0,cy=0;
 for(const b of boxes){area+=b.w*b.h;cx+=(b.x+b.w/2)*b.w*b.h;cy+=(b.y+b.h/2)*b.w*b.h;
  out+=Math.max(0,-b.x)+Math.max(0,-b.y)+Math.max(0,b.x+b.w-W)+Math.max(0,b.y+b.h-H)}
 cx/=area||1;cy/=area||1;
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const A=boxes[i],B=boxes[j];
  const ox=Math.max(0,Math.min(A.x+A.w,B.x+B.w)-Math.max(A.x,B.x));
  const oy=Math.max(0,Math.min(A.y+A.h,B.y+B.h)-Math.max(A.y,B.y));
  overlap+=ox*oy}
 const fill=area/(W*H);
 const sizes=boxes.map(b=>b.w*b.h);
 const variety=boxes.length>1?Math.min(...sizes)/Math.max(...sizes):1;
 return -Math.abs(fill-0.46)*260          /* 적당히 채우기 */
        -overlap/(W*H)*900                /* 겹치면 크게 감점 */
        -out/40                           /* 종이 밖으로 나가면 감점 */
        -(Math.abs(cx-W/2)+Math.abs(cy-H/2))/26   /* 무게가 한쪽으로 쏠리지 않게 */
        +(1-Math.abs(variety-0.6))*14}    /* 크기가 조금씩 다른 편이 보기 좋다 */

function layoutCandidate(ratios,W,H,pad){
 const n=ratios.length,order=[...ratios.keys()];
 for(let i=order.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[order[i],order[j]]=[order[j],order[i]]}
 const rows=[],perRow=n<=2?1+(Math.random()<.5?0:1):Math.random()<.5?2:Math.min(3,Math.ceil(n/2));
 for(let i=0;i<order.length;i+=perRow)rows.push(order.slice(i,i+perRow));
 const gap=18+Math.random()*26,inner=W-pad*2;
 /* 먼저 줄마다 실제 크기를 정한다 — 가로로 줄인 만큼 세로도 줄어든다 */
 const plan=rows.map(()=>({}));
 rows.forEach((row,ri)=>{
  const hRow=(H-pad*2-gap*(rows.length-1))/rows.length*(0.78+Math.random()*0.3);
  const widths=row.map(i=>hRow*ratios[i]);
  const sum=widths.reduce((s,v)=>s+v,0)+gap*(row.length-1);
  const k=Math.min(1,(inner*(0.72+Math.random()*0.26))/sum);
  plan[ri]={widths:widths.map(w=>w*k),h:hRow*k,gap:gap*k}});
 const total=plan.reduce((s,p)=>s+p.h,0)+gap*(rows.length-1);
 let y=pad+(H-pad*2-total)/2+(Math.random()-.5)*26;
 const boxes=[];
 rows.forEach((row,ri)=>{const P=plan[ri];
  const sum=P.widths.reduce((s,v)=>s+v,0)+P.gap*(row.length-1);
  let x=pad+(inner-sum)/2+(Math.random()-.5)*30;
  row.forEach((i,ci)=>{boxes[i]={x,y:y+(Math.random()-.5)*14,w:P.widths[ci],h:P.h,rot:(Math.random()*2-1)*5.5};
   x+=P.widths[ci]+P.gap});
  y+=P.h+gap});
 return boxes}
function autoLayout(photos,page){
 const W=600,H=1000,pad=46,ratios=photos.map(p=>p.ratio||1);
 let best=null,bestScore=-1e9;
 for(let t=0;t<320;t++){const c=layoutCandidate(ratios,W,H,pad),s=layoutScore(c,W,H);
  if(s>bestScore){bestScore=s;best=c}}
 best.forEach((b,i)=>{
  addPiece({type:'photo',content:photos[i].src,rotation:Math.round(b.rot),
   x:Math.round(page*600+b.x),y:Math.round(b.y),w:Math.round(b.w),h:Math.round(b.h+23)})});
 selectPiece(null);dirty=true;
 return bestScore}

$('#photo-input').onchange=async e=>{const files=[...e.target.files];e.target.value='';
 if(!files.length)return;
 try{
  if(files.length===1){const p=await shrinkPhoto(files[0]);
   placePiece({type:'photo',content:p.src,x:150,y:200,w:250,h:260});
   toast('사진을 추가했어요.');return}
  toast(files.length+'장을 놓아보는 중…');
  const photos=[];for(const f of files.slice(0,8))photos.push(await shrinkPhoto(f));
  autoLayout(photos,activePage);
  toast(photos.length+'장을 놓았어요. 다시 고르면 다르게 놓아요.')}
 catch{toast('JPG 또는 PNG 사진으로 다시 시도해주세요.')}};
$('#delete-item').onclick=()=>{if(selected){selected.remove();selectPiece(null);dirty=true}else toast('삭제할 조각을 먼저 눌러주세요.')};
const PATTERN={
 ruled:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.22)';for(let y=0;y<H;y+=44)g.fillRect(0,y,W,1.3)},
 dot:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.35)';for(let y=17;y<H;y+=34)for(let x=17;x<W;x+=34){g.beginPath();g.arc(x,y,2,0,7);g.fill()}},
 grid:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.19)';for(let y=0;y<H;y+=42)g.fillRect(0,y,W,1.2);for(let x=0;x<W;x+=42)g.fillRect(x,0,1.2,H)},
 graph:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.15)';for(let y=0;y<H;y+=18)g.fillRect(0,y,W,1);for(let x=0;x<W;x+=18)g.fillRect(x,0,1,H)},
 month:(g,W,H)=>{const col=150,head=110,row=(H-head)/5;
  g.fillStyle='rgba(126,115,99,.06)';g.fillRect(0,0,W,head);
  g.fillStyle='rgba(126,115,99,.2)';for(let i=1;i<=5;i++)g.fillRect(0,head+row*i-1.2,W,1.2);
  g.fillStyle='rgba(126,115,99,.35)';g.fillRect(0,head-1.2,W,1.2);
  g.fillStyle='rgba(126,115,99,.18)';for(let i=1;i<8;i++)g.fillRect(col*i,0,1.2,H);
  g.save();g.textAlign='center';g.textBaseline='middle';g.font='24px "Noto Sans KR", sans-serif';
  [...WEEKDAYS,'메모'].forEach((w,i)=>{g.fillStyle=i===0?'#b2827a':i===6?'#7f8fa6':i===7?'#a8a295':'#8c8676';g.fillText(w,col*i+col/2,head/2)});g.restore()},
 weekly:(g,W,H)=>{const band=250;
  g.fillStyle='rgba(126,115,99,.12)';for(let y=50;y<H;y+=50)g.fillRect(0,y,W,1);
  g.fillStyle='rgba(126,115,99,.27)';for(let i=1;i<4;i++)g.fillRect(0,band*i,W,1.2);
  g.fillStyle='rgba(126,115,99,.25)';g.fillRect(W/2-.7,0,1.4,H);
  g.fillStyle='rgba(126,115,99,.17)';for(let i=0;i<4;i++)g.fillRect(0,band*i+28,W,1.1);
  g.save();g.textAlign='left';g.textBaseline='middle';g.font='21px "Noto Sans KR", sans-serif';
  ['월','화','수','목','금','토','일','메모'].forEach((w,i)=>{
   g.fillStyle=w==='일'?'#b2827a':w==='토'?'#7f8fa6':w==='메모'?'#a8a295':'#8c8676';
   g.fillText(w,(i<4?0:600)+24,(i%4)*band+16)});g.restore()},
 todo:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.2)';for(let y=50;y<H;y+=50)g.fillRect(0,y,W,1.1);
  g.strokeStyle='rgba(126,115,99,.33)';g.lineWidth=1.4;
  for(let y=25;y<H;y+=50)for(const x of [40,640]){g.beginPath();g.arc(x,y,7.5,0,7);g.stroke()}},
 note:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.22)';for(let y=40;y<H;y+=40)g.fillRect(0,y,W,1.1);
  g.fillStyle='rgba(180,128,111,.42)';for(const x of [110,710])g.fillRect(x,0,1.4,H)},
 staff:(g,W,H)=>{g.fillStyle='rgba(126,115,99,.3)';
  for(let top=60;top+45<H;top+=110)for(let i=0;i<5;i++)g.fillRect(0,top+i*11,W,1.1)},
 iso:(g,W,H)=>{g.strokeStyle='rgba(126,115,99,.17)';g.lineWidth=1;
  for(let y=0;y<H;y+=34){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
  const step=34/Math.cos(Math.PI/6);
  for(let d=-H*2;d<W+H*2;d+=step){g.beginPath();g.moveTo(d,0);g.lineTo(d+H/Math.tan(Math.PI/3),H);g.stroke();
   g.beginPath();g.moveTo(d,0);g.lineTo(d-H/Math.tan(Math.PI/3),H);g.stroke()}},
 dash:(g,W,H)=>{g.strokeStyle='rgba(126,115,99,.17)';g.lineWidth=1.3;for(let d=-H;d<W+H;d+=15){g.beginPath();g.moveTo(d,H);g.lineTo(d+H,0);g.stroke()}}};
const sheetCache={};
function loadImage(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
function sheetFor(pack){return sheetCache[pack.id]||(sheetCache[pack.id]=loadImage(pack.file))}
function drawCover(g,img,x,y,w,h){const r=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/r,sh=h/r;
 g.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h)}
function drawContain(g,img,x,y,w,h){const r=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*r,dh=img.naturalHeight*r;
 g.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function wrapText(g,text,max){const out=[];for(const para of String(text).split('\n')){let line='';
 for(const ch of para){if(g.measureText(line+ch).width>max&&line){out.push(line);line=ch}else line+=ch}out.push(line)}return out}
async function spreadToBlob(scale){const W=1200,H=1000,paper=$('#paper');
 await document.fonts.ready;
 const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;
 const g=c.getContext('2d');g.scale(scale,scale);
 g.fillStyle=paper.style.backgroundColor||'#fffdf7';g.fillRect(0,0,W,H);
 (PATTERN[paper.dataset.paper]||(()=>{}))(g,W,H);
 g.strokeStyle='#f0ede5';g.lineWidth=1;g.strokeRect(8.5,8.5,W-17,H-17);
 for(const p of $$('#paper .piece')){
  const w=p.offsetWidth,h=p.offsetHeight,rot=Number(p.dataset.rotation||0);
  g.save();g.translate(p.offsetLeft+w/2,p.offsetTop+h/2);g.rotate(rot*Math.PI/180);g.translate(-w/2,-h/2);
  if(p.dataset.type==='photo'){
   g.save();g.shadowColor='rgba(0,0,0,.13)';g.shadowBlur=6;g.shadowOffsetY=3;g.fillStyle='#fff';g.fillRect(0,0,w,h);g.restore();
   const img=p.querySelector('img');if(img?.naturalWidth)drawCover(g,img,8,8,w-16,h-31);
  }else if(p.dataset.type==='ink'){
   const strokes=JSON.parse(p.dataset.strokes||'[]'),box=inkBounds(strokes,0);
   const sx=w/(Number(p.style.width.replace('px',''))||box.w||1);
   strokes.forEach(s=>{const o=inkOutline(s.p,s.w||9);if(!o.length)return;
    g.beginPath();o.forEach(([x,y],i)=>i?g.lineTo(x*sx,y*sx):g.moveTo(x*sx,y*sx));
    g.closePath();g.fillStyle=s.c||'#2a3a57';g.fill()})
  }else if(p.dataset.type==='sticker'){
   try{if(p.dataset.src){drawContain(g,await loadImage(p.dataset.src),0,0,w,h)}
   else{const pack=PACK_BY_ID[p.dataset.pack]||PACKS[0],sheet=await sheetFor(pack),cell=sheet.naturalWidth/4,n=Number(p.dataset.sprite||0);
    if(pack.blend==='multiply')g.globalCompositeOperation='multiply';
    g.drawImage(sheet,(n%4)*cell,Math.floor(n/4)*cell,cell,cell,0,0,w,h);g.globalCompositeOperation='source-over'}}catch{}
  }else{
   const size=27,lh=size*1.55;
   g.fillStyle=getComputedStyle(p).color;g.textBaseline='middle';
   g.font=(p.dataset.italic==='true'?'italic ':'')+(p.dataset.bold==='true'?'700 ':'400 ')+size+'px '+FONT_STYLES[p.dataset.font||'gaegu'];
   let y=4+lh/2;for(const line of wrapText(g,p.innerText,532)){g.fillText(line,4,y);y+=lh}
  }
  g.restore()}
 const spine=g.createLinearGradient(W/2-20,0,W/2+20,0);
 spine.addColorStop(0,'rgba(126,115,99,0)');spine.addColorStop(.46,'rgba(126,115,99,.17)');
 spine.addColorStop(.52,'rgba(255,255,255,.53)');spine.addColorStop(1,'rgba(255,255,255,0)');
 g.fillStyle=spine;g.fillRect(W/2-20,0,40,H);
 return await new Promise(r=>c.toBlob(r,'image/png'))}
$('#export').onclick=async()=>{const button=$('#export');button.disabled=true;toast('이미지를 만들고 있어요.');
 try{const blob=await spreadToBlob(2);if(!blob)throw Error('blob');
  const url=URL.createObjectURL(blob),link=el('a');
  link.href=url;link.download=(capture().title||'diaru').replace(/[<>:"/\\|?*]/g,'')+'.png';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
  toast('이미지로 저장했어요. ('+(blob.size/1024/1024).toFixed(1)+'MB)')}
 catch{toast('이미지를 만들지 못했어요. 사진을 다시 불러오고 시도해주세요.')}
 finally{button.disabled=false}};
$('#profile-name-edit').onclick=()=>setProfileEditing(true);$('#profile-bio-edit').onclick=()=>setProfileEditing(true);
let feedMode='mine',activity=[];try{activity=JSON.parse(localStorage.getItem('diaru-activity'))||[]}catch{}
/* 펼친 책 한 장 — 피드·나의 기록·남의 프로필이 같은 그림을 쓴다 */
function spreadPreview(d){const preview=el('div','feed-spread paper-surface');preview.style.backgroundColor=d.background||'#fffdf7';if(d.paper&&d.paper!=='plain')preview.classList.add('p-'+d.paper);const mini=chromeNode(d.paper,true);if(mini)preview.append(mini);const surface=el('div','feed-surface');(d.items||[]).forEach(item=>{const p=el('div','feed-piece '+item.type);p.dataset.type=item.type;p.style.left=item.x/12+'%';p.style.top=item.y/10+'%';applyPieceStyle(p,{...item});if(item.type==='photo'){const img=el('img');img.src=item.content;img.alt='';p.style.width=(item.w||220)/12+'%';p.style.height=(item.h||190)/10+'%';p.append(img)}else if(item.type==='ink'){p.style.width=(item.w||100)/12+'%';p.style.height=(item.h||100)/10+'%';
  p.innerHTML=inkSvg(item.strokes||[],item.w||100,item.h||100)}
 else if(item.type==='sticker'){p.style.width='7.08%';if(typeof item.src==='string'&&item.src.startsWith('data:')){const im=el('img','custom-art');im.src=item.src;im.alt='';p.append(im)}else p.append(art(item.sprite??2,'',item.pack))}else{p.textContent=item.content;p.style.width=(item.w||540)/12+'%'}surface.append(p)});preview.append(surface);return preview}
function renderFeed(){if(!$('#feed-list'))return;$('#feed-list').replaceChildren();$('.feed-privacy').textContent=feedMode==='mine'?'나만 보는 기록 · 이 기기에 저장된 다이어리':'친구가 된 사람의 기록만 보여요';const records=feedMode==='mine'?diaries.filter(d=>!String(d.id||'').startsWith('sample-')):friendFeed();if(!records.length){const empty=el('div','empty-state');empty.append(el('span','empty-symbol',feedMode==='mine'?'✎':'♡'),el('h2','',feedMode==='mine'?'첫 번째 이야기를 남겨보세요':'친구의 기록은 아직 여기 없어요'),el('p','',feedMode==='mine'?'저장한 다이어리가 이곳에 모여요.':'다이어리는 아직 기기에만 저장돼요. 서버로 옮기면 여기 쌓여요.'));const b=el('button','primary',feedMode==='mine'?'새 다이어리 만들기':'친구 찾기');b.onclick=()=>feedMode==='mine'?openEditor():goto('people');empty.append(b);$('#feed-list').append(empty);return}records.forEach(d=>{const card=el(d.author?'div':'button','feed-card');const top=el('div','feed-card-top');top.append(el('b','',d.author?d.author.name+' @'+d.author.handle:'나의 기록'),el('small','',d.date+(d.author?' · 친구 공개':d.shared?' · 친구 공개':' · 나만 보기')));const preview=spreadPreview(d);card.append(top,preview,el('h2','',d.title));if(!d.author){card.append(el('span','feed-open','기록 열기 ›'));card.onclick=()=>openEditor(d)}$('#feed-list').append(card)})}
$$('[data-feed]').forEach(b=>b.onclick=()=>{feedMode=b.dataset.feed;$$('[data-feed]').forEach(x=>x.classList.toggle('selected',x===b));renderFeed()});
function recordNotification(d){activity=[{id:d.id,title:d.title,time:new Date().toISOString()},...activity.filter(a=>a.id!==d.id)].slice(0,20);try{localStorage.setItem('diaru-activity',JSON.stringify(activity))}catch{}$('.notification-button').classList.add('unread')}
function renderNotifications(){$('#notification-list').replaceChildren();if(!activity.length){const empty=el('div','empty-state');empty.append(el('span','empty-symbol','♧'),el('h2','','아직 새로운 알림이 없어요'),el('p','','다이어리를 저장하면 여기에 알려드릴게요.'));$('#notification-list').append(empty);return}activity.forEach(a=>{const b=el('button','notification-item');b.append(el('b','',a.title),el('span','','다이어리를 저장했어요.'),el('small','',new Date(a.time).toLocaleString('ko-KR')));b.onclick=()=>{const d=diaries.find(d=>d.id===a.id);if(d)openEditor(d)};$('#notification-list').append(b)})}
PACKS.forEach((p,n)=>{const i=[2,0,13,10,12][n%5],b=el('button');b.append(art(i,'',p.id),el('span','',p.name));b.onclick=()=>{openEditor();placePiece({type:'sticker',sprite:i,pack:p.id,content:p.cells[i][0],x:220,y:200})};$('#shop-stickers').append(b)});$('#sticker-sku').textContent=String(PACKS.length*16);
window.addEventListener('beforeunload',e=>{if(dirty&&!$('#editor').classList.contains('hidden')){e.preventDefault();e.returnValue=''}});
/* ── 사람들 ─────────────────────────────────────────────
   예시 사람은 두지 않는다. 친구는 서버에만 있고, 로그인 전에는 아무도 없다.
   화면이 보는 것은 rel(내 사이)과 found(마지막 검색 결과) 둘뿐이다. */
const RESERVED=['diaru','admin','root','me','official','support','help'];
const HANDLE_RE=/^[a-z0-9_]{3,15}$/;
let me,meSaved=false;try{const raw=localStorage.getItem('diaru-me');meSaved=!!raw;me=JSON.parse(raw)}catch{}
if(!me||typeof me!=='object')me={};
if(!HANDLE_RE.test(me.handle||''))me.handle='diaru_'+Math.random().toString(36).slice(2,7);
if(typeof me.bio!=='string')me.bio='';
if(typeof me.onboarded!=='boolean')me.onboarded=meSaved;
if(typeof me.cover!=='string')me.cover=null;
if(me.seal!==null&&typeof me.seal!=='object')me.seal=null;
function saveMe(){try{localStorage.setItem('diaru-me',JSON.stringify(me))}catch{}}

let rel={friends:[],incoming:[],sent:[],blocked:[]},found=[],peopleTab='검색',openPerson=null;
const TABS=['검색','친구','받은 신청','차단'];
const everyone=()=>[...found,...rel.friends,...rel.incoming,...rel.sent,...rel.blocked];
const personBy=hd=>everyone().find(p=>p.handle===hd);
const loggedIn=()=>API.on&&!!API.token;
const has=(list,hd)=>(rel[list]||[]).some(p=>p.handle===hd);
function relation(hd){return has('blocked',hd)?'blocked':has('friends',hd)?'friend'
 :has('incoming',hd)?'incoming':has('sent',hd)?'sent':'none'}
async function refreshFriends(){
 if(!loggedIn()){rel={friends:[],incoming:[],sent:[],blocked:[]};return}
 try{const out=await api('GET','api/friends');
  rel={friends:out.friends||[],incoming:out.incoming||[],sent:out.sent||[],blocked:out.blocked||[]}}
 catch{/* 끊겼으면 가진 것을 그대로 둔다 */}}
async function afterSocial(message){await refreshFriends();renderPeople();renderProfile();renderFeed();
 if(openPerson)renderPerson(openPerson);if(message)toast(message)}
async function act(path,hd,message){if(!loggedIn())return toast('로그인하면 친구를 찾을 수 있어요.');
 try{await api('POST','api/friends/'+path,{handle:hd});await afterSocial(message)}catch(e){toast(e.message)}}
const sendRequest=hd=>relation(hd)==='sent'?act('remove',hd,'신청을 거뒀어요.')
 :act('request',hd,'친구 신청을 보냈어요. 상대가 수락하면 친구가 돼요.');
const acceptRequest=hd=>act('accept',hd,'@'+hd+' 님과 친구가 됐어요.');
const declineRequest=hd=>act('decline',hd,'신청을 거절했어요.');
const unfriend=hd=>confirm('@'+hd+' 님과 친구를 끊을까요?')&&act('remove',hd,'친구를 끊었어요.');
function toggleBlock(hd){if(relation(hd)==='blocked')return act('unblock',hd,'차단을 풀었어요.');
 if(!confirm('@'+hd+' 님을 차단할까요?\n친구 관계와 신청이 모두 풀리고, 서로의 기록이 보이지 않게 돼요.'))return;
 act('block',hd,'@'+hd+' 님을 차단했어요.')}
const isFriend=hd=>relation(hd)==='friend';
const isBlocked=hd=>relation(hd)==='blocked';
/* 친구의 기록은 아직 서버에 없다 — 다이어리 동기화가 붙으면 여기만 바뀐다 */
function friendFeed(){return[]}

function actionButton(hd){const how=relation(hd);
 const b=el('button','person-btn'+(how==='friend'||how==='sent'?' on':''),
  {blocked:'차단 해제',friend:'친구',incoming:'수락',sent:'신청함',none:'친구 신청'}[how]);
 b.onclick=e=>{e.stopPropagation();
  if(how==='blocked')toggleBlock(hd);
  else if(how==='friend')unfriend(hd);
  else if(how==='incoming')acceptRequest(hd);
  else sendRequest(hd)};
 return b}
function moreButton(hd){const how=relation(hd),m=el('button','person-more','⋯');
 m.setAttribute('aria-label','@'+hd+(how==='incoming'?' 신청 거절하거나 차단하기':' 차단하기'));
 m.onclick=e=>{e.stopPropagation();
  if(how==='incoming'&&confirm('@'+hd+' 님의 신청을 거절할까요?\n(취소를 누르면 차단합니다)'))return declineRequest(hd);
  toggleBlock(hd)};
 return m}
function personRow(p){const row=el('div','person'),hd=p.handle,friend=isFriend(hd),how=relation(hd);
 const face=el('span','person-face'+(friend?'':' veiled'));
 if(friend&&p.seal&&p.seal.src){const i=el('img');i.src=p.seal.src;i.alt='';face.append(i)}
 else face.append(el('span','seal-empty'));
 const id=el('span','person-id');
 id.append(el('b','',p.name||'@'+hd),
  el('small','','@'+hd+' · '+(how==='blocked'?'차단함':friend?(p.bio||'소개 없음'):how==='incoming'?'친구 신청을 보냈어요':'비공개 프로필')));
 const acts=el('span','person-actions');
 acts.append(actionButton(hd));
 if(how!=='blocked')acts.append(moreButton(hd));
 row.append(face,id,acts);
 row.tabIndex=0;row.setAttribute('role','button');
 row.onclick=()=>showPerson(hd);
 row.onkeydown=e=>{if(e.key==='Enter')showPerson(hd)};
 return row}

let searchTimer;
async function renderPeople(){const list=$('#people-list');if(!list)return;
 $('#people-search').classList.toggle('hidden',peopleTab!=='검색');
 if(!loggedIn()){list.replaceChildren();const empty=el('div','empty-state');
  empty.append(el('span','empty-symbol','♡'),el('h2','','로그인하면 친구를 찾을 수 있어요'),
   el('p','','시작 화면에서 메일로 들어오면 @아이디로 서로를 찾을 수 있어요.'));
  list.append(empty);return}
 let rows=[];
 if(peopleTab==='검색'){try{found=(await api('GET','api/people?q='+encodeURIComponent($('#people-search').value.trim()))).people||[]}catch{found=[]}rows=found}
 else if(peopleTab==='친구')rows=rel.friends;
 else if(peopleTab==='받은 신청')rows=rel.incoming;
 else rows=rel.blocked;
 list.replaceChildren();
 if(!rows.length){const empty=el('div','empty-state');
  empty.append(el('span','empty-symbol',peopleTab==='차단'?'⊘':'♡'),
   el('h2','',{'검색':'찾는 사람이 없어요','친구':'아직 친구가 없어요','받은 신청':'받은 신청이 없어요','차단':'차단한 사람이 없어요'}[peopleTab]),
   el('p','',peopleTab==='검색'?'@아이디나 이름으로 다시 찾아보세요.':'검색에서 마음에 드는 사람을 찾아 신청해보세요.'));
  list.append(empty);return}
 rows.forEach(p=>list.append(personRow(p)))}

TABS.forEach(t=>{const b=el('button',t===peopleTab?'selected':'',t);
 b.onclick=()=>{peopleTab=t;$$('#people-tabs button').forEach(x=>x.classList.toggle('selected',x===b));renderPeople()};$('#people-tabs').append(b)});
$('#people-search').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(renderPeople,220)};
function openPeopleTab(tab){peopleTab=tab;$$('#people-tabs button').forEach(x=>x.classList.toggle('selected',x.textContent===tab));goto('people');renderPeople()}
$$('[data-people]').forEach(b=>b.onclick=()=>openPeopleTab(b.dataset.people==='requests'?'받은 신청':'친구'));

/* ── 남의 프로필 ── 친구가 아니면 속은 잠겨 있다. */
function showPerson(hd){if(!personBy(hd))return;openPerson=hd;renderPerson(hd);goto('person')}
function renderPerson(hd){const p=personBy(hd),page=$('#person');if(!p||!page)return;
 const friend=isFriend(hd),how=relation(hd);
 page.replaceChildren();
 const head=el('div','page-heading'),back=el('button');back.dataset.icon='back';back.setAttribute('aria-label','뒤로');
 back.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+paths.back+'</svg>';
 back.onclick=()=>{openPerson=null;goto('people')};
 head.append(back,el('h1','','@'+hd),el('span',''));
 const cover=el('div','profile-cover');
 if(friend&&typeof p.cover==='string'&&p.cover){const i=el('img');i.src=p.cover.startsWith('data:')?p.cover:(photos[p.cover]||'');i.alt='';cover.append(i)}
 else cover.classList.add('empty');
 const detail=el('div','profile-detail'),portrait=el('div','profile-portrait'+(friend?'':' veiled'));
 if(friend&&p.seal&&p.seal.src){const i=el('img','custom-art photo');i.src=p.seal.src;i.alt='';portrait.append(i)}
 else portrait.append(el('span','seal-empty'));
 detail.append(portrait,el('h1','',p.name||'@'+hd));
 if(p.name)detail.append(el('span','profile-handle','@'+hd));
 detail.append(el('p','',friend?(p.bio||'소개 없음'):'비공개 프로필 · 친구에게만 보여요'));
 if(!friend)detail.append(el('span','profile-lock','비공개 · 친구에게만 보여요'));
 const acts=el('div','person-page-actions');
 acts.append(actionButton(hd));
 if(how!=='blocked')acts.append(moreButton(hd));
 detail.append(acts);
 page.append(head,cover,detail);
 const empty=el('div','empty-state');
 empty.append(el('span','empty-symbol','♡'),
  el('h2','',friend?'기록은 아직 여기 없어요':'친구가 되면 볼 수 있어요'),
  el('p','',friend?'다이어리는 아직 기기에만 저장돼요. 서버로 옮기면 여기 쌓여요.'
   :how==='sent'?'신청을 보냈어요. 상대가 수락하면 열려요.'
   :how==='incoming'?'이 사람이 먼저 신청했어요. 수락하면 열려요.':'친구 신청을 보내보세요.'));
 page.append(empty)}

function renderProfile(){$('#profile-handle-edit').textContent='@'+me.handle;
 const cover=me.cover&&(me.cover.startsWith('data:')?me.cover:photos[me.cover]);
 $('.profile-cover').classList.toggle('empty',!cover);
 if(cover)$('#cover-img').src=cover;else $('#cover-img').removeAttribute('src');
 $('#profile-seal').replaceChildren(sealNode(),el('span','edit-badge','✎'));
 $('.profile-avatar').replaceChildren(sealNode());
 $('.landing-avatar')?.replaceChildren(sealNode());
 let name='';try{name=localStorage.getItem('diaru-profile-name')||''}catch{}
 $('.profile-detail h1').textContent=name||'@'+me.handle;   /* 이름을 안 지었으면 아이디가 이름 자리에 */
 $('.profile-detail').classList.toggle('no-name',!name);
 $('.profile-bio p').textContent=me.bio;
 $('.profile-bio').classList.toggle('empty',!me.bio);
 document.documentElement.classList.toggle('no-account',!me.onboarded);
 $('#profile-friends').textContent=rel.friends.length;
 $('#profile-requests').textContent=rel.incoming.length}
/* 프로필 편집란 — 배경화면 · 인장 · 이름 · 아이디 · 소개를 그 자리에서 고친다. */
function sealNode(){const s=me.seal;
 if(typeof s?.src==='string'&&s.src.startsWith('data:')){const i=el('img','custom-art'+(s.fit==='cover'?' photo':''));i.src=s.src;i.alt='';return i}
 if(s&&PACK_BY_ID[s.pack])return art(Number.isInteger(s.sprite)?s.sprite:0,'',s.pack);
 return el('span','seal-empty')}   /* 아직 안 고른 인장 — 빈 자리로 둔다 */
let editingProfile=false;
function setProfileEditing(on){editingProfile=on;
 $('#profile').classList.toggle('editing',on);
 $('#profile-edit-toggle').textContent=on?'편집 끝내기':'프로필 편집';
 if(on){let saved='';try{saved=localStorage.getItem('diaru-profile-name')||''}catch{}
  $('#profile-name-input').value=saved;$('#profile-bio-input').value=me.bio}
 else commitProfile()}
function commitProfile(){const name=$('#profile-name-input').value.trim().slice(0,40);
 try{localStorage.setItem('diaru-profile-name',name)}catch{}   /* 비우면 비워진다 — 그러면 아이디가 이름 자리로 */
 me.bio=$('#profile-bio-input').value.trim().slice(0,60);
 /* 아이디는 가입할 때 한 번만 정한다 — 여기서는 고치지 않는다. */
 saveMe();renderProfile();pushProfile({name:$('.profile-detail h1').textContent,bio:me.bio})}
$('#profile-edit-toggle').onclick=()=>setProfileEditing(!editingProfile);
$('#profile-seal').onclick=()=>{if(editingProfile)$('#seal-input').click();else setProfileEditing(true)};
$('.profile-cover').onclick=()=>{if(editingProfile)$('#cover-input').click()};
$('#seal-input').onchange=e=>{const file=e.target.files[0];e.target.value='';if(!file)return;
 if(!file.type.startsWith('image/'))return toast('이미지 파일을 선택해주세요.');
 const reader=new FileReader();reader.onload=()=>{const img=new Image();
  img.onload=()=>{const S=420,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
   const r=Math.max(S/img.width,S/img.height),sw=S/r,sh=S/r;
   g.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,S,S);
   const prev=me.seal;me.seal={src:c.toDataURL('image/jpeg',.85),fit:'cover'};
   try{localStorage.setItem('diaru-me',JSON.stringify(me))}catch{me.seal=prev;return toast('사진이 너무 커요. 다른 사진으로 해주세요.')}
   renderProfile();renderAuthPreview();pushProfile({seal:me.seal});toast('인장을 바꿨어요.')};
  img.onerror=()=>toast('JPG 또는 PNG 사진으로 다시 시도해주세요.');img.src=reader.result};
 reader.readAsDataURL(file)};
$('#cover-input').onchange=e=>{const file=e.target.files[0];e.target.value='';if(!file)return;
 if(!file.type.startsWith('image/'))return toast('이미지 파일을 선택해주세요.');
 const reader=new FileReader();reader.onload=()=>{const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=1000;c.height=750;const g=c.getContext('2d');
   const r=Math.max(1000/img.width,750/img.height),sw=1000/r,sh=750/r;
   g.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,1000,750);
   const prev=me.cover;me.cover=c.toDataURL('image/jpeg',.8);
   try{localStorage.setItem('diaru-me',JSON.stringify(me))}catch{me.cover=prev;return toast('사진이 너무 커요. 다른 사진으로 해주세요.')}
   renderProfile();renderAuthPreview();pushProfile({cover:me.cover});toast('배경화면을 바꿨어요.')};
  img.onerror=()=>toast('JPG 또는 PNG 사진으로 다시 시도해주세요.');img.src=reader.result};
 reader.readAsDataURL(file)};
saveMe();

/* 다이어리 한 장의 공개 범위 — 친구에게 보일지 말지. 기본은 나만 보기. */
function setScope(shared){const b=$('#share-scope');b.setAttribute('aria-pressed',String(shared===true));
 b.textContent=shared===true?'친구 공개':'나만 보기'}
$('#share-scope').onclick=()=>{const next=$('#share-scope').getAttribute('aria-pressed')!=='true';
 setScope(next);dirty=true;toast(next?'친구에게 보여요.':'나만 봐요.')};

/* 속지 둘러보기 — 고르면 그 속지로 새 기록이 열린다. 견본이 아니라 도구다. */
function renderPapers(){['#home-papers','#shop-papers'].forEach(sel=>{const root=$(sel);if(!root)return;root.replaceChildren();
 (sel==='#home-papers'?PAPERS.slice(0,6):PAPERS).forEach(([id,name])=>{const b=el('button','paper-pick-card');b.setAttribute('aria-label',name+' 속지로 시작하기');
  b.append(el('i','paper-tile paper-surface p-'+id),el('h3','',name));
  b.onclick=()=>{openEditor();applyPaper(id);dirty=true;toast(name+' 속지로 시작해요.')};root.append(b)})});
 if($('#paper-sku'))$('#paper-sku').textContent=PAPERS.length+' PAPERS'}

/* ── 가입 ───────────────────────────────────────────
   계정은 아직 이 기기에만 있다. 서버가 붙으면 startAuth/finishAuth 사이에
   로그인 한 단계(이메일 코드 등)를 끼우고, me 를 서버가 돌려준 계정으로 바꾸면 된다. */
/* ── 서버 ───────────────────────────────────────────
   서버가 있으면(같은 주소에서 /api/health 가 답하면) 계정은 서버에 산다.
   없으면 지금까지처럼 이 기기에만 있다 — 화면은 같고 저장되는 곳만 달라진다. */
const API={token:null,on:false,email:''};
try{API.token=localStorage.getItem('diaru-token')}catch{}
async function api(method,path,body){
 const r=await fetch(path,{method,headers:{'Content-Type':'application/json',
  ...(API.token?{Authorization:'Bearer '+API.token}:{})},body:body?JSON.stringify(body):undefined});
 const json=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(json.error||'서버가 응답하지 않아요.'),{status:r.status});
 return json}
function adoptAccount(acc){
 /* 이미 꾸려 둔 계정이면 서버 것이 진짜다 — 기기에 남아 있던 프로필은 덮는다.
    갓 만든 계정이면(아직 가입 중) 비어 있으니 기기 값을 그대로 둔다. */
 const settled=!!acc.onboarded;
 me.handle=acc.handle||me.handle;me.onboarded=settled;
 if(settled||acc.name){try{localStorage.setItem('diaru-profile-name',acc.name||'')}catch{}}
 if(settled||acc.bio)me.bio=typeof acc.bio==='string'?acc.bio:'';
 if(settled||acc.seal)me.seal=acc.seal||null;
 if(settled||acc.cover)me.cover=acc.cover||null;
 saveMe();renderProfile();
 $('#profile-logout').classList.remove('hidden');$('#profile-delete').classList.remove('hidden');
 refreshFriends().then(()=>{renderPeople();renderProfile();renderFeed()})}
async function pushProfile(patch){if(!API.on||!API.token)return;
 try{await api('PATCH','api/me',patch)}catch(e){toast(e.message)}}
async function connectServer(){
 try{const r=await fetch('api/health',{cache:'no-store',signal:AbortSignal.timeout(4500)});if(!r.ok)return false;API.on=true}catch{return false}
 if(API.token){try{adoptAccount((await api('GET','api/me')).me)}
  catch{API.token=null;try{localStorage.removeItem('diaru-token')}catch{}}}
 return true}
$('#profile-delete').onclick=async()=>{
 if(!confirm('계정을 지울까요?\n아이디와 친구 관계가 사라지고 되돌릴 수 없어요.'))return;
 if(!confirm('정말 지울까요? 이 기기의 기록도 함께 지웁니다.'))return;
 try{await api('DELETE','api/me')}catch(e){return toast(e.message)}
 try{localStorage.clear()}catch{}
 location.reload()};
$('#profile-logout').onclick=async()=>{if(!confirm('로그아웃할까요?'))return;
 try{await api('POST','api/auth/logout',{})}catch{}
 API.token=null;try{localStorage.removeItem('diaru-token')}catch{}
 me.onboarded=false;saveMe();location.reload()};

function showAuthStep(id){$$('#auth .auth-step').forEach(s=>s.classList.toggle('hidden',s.id!==id))}
function renderAuthPreview(){const seal=$('#auth-seal');if(!seal)return;
 seal.replaceChildren(sealNode());
 const img=$('#auth-cover-img'),has=typeof me.cover==='string'&&me.cover.startsWith('data:');
 img.src=has?me.cover:(photos[me.cover]||photos.harbor);
 $('#auth-cover').classList.toggle('filled',has)}
async function startAuth(){
 /* 서버에 묻는 중에 눌리면 이메일 단계를 통째로 건너뛴다 — 끝날 때까지 기다린다 */
 await Promise.race([SERVER_READY,new Promise(r=>setTimeout(r,4600))]);
 $('#landing').classList.add('hidden');$('#auth').classList.remove('hidden');$('#auth').inert=false;
 $$('.app > :not(#landing):not(#auth)').forEach(e=>e.inert=true);
 if(API.on){showAuthStep('auth-email');$('#auth-email-input').value=API.email;
  setTimeout(()=>$('#auth-email-input').focus(),60);return}
 showAuthStep('auth-handle');
 $('#auth-handle-input').value=me.handle;$('#auth-hint').classList.remove('bad');
 setTimeout(()=>$('#auth-handle-input').focus(),60)}
async function sendCode(){const email=$('#auth-email-input').value.trim();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){$('#auth-email-hint').textContent='이메일을 확인해주세요.';$('#auth-email-hint').classList.add('bad');return}
 $('#auth-send').disabled=true;$('#auth-email-hint').classList.remove('bad');$('#auth-email-hint').textContent='보내는 중…';
 try{const out=await api('POST','api/auth/request',{email});API.email=email;
  showAuthStep('auth-code');$('#auth-code-input').value=out.code||'';
  $('#auth-code-hint').textContent=out.how==='logged'?'메일이 아직 연결되지 않아 서버 기록에 남겼어요.':email+' 로 보냈어요.';
  $('#auth-code-hint').classList.remove('bad');setTimeout(()=>$('#auth-code-input').focus(),60)}
 catch(e){$('#auth-email-hint').textContent=e.message;$('#auth-email-hint').classList.add('bad')}
 finally{$('#auth-send').disabled=false}}
$('#auth-send').onclick=sendCode;
$('#auth-resend').onclick=()=>{showAuthStep('auth-email');$('#auth-email-hint').textContent='코드를 보내드려요. 비밀번호는 없어요.'};
$('#auth-email-input').onkeydown=e=>{if(e.key==='Enter')sendCode()};
$('#auth-verify').onclick=async()=>{const code=$('#auth-code-input').value.trim();
 $('#auth-verify').disabled=true;
 try{const out=await api('POST','api/auth/verify',{email:API.email,code});
  API.token=out.token;try{localStorage.setItem('diaru-token',out.token)}catch{}
  adoptAccount(out.me);
  if(out.me.onboarded){finishAuth();return}
  showAuthStep('auth-handle');$('#auth-handle-input').value=out.me.handle;
  $('#auth-hint').classList.remove('bad');setTimeout(()=>$('#auth-handle-input').focus(),60)}
 catch(e){$('#auth-code-hint').textContent=e.message;$('#auth-code-hint').classList.add('bad')}
 finally{$('#auth-verify').disabled=false}};
$('#auth-code-input').onkeydown=e=>{if(e.key==='Enter')$('#auth-verify').click()};
function finishAuth(){me.onboarded=true;saveMe();renderProfile();
 pushProfile({name:$('.profile-detail h1').textContent,bio:me.bio,seal:me.seal,cover:me.cover,onboarded:true});
 $('#auth').classList.add('hidden');$$('.app > :not(#landing):not(#auth)').forEach(e=>e.inert=false);
 goto('home')}
$('#enter-app').onclick=()=>{if(me.onboarded){goto('home');$('.app-header .logo')?.focus()}else startAuth()};
$('#auth-next').onclick=async()=>{const hd=$('#auth-handle-input').value.trim().toLowerCase().replace(/^@/,'');
 let bad=!HANDLE_RE.test(hd)?'영문 소문자·숫자·밑줄 3~15자로 적어주세요'
  :(RESERVED.includes(hd)||personBy(hd))?'이미 쓰이고 있는 아이디예요':'';
 if(!bad&&API.on){ /* 진짜 중복은 서버가 잡는다 */
  $('#auth-next').disabled=true;
  try{await api('PATCH','api/me',{handle:hd})}catch(e){bad=e.message}
  $('#auth-next').disabled=false}
 $('#auth-hint').textContent=bad||'영문 소문자 · 숫자 · 밑줄 3~15자';
 $('#auth-hint').classList.toggle('bad',!!bad);
 if(bad)return;
 me.handle=hd;saveMe();
 $('#auth-name-input').value='';renderAuthPreview();showAuthStep('auth-profile')};
$('#auth-handle-input').oninput=()=>$('#auth-hint').classList.remove('bad');
$('#auth-handle-input').onkeydown=e=>{if(e.key==='Enter')$('#auth-next').click()};
$('#auth-seal').onclick=()=>$('#seal-input').click();
$('#auth-cover').onclick=()=>$('#cover-input').click();
$('#auth-done').onclick=()=>{const name=$('#auth-name-input').value.trim().slice(0,40);
 if(name){$('.profile-detail h1').textContent=name;try{localStorage.setItem('diaru-profile-name',name)}catch{}}
 finishAuth()};
$('#auth-skip').onclick=finishAuth;
$$('.app > :not(#landing)').forEach(e=>e.inert=true);
renderDiaries();renderPapers();renderStickers();renderEditorStickers();renderPeople();renderProfile();
var SERVER_READY=connectServer();





