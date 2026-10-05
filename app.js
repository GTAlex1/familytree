const DEF=[
['col','Columbina','f',[],[]],
['tar','Tartaglia','m',['col'],[]],
['aet','Aether','m',['col'],['xia']],
['xia','Lynn','m',[],['aet']],
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
function gens(){const g={};P.forEach(p=>g[p.id]=0);
 for(let i=0;i<40;i++)P.forEach(p=>{
  p.parents.forEach(x=>{if(g[x]!==undefined&&g[p.id]<g[x]+1)g[p.id]=g[x]+1});
  p.partners.forEach(x=>{if(g[x]!==undefined&&g[p.id]<g[x])g[p.id]=g[x]});
  if(!p.parents.length){const k=P.filter(c=>c.parents.includes(p.id));if(k.length){const m=Math.min(...k.map(c=>g[c.id]))-1;if(g[p.id]<m)g[p.id]=m}}});
 return g}
let LAY=null,DR=null,SUP=0;
const W=136,H=54,PX=176,RH=124,LM=96,ROM=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
function layout(g,max){const rows=[],X={};
 for(let i=0;i<=max;i++){const ids=P.filter(p=>g[p.id]===i).map(p=>p.id),seen=new Set(),units=[];
  ids.forEach(id=>{if(seen.has(id))return;const u=[],st=[id];
   while(st.length){const x=st.pop();if(seen.has(x))continue;seen.add(x);u.push(x);by(x).partners.forEach(q=>{if(ids.includes(q)&&!seen.has(q))st.push(q)})}
   units.push({ids:u.sort((a,b)=>(by(a).ord??1e9)-(by(b).ord??1e9)||ids.indexOf(a)-ids.indexOf(b)),c:0,d:0})});
  rows.push(units)}
 const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
 const place=us=>{let prev=null;us.forEach(u=>{const h=u.ids.length*PX/2,min=prev===null?-Infinity:prev+h;
  u.c=isFinite(u.c)?Math.max(u.c,min):(prev===null?h:min);prev=u.c+h;
  u.ids.forEach((id,k)=>X[id]=u.c+(k-(u.ids.length-1)/2)*PX)})};
 rows.forEach(us=>{us.forEach(u=>{const d=u.ids.flatMap(id=>by(id).parents.filter(p=>p in X).map(p=>X[p]));u.d=d.length?avg(d):Infinity});
  const ok=u=>Math.min(...u.ids.map(i=>by(i).ord??Infinity));
  us.sort((a,b)=>{const x=ok(a),y=ok(b);if(x!==y)return x<y?-1:1;return a.d===b.d?0:a.d<b.d?-1:1});us.forEach(u=>u.c=isFinite(u.d)?u.d:-Infinity);place(us)});
 for(let i=max-1;i>=0;i--){rows[i].forEach(u=>{const d=u.ids.flatMap(id=>P.filter(c=>c.parents.includes(id)).map(c=>X[c.id]));if(d.length)u.c=avg(d)});place(rows[i])}
 LAY={rows,g};return X}
function render(){const t=$('tree');
 if(!TREE||!P.length){t.style.width=t.style.height='';t.innerHTML='<p class="em">'+(!TREE?'Introduce un código de 5 letras arriba a la izquierda para ver un árbol.':'Este árbol está vacío.'+(admin?' Añade personas con el botón de arriba.':''))+'</p>';return}
 t.className=admin?'adm':'';
 const g=gens(),max=Math.max(0,...Object.values(g)),X=layout(g,max),xs=P.map(p=>X[p.id]);
 const sh=LM+W/2+10-Math.min(...xs),wd=Math.max(...xs)+sh+W/2+30,ht=(max+1)*RH+20,RY=i=>10+i*RH+H/2;
 const nb=new Set(sel&&by(sel)?[sel,...by(sel).parents,...by(sel).partners,...P.filter(c=>c.parents.includes(sel)).map(c=>c.id)]:[]);
 let gl='',es='',ns='';
 for(let i=0;i<=max;i++)gl+=`<div class="gl" style="top:${RY(i)}px"><span>GEN ${ROM[i]||i+1}</span></div>`;
 P.forEach(c=>c.parents.forEach(a=>{if(!by(a))return;const x1=X[a]+sh,y1=RY(g[a])+H/2,x2=X[c.id]+sh,y2=RY(g[c.id])-H/2,b=y2-(RH-H)/2;
  es+=`<path class="e${sel?(a===sel||c.id===sel?'':' dim'):''}" d="M${x1} ${y1}V${b}H${x2}V${y2}" marker-end="url(#ar)"/>`}));
 P.forEach(p=>p.partners.forEach(q=>{if(p.id<q&&by(q)&&g[p.id]===g[q]){const l=X[p.id]<X[q]?p.id:q,r=l===p.id?q:p.id,y=RY(g[p.id]);
  es+=`<line class="e pt${sel?(p.id===sel||q===sel?'':' dim'):''}" x1="${X[l]+sh+W/2}" y1="${y}" x2="${X[r]+sh-W/2}" y2="${y}"/>`}}));
 P.forEach(p=>{const c=p.id===sel?' sel':sel&&!nb.has(p.id)?' dim':'';
  ns+=`<div class="n${c}" id="n_${p.id}" style="left:${X[p.id]+sh-W/2}px;top:${RY(g[p.id])-H/2}px" onclick="clk('${p.id}')"><b>${esc(p.name)}</b><i>GEN ${g[p.id]+1}</i></div>`});
 t.style.width=wd+'px';t.style.height=ht+'px';
 t.innerHTML=gl+`<svg width="${wd}" height="${ht}"><defs><marker id="ar" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--hl)"/></marker></defs>${es}</svg>`+ns}
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
async function isAdmin(u){return u.uid===window.ADMIN_UID}
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
async function genCode(){let c,ex=true;
 while(ex){c=[...crypto.getRandomValues(new Uint8Array(5))].map(b=>String.fromCharCode(65+b%26)).join('');ex=(await db.collection('trees').doc(c).get()).exists}
 return c}
function copyCode(){if(TREE&&navigator.clipboard)navigator.clipboard.writeText(TREE).then(()=>alert('Código copiado: '+TREE))}
async function regenCode(){if(!TREE||!confirm('Se generará un código nuevo y el anterior dejará de funcionar. ¿Continuar?'))return;
 try{const old=TREE,c=await genCode();
  await db.collection('trees').doc(c).set({name:TN||old,people:P});
  await db.collection('trees').doc(old).delete();
  NAMES[c]=TN||old;CODES=CODES.filter(x=>x!==old);persist();goTree(c);refreshTrees();alert('Nuevo código: '+c)}
 catch(e){alert('No se pudo cambiar el código: '+e.message)}}
async function newTree(){const n=prompt('Nombre del nuevo árbol:');if(!n)return;
 try{const c=await genCode();
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

// ---- Arrastrar para reordenar (solo admin) ----
function clk(id){if(Date.now()-SUP>300)pick(id)}
$('tree').addEventListener('pointerdown',e=>{
 if(!admin||!LAY||e.button>0)return;const n=e.target.closest('.n');if(!n)return;
 const id=n.id.slice(2),u=(LAY.rows[LAY.g[id]]||[]).find(u=>u.ids.includes(id));if(!u)return;
 DR={id,u,x0:e.clientX,dx:0,moved:false,els:u.ids.map(i=>$('n_'+i))};try{n.setPointerCapture(e.pointerId)}catch(x){}});
addEventListener('pointermove',e=>{if(!DR)return;const dx=e.clientX-DR.x0;
 if(!DR.moved&&Math.abs(dx)<6)return;DR.moved=true;DR.dx=dx;
 DR.els.forEach(el=>{el.style.transform=`translateX(${dx}px)`;el.classList.add('drag')})});
addEventListener('pointerup',()=>{if(!DR)return;const d=DR;DR=null;if(!d.moved)return;SUP=Date.now();
 const row=LAY.rows[LAY.g[d.id]],others=row.filter(x=>x!==d.u),dropC=d.u.c+d.dx,
  idx=others.filter(x=>x.c<dropC).length,order=[...others.slice(0,idx),d.u,...others.slice(idx)];
 let k=0;order.forEach(u=>u.ids.forEach(i=>by(i).ord=k++));save();render()});
addEventListener('pointercancel',()=>{if(DR){DR=null;render()}});

async function delTree(){if(!TREE)return;
 const n=prompt(`Esto borra el árbol "${TN||TREE}" para siempre. Para confirmar, escribe su código (${TREE}):`);
 if(n===null)return;if(n.trim().toUpperCase()!==TREE)return alert('El código no coincide. No se ha borrado nada.');
 try{const old=TREE;await db.collection('trees').doc(old).delete();
  CODES=CODES.filter(x=>x!==old);delete NAMES[old];persist();TREE=null;sel=null;listen();refreshTrees()}
 catch(e){alert('No se pudo borrar: '+e.message)}}