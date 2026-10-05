const DEF=[
['col','Columbina','f',[],[]],
['tar','Tartaglia','m',['col'],[]],
['aet','Aether','m',['col'],['xia']],
['xia','Xiao','m',[],['aet']],
['dur','Durin','f',[],[]],
['mik','Yae Miko','f',[],[]],
['sus','Kazuha','m',['aet','xia'],[]],
['hya','Hyacine','f',['aet','xia','dur'],['cip']],
['cip','Cipher','f',['mik'],['hya']],
['kav','Kaveh','m',['hya','cip'],['alh']],
['met','Meta AI','m',['hya','cip'],[]],
['alh','Alhaitham','m',[],['kav']]
].map(a=>({id:a[0],name:a[1],g:a[2],parents:a[3],partners:a[4]}));
let P=[],admin=false,sel=null,TREE=null,TN='',unsub=null,db,auth,user=null,CODES=[],NAMES={};
const clone=o=>JSON.parse(JSON.stringify(o));
function save(){if(!TREE||!admin)return;db.collection('trees').doc(TREE).set({name:TN||TREE,people:P}).catch(e=>alert('No se pudo guardar: '+e.message))}
const $=id=>document.getElementById(id),by=id=>P.find(p=>p.id===id);
const G=(g,m,f)=>g==='f'?f:m;
function anc(id){const d={[id]:0};let q=[id];while(q.length){const n=[];q.forEach(x=>(by(x)?.parents||[]).forEach(p=>{if(!(p in d)){d[p]=d[x]+1;n.push(p)}}));q=n}return d}
function rel(a,b){const A=anc(a),B=anc(b);let best=null;for(const c in A)if(c in B){const s=A[c]+B[c];if(!best||s<best.s)best={s,dP:A[c],dQ:B[c]}}return best}
function label(r,g){const{dP,dQ}=r;
 if(dQ==0)return[['Hijo','Hija'],['Nieto','Nieta'],['Bisnieto','Bisnieta'],['Tataranieto','Tataranieta']][dP-1]?G(g,...[['Hijo','Hija'],['Nieto','Nieta'],['Bisnieto','Bisnieta'],['Tataranieto','Tataranieta']][dP-1]):'Descendiente lejano/a';
 if(dP==0)return[['Padre','Madre'],['Abuelo','Abuela'],['Bisabuelo','Bisabuela'],['Tatarabuelo','Tatarabuela']][dQ-1]?G(g,...[['Padre','Madre'],['Abuelo','Abuela'],['Bisabuelo','Bisabuela'],['Tatarabuelo','Tatarabuela']][dQ-1]):'Ascendiente lejano/a';
 if(dP==1&&dQ==1)return G(g,'Hermano','Hermana');
 if(dP==1)return G(g,'Tío','Tía')+(['',' abuelo',' bisabuelo'][dQ-2]!==undefined&&dQ<5?['',G(g,' abuelo',' abuela'),G(g,' bisabuelo',' bisabuela')][dQ-2]:' lejano/a');
 if(dQ==1)return G(g,'Sobrino','Sobrina')+(dP==2?'':dP==3?G(g,' nieto',' nieta'):G(g,' bisnieto',' bisnieta'));
 const k=Math.min(dP,dQ)-1,d=Math.abs(dP-dQ);
 return G(g,'Primo','Prima')+' '+(k==1?G(g,'hermano','hermana'):k+'º')+(d?` (${d} gen. de diferencia)`:'');}
function relations(id){const me=by(id),out=[];
 P.filter(q=>q.id!==id).forEach(q=>{
  if(me.partners.includes(q.id)){out.push({q,t:G(me.g,'Novio','Novia'),k:0,s:0});return}
  const r=rel(id,q.id);
  if(r){out.push({q,t:label(r,me.g),k:r.dP+r.dQ,s:1});return}
  let t=null;
  for(const sid of me.partners){const s=by(sid),r2=s&&rel(sid,q.id);if(r2){t=`${G(me.g,'Pareja','Pareja')} de ${s.name}, quien es ${label(r2,s.g).toLowerCase()} de ${q.name} (parentesco político)`;break}}
  if(!t)for(const tid of q.partners){const tt=by(tid),r2=tt&&rel(id,tid);if(r2){t=`${label(r2,me.g)} de ${tt.name}, pareja de ${q.name} (parentesco político)`;break}}
  out.push({q,t:t||'Sin parentesco registrado',k:99,s:2,raw:!!t})});
 return out.sort((a,b)=>a.s-b.s||a.k-b.k)}
function gens(){const g={};P.forEach(p=>g[p.id]=0);for(let i=0;i<30;i++)P.forEach(p=>{p.parents.forEach(x=>{if(g[x]!==undefined&&g[p.id]<g[x]+1)g[p.id]=g[x]+1});p.partners.forEach(x=>{if(g[x]!==undefined&&g[p.id]<g[x])g[p.id]=g[x]})});return g}
function render(){if(!TREE||!P.length){$('tree').innerHTML='<p class="em">'+(!TREE?'Introduce un código de 5 letras arriba a la izquierda para ver un árbol.':'Este árbol está vacío.'+(admin?' Añade personas con el botón de arriba.':''))+'</p>';return}
 const g=gens(),max=Math.max(0,...Object.values(g)),t=$('tree');t.innerHTML='<svg id="sv"></svg>';
 const R=sel?new Set(relations(sel).filter(x=>x.s<2).map(x=>x.q.id)):new Set();
 for(let i=0;i<=max;i++){const row=document.createElement('div');row.className='row';
  P.filter(p=>g[p.id]===i).forEach(p=>{const d=document.createElement('div');d.className='n'+(p.id===sel?' sel':R.has(p.id)?' rel':'');d.id='n_'+p.id;d.textContent=p.name;d.onclick=()=>pick(p.id);row.appendChild(d)});
  if(row.children.length)t.appendChild(row)}
 requestAnimationFrame(lines)}
function lines(){const t=$('tree'),sv=$('sv');if(!sv)return;const tr=t.getBoundingClientRect();sv.setAttribute('width',tr.width);sv.setAttribute('height',tr.height);let h='';
 const pt=(id,top)=>{const e=$('n_'+id);if(!e)return null;const r=e.getBoundingClientRect();return[r.left-tr.left+r.width/2,(top?r.top:r.bottom)-tr.top]};
 P.forEach(c=>c.parents.forEach(pid=>{const a=pt(pid,false),b=pt(c.id,true);if(a&&b){const m=(a[1]+b[1])/2;h+=`<path d="M${a[0]} ${a[1]} C${a[0]} ${m},${b[0]} ${m},${b[0]} ${b[1]}" fill="none" stroke="var(--ln)" stroke-width="1.5"/>`}}));
 P.forEach(p=>p.partners.forEach(q=>{if(p.id<q){const e1=$('n_'+p.id),e2=$('n_'+q);if(!e1||!e2)return;const a=e1.getBoundingClientRect(),b=e2.getBoundingClientRect();if(Math.abs(a.top-b.top)<5){const l=a.left<b.left?a:b,r=a.left<b.left?b:a,y=a.top-tr.top+a.height/2;h+=`<line x1="${l.right-tr.left}" y1="${y}" x2="${r.left-tr.left}" y2="${y}" stroke="var(--ac)" stroke-width="2" stroke-dasharray="4 3"/>`}}}));
 sv.innerHTML=h}
addEventListener('resize',lines);
function pick(id){sel=id;const me=by(id),rs=relations(id);
 let h=`<div style="display:flex;justify-content:space-between;align-items:center"><h2>${esc(me.name)}</h2><button onclick="closeS()">✕</button></div>`;
 if(admin)h+=`<div style="margin-bottom:8px"><button onclick="edit('${id}')">Editar</button> <button class="d" onclick="del('${id}')">Eliminar</button></div>`;
 rs.forEach(x=>{h+=x.raw||x.s==2?`<div class="r"><a onclick="pick('${x.q.id}')">${esc(x.q.name)}</a>: <small>${esc(x.t)}</small></div>`:`<div class="r">${x.t} de <a onclick="pick('${x.q.id}')">${esc(x.q.name)}</a></div>`});
 if(!rs.length)h+='<div class="r"><small>No hay más personas.</small></div>';
 $('sheet').innerHTML=h;$('sheet').classList.add('o');$('sheet').scrollTop=0;render()}
function closeS(){sel=null;$('sheet').classList.remove('o');render()}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function modal(h){$('mb').innerHTML=h;$('modal').style.display='flex'}
function hide(){$('modal').style.display='none'}
$('modal').onclick=e=>{if(e.target.id==='modal')hide()};
$('lb').onclick=()=>{if(user){auth.signOut();return}
 modal(`<h3 style="margin-top:0">Cuenta</h3><small>Con cuenta, tus códigos se guardan y no hace falta volver a escribirlos. Como invitado, tendrás que meterlos en cada recarga.</small><input id="u" placeholder="Usuario" autocapitalize="none" style="margin-top:10px"><input id="pw" type="password" placeholder="Contraseña"><div class="err" id="er"></div><button class="p" onclick="login()">Entrar</button> <button onclick="register()">Crear cuenta</button> <button onclick="hide()">Cancelar</button>`)};
const uname=()=>{const u=$('u').value.trim();return u.includes('@')?u:u.toLowerCase()+'@arbol.local'};
async function login(){if(!$('u').value.trim()||!$('pw').value)return;
 try{await auth.signInWithEmailAndPassword(uname(),$('pw').value);hide()}catch(e){console.error(e);$('er').textContent=['auth/invalid-credential','auth/wrong-password','auth/user-not-found','auth/invalid-email'].includes(e.code)?'Usuario o contraseña incorrectos':'Error: '+(e.code||e.message)}}
async function register(){const u=$('u').value.trim();
 if(!u.includes('@')&&!/^[A-Za-z0-9_.-]{3,20}$/.test(u))return $('er').textContent='Usuario: 3-20 caracteres (letras, números, _ . -)';
 if($('pw').value.length<6)return $('er').textContent='La contraseña necesita al menos 6 caracteres';
 try{await auth.createUserWithEmailAndPassword(uname(),$('pw').value);hide()}
 catch(e){console.error(e);$('er').textContent=e.code==='auth/email-already-in-use'?'Ese usuario ya existe':'Error: '+(e.code||e.message)}}
async function isAdmin(u){try{return(await db.collection('admins').doc(u.uid).get()).exists}catch(e){return false}}
function setAdmin(v){admin=v;$('lb').textContent=user?'Salir':'Login';$('tools').style.display=v?'flex':'none';sel?pick(sel):render()}
function edit(id){if(!TREE)return alert('Primero abre o crea un árbol');const p=id?by(id):{name:'',g:'f',parents:[],partners:[]},o=P.filter(x=>x.id!==id);
 const cb=(n,l)=>o.map(x=>`<label class="c"><input type="checkbox" name="${n}" value="${x.id}" ${l.includes(x.id)?'checked':''}>${esc(x.name)}</label>`).join('')||'<small>—</small>';
 modal(`<h3 style="margin-top:0">${id?'Editar':'Añadir'} persona</h3>Nombre<input id="nm" value="${esc(p.name)}">Género<select id="gn"><option value="f" ${p.g=='f'?'selected':''}>Femenino</option><option value="m" ${p.g=='m'?'selected':''}>Masculino</option></select>Padres / madres<div style="margin-bottom:10px">${cb('pa',p.parents)}</div>Parejas<div style="margin-bottom:12px">${cb('pt',p.partners)}</div><button class="p" onclick="sv('${id||''}')">Guardar</button> <button onclick="hide()">Cancelar</button>`)}
function sv(id){const nm=$('nm').value.trim();if(!nm)return;const chk=n=>[...document.querySelectorAll(`input[name=${n}]:checked`)].map(e=>e.value);
 let p=id?by(id):null;if(!p){p={id:'p'+Date.now(),parents:[],partners:[]};P.push(p)}
 p.name=nm;p.g=$('gn').value;p.parents=chk('pa');p.partners=chk('pt');
 P.forEach(x=>{if(x.id!==p.id){x.partners=x.partners.filter(i=>i!==p.id);if(p.partners.includes(x.id))x.partners.push(p.id)}});
 save();hide();render();sel&&pick(sel)}
function del(id){if(!confirm('¿Eliminar a '+by(id).name+'?'))return;P=P.filter(p=>p.id!==id);P.forEach(p=>{p.parents=p.parents.filter(i=>i!==id);p.partners=p.partners.filter(i=>i!==id)});save();closeS()}
function reset(){if(confirm('¿Cargar los datos iniciales en este árbol? Se sobrescribe lo actual.')){P=clone(DEF);save()}}
function expo(){modal(`<h3 style="margin-top:0">Exportar</h3><small>Copia este texto para guardar tu árbol.</small><textarea id="ex" style="width:100%;height:200px;margin:8px 0">${esc(JSON.stringify(P))}</textarea><button onclick="hide()">Cerrar</button>`);$('ex').select()}
$('imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!Array.isArray(d))throw 0;P=d;save();closeS()}catch(x){alert('Archivo inválido')}})};

$('ci').oninput=e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,'');
$('ci').onkeydown=e=>{if(e.key==='Enter')unlock($('ci').value)};
$('cb').onclick=()=>unlock($('ci').value);
$('ts').onchange=e=>{if(e.target.value)goTree(e.target.value)};
function persist(){if(user)db.collection('users').doc(user.uid).set({codes:CODES}).catch(()=>{})}
async function nameOf(c){if(NAMES[c])return NAMES[c];try{const s=await db.collection('trees').doc(c).get();if(s.exists)return NAMES[c]=s.data().name||c}catch(e){}return null}
async function unlock(c){c=c.trim().toUpperCase();if(!/^[A-Z]{5}$/.test(c))return alert('El código tiene 5 letras');
 if(!(await nameOf(c)))return alert('Código incorrecto');
 if(!CODES.includes(c)){CODES.push(c);persist()}
 $('ci').value='';goTree(c);refreshTrees()}
async function refreshTrees(){let list=[];
 if(admin){try{(await db.collection('trees').get()).forEach(d=>{NAMES[d.id]=d.data().name||d.id;list.push(d.id)})}catch(e){}}
 else for(const c of CODES)if(await nameOf(c))list.push(c);
 const s=$('ts');s.style.display=list.length?'':'none';
 s.innerHTML=(TREE?'':'<option value="">Elige árbol…</option>')+list.map(c=>`<option value="${c}" ${c===TREE?'selected':''}>${esc(NAMES[c])}${admin?' ('+c+')':''}</option>`).join('')}
function goTree(c){TREE=c;sel=null;$('ts').value=c;listen()}
function listen(){if(unsub){unsub();unsub=null}
 if(!TREE){P=[];TN='';$('cc').textContent='';$('sheet').classList.remove('o');render();return}
 $('cc').textContent='Código: '+TREE;
 unsub=db.collection('trees').doc(TREE).onSnapshot(s=>{
  if(!s.exists){P=[];TN=TREE}else{P=s.data().people||[];TN=s.data().name||TREE}
  document.title=TN+' · Árbol genealógico';if(sel&&!by(sel))sel=null;
  sel?pick(sel):($('sheet').classList.remove('o'),render())},e=>alert('No se pudo leer el árbol: '+e.message))}
async function newTree(){const n=prompt('Nombre del nuevo árbol:');if(!n)return;
 try{let c,ex=true;while(ex){c=[...crypto.getRandomValues(new Uint8Array(5))].map(b=>String.fromCharCode(65+b%26)).join('');ex=(await db.collection('trees').doc(c).get()).exists}
  await db.collection('trees').doc(c).set({name:n,people:[]});NAMES[c]=n;await refreshTrees();goTree(c);alert('Árbol creado. Código para compartir: '+c)}
 catch(e){alert('No se pudo crear: '+e.message)}}
const cfg=window.FIREBASE_CONFIG;
if(!cfg||String(cfg.apiKey).startsWith('TU_')){$('tree').innerHTML='<p class="em">Falta configurar Firebase: rellena <b>firebase-config.js</b> (mira el README).</p>'}
else{firebase.initializeApp(cfg);db=firebase.firestore();auth=firebase.auth();
 auth.onAuthStateChanged(async u=>{user=u;let a=false;
  if(u){a=await isAdmin(u);
   try{const s=await db.collection('users').doc(u.uid).get();CODES=[...new Set([...(s.exists?s.data().codes||[]:[]),...CODES])];persist()}catch(e){}}
  else{CODES=[];TREE=null;listen()}
  setAdmin(a);refreshTrees()})}