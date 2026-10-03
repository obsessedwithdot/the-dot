// THE DOT – shared public data
const ownerKey = "dotOwnerId";
const ownerId = localStorage.getItem(ownerKey) || (()=>{ const id=crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random().toString(36).slice(2); localStorage.setItem(ownerKey,id); return id; })();
let posts = JSON.parse(localStorage.getItem("dotPosts") || "[]");
let chats = JSON.parse(localStorage.getItem("dotChats") || "{}");
let adminLogs = JSON.parse(localStorage.getItem("dotAdminLogs") || "[]");
let filter="all", sort="new", q="", selectedLocation=null, activeThread="", mapState=null, serverAdminToken="";
let sharedReady=false;


const I18N={
  en:{navExplore:'Explore',navNew:'New',navAbout:'About THE DOT',heroTitle:'What has been written<br>about <em>someone</em>?',heroText:'Find stories, thoughts and memories from people around the world.',searchPlaceholder:'Search for a name, word or place …',try:'Try',sections:'SECTIONS',forYou:'For you',people:'People',places:'Places',stories:'Stories',myPosts:'My posts',publicStories:'PUBLIC STORIES',newest:'Newest',relevant:'Relevant',justPosted:'JUST POSTED',webMusic:'Web Music Player',musicDesc:'Spotify, direct audio URLs and supported web-media links.',musicPlaceholder:'Spotify or audio URL …',load:'Load',noTrack:'No track selected yet.',worldwide:'THE DOT is worldwide.',worldDesc:'Write about a person, a place or a moment and start a discussion.',writeStory:'Write a story →',yourStory:'YOUR STORY',setDot:'Drop a dot.',composeDesc:'Write about yourself, a person, a place or a moment.',titleLabel:'Title',titlePlaceholder:'What is your post about?',textLabel:'Text',textPlaceholder:'What do you want to tell?',tagsLabel:'Tags',categoryLabel:'Category',useMap:'Use the map?',useMapDesc:'Optional. Turn it on when you want to mark a place.',mapLocation:'Location on the world map',clickMap:'(click the map)',noLocation:'No location selected',removePoint:'Remove point',important:'Important:',safetyNotice:'Do not publish private data, addresses, phone numbers, threats or targeted harassment.',publish:'Publish →',aboutTitle:'A dot on the internet.',aboutDesc:'THE DOT is a public place for stories. Posts can have a place on the world map and a public discussion.',stepWrite:'Write',stepWriteDesc:'Publish a story.',stepMark:'Mark',stepMarkDesc:'Optionally place a dot on the world map.',stepDiscuss:'Discuss',stepDiscussDesc:'Talk about a post or place.',adminCodeRequired:'Access code required.',codeLabel:'Code',codePlaceholder:'Access code',open:'Open',lock:'Lock',activities:'Activity',time:'Time',type:'Type',who:'Who',content:'Content',action:'Action',mapLoading:'Loading world map…',post:'post',chat:'chat',delete:'delete',unknown:'unknown',explore:'Explore',myPostsTitle:'My posts',searchResults:'results for',posts:'posts',noPosts:'No posts yet.',nothingFound:'Nothing found.',tryDifferent:'Try another name, term or place.',writeFirst:'Publish the first post and optionally place a dot on the world map.',discussion:'Discussion',discussionSubPost:'Discuss this post. The discussion is public.',discussionSubPlace:'Discuss this place. The discussion is public.',noMessages:'No messages yet. Start the discussion.',messagePlaceholder:'Write a message …',send:'Send',read:'Read →',onMap:'View on the map',locationOnMap:'Location on the map',deleteOwn:'Delete',published:'Your post was published.',postDeleted:'Post deleted.',messageSent:'Message sent.',titleBodyError:'Please enter a title and a little more text.',invalidUrl:'Please enter a valid http(s) URL.',audioError:'The URL does not provide directly playable audio or blocks cross-origin access.',wrongCode:'Access code is incorrect.',adminDeleted:'Post was deleted by the admin.',lockAdmin:'Lock',language:'Language',writeButton:'+ Write',boxText:'Everyone can leave something behind. A thought. A memory. A story.',musicNote:'A normal webpage URL is not automatically an audio file. The browser can only play media supplied as audio/video or through an allowed embedded player.',footerText:'A public place for human stories.',demoNotice:'This is a local demo. A real worldwide platform needs a backend, database, accounts, moderation and a global search index.',adminDemoNote:'Demo access: the code is in the frontend and is not a real security boundary.',noticeLabel:'Note:',adminIpNote:'The IP column is available when the server supplies it. Real IP logging is server-side and should be transparent, lawful and data-minimised.'},
  de:{navExplore:'Entdecken',navNew:'Neu',navAbout:'Über THE DOT',heroTitle:'Was wurde über<br><em>jemanden</em> geschrieben?',heroText:'Finde Geschichten, Gedanken und Erinnerungen von Menschen aus aller Welt.',searchPlaceholder:'Suche nach einem Namen, Wort oder Ort …',try:'Probier',sections:'BEREICHE',forYou:'Für dich',people:'Menschen',places:'Orte',stories:'Geschichten',myPosts:'Meine Beiträge',publicStories:'ÖFFENTLICHE GESCHICHTEN',newest:'Neu',relevant:'Relevant',justPosted:'GERADE GEPOSTET',webMusic:'Web Music Player',musicDesc:'Spotify, direkte Audio-URLs und unterstützte Web-Media-Links.',musicPlaceholder:'Spotify- oder Audio-URL …',load:'Laden',noTrack:'Noch kein Titel ausgewählt.',worldwide:'THE DOT ist weltweit.',worldDesc:'Schreib über einen Menschen, einen Ort oder einen Moment und starte eine Diskussion.',writeStory:'Geschichte schreiben →',yourStory:'DEINE GESCHICHTE',setDot:'Setz einen Punkt.',composeDesc:'Schreib etwas über dich, einen Menschen, einen Ort oder einen Moment.',titleLabel:'Titel',titlePlaceholder:'Worum geht es in deinem Beitrag?',textLabel:'Text',textPlaceholder:'Was möchtest du erzählen?',tagsLabel:'Tags',categoryLabel:'Kategorie',useMap:'Karte verwenden?',useMapDesc:'Optional. Aktiviere sie, wenn du einen Ort markieren möchtest.',mapLocation:'Ort auf der Weltkarte',clickMap:'(klicke auf die Karte)',noLocation:'Noch kein Ort ausgewählt',removePoint:'Punkt entfernen',important:'Wichtig:',safetyNotice:'Keine privaten Daten, Adressen, Telefonnummern, Drohungen oder gezielte Belästigung veröffentlichen.',publish:'Veröffentlichen →',aboutTitle:'Ein Punkt im Internet.',aboutDesc:'THE DOT ist als öffentlicher Platz für Geschichten gedacht. Beiträge können einen Ort auf der Weltkarte und eine öffentliche Diskussion bekommen.',stepWrite:'Schreiben',stepWriteDesc:'Veröffentliche eine Geschichte.',stepMark:'Markieren',stepMarkDesc:'Setze optional einen Punkt auf der Weltkarte.',stepDiscuss:'Diskutieren',stepDiscussDesc:'Unterhalte dich über Beitrag oder Ort.',adminCodeRequired:'Zugangscode erforderlich.',codeLabel:'Code',codePlaceholder:'Zugangscode',open:'Öffnen',lock:'Sperren',activities:'Aktivitäten',time:'Zeit',type:'Typ',who:'Wer',content:'Inhalt',action:'Aktion',mapLoading:'Weltkarte wird geladen…',post:'Beitrag',chat:'Chat',delete:'Löschen',unknown:'unbekannt',explore:'Entdecken',myPostsTitle:'Meine Beiträge',searchResults:'Ergebnisse für',posts:'Beiträge',noPosts:'Noch keine Beiträge.',nothingFound:'Nichts gefunden.',tryDifferent:'Versuch einen anderen Namen, Begriff oder Ort.',writeFirst:'Veröffentliche den ersten Beitrag und setze auf Wunsch einen Punkt auf der Weltkarte.',discussion:'Diskussion',discussionSubPost:'Unterhalte dich über diesen Beitrag. Die Diskussion ist öffentlich.',discussionSubPlace:'Unterhalte dich über diesen Ort. Die Diskussion ist öffentlich.',noMessages:'Noch keine Nachrichten. Starte die Diskussion.',messagePlaceholder:'Schreibe eine Nachricht …',send:'Senden',read:'Lesen →',onMap:'Auf der Karte ansehen',locationOnMap:'Ort auf der Karte',deleteOwn:'Löschen',published:'Dein Beitrag wurde veröffentlicht.',postDeleted:'Beitrag gelöscht.',messageSent:'Nachricht gesendet.',titleBodyError:'Bitte Titel und etwas mehr Text eingeben.',invalidUrl:'Bitte eine gültige http(s)-URL eingeben.',audioError:'Die URL liefert keine direkt abspielbare Audiodatei oder blockiert Cross-Origin-Zugriff.',wrongCode:'Zugangscode ist falsch.',adminDeleted:'Beitrag wurde vom Admin gelöscht.',lockAdmin:'Sperren',language:'Sprache',writeButton:'+ Schreiben',boxText:'Jeder Mensch kann etwas hinterlassen. Einen Gedanken. Eine Erinnerung. Eine Geschichte.',musicNote:'Eine normale Webseiten-URL ist nicht automatisch eine Audiodatei. Der Browser kann nur Medien abspielen, die der Zielserver als Audio/Video bereitstellt oder einen erlaubten Player anbieten.',footerText:'Ein öffentlicher Ort für menschliche Geschichten.',demoNotice:'Dies ist eine lokale Demo. Für eine echte weltweite Plattform braucht THE DOT ein Backend, eine Datenbank, Accounts, Moderation und einen globalen Suchindex.',adminDemoNote:'Demo-Zugang: Der Code ist im Frontend sichtbar und daher keine echte Sicherheitsgrenze.',noticeLabel:'Hinweis:',adminIpNote:'Die IP-Spalte ist verfügbar, wenn der Server sie liefert. Echte IP-Erfassung erfolgt serverseitig und sollte transparent, rechtmäßig und datensparsam umgesetzt werden.'},
  es:{navExplore:'Explorar',navNew:'Nuevo',navAbout:'Sobre THE DOT',heroText:'Encuentra historias, pensamientos y recuerdos de personas de todo el mundo.',sections:'SECCIONES',forYou:'Para ti',people:'Personas',places:'Lugares',stories:'Historias',myPosts:'Mis publicaciones',newest:'Más recientes',relevant:'Relevantes',justPosted:'RECIÉN PUBLICADO',webMusic:'Reproductor web',musicDesc:'Spotify, URLs de audio directas y medios web compatibles.',load:'Cargar',noTrack:'Aún no hay ninguna pista.',worldwide:'THE DOT es mundial.',worldDesc:'Escribe sobre una persona, un lugar o un momento e inicia una conversación.',writeStory:'Escribir una historia →',yourStory:'TU HISTORIA',setDot:'Deja un punto.',composeDesc:'Escribe sobre ti, una persona, un lugar o un momento.',titleLabel:'Título',textLabel:'Texto',tagsLabel:'Etiquetas',categoryLabel:'Categoría',useMap:'¿Usar el mapa?',useMapDesc:'Opcional. Actívalo para marcar un lugar.',mapLocation:'Ubicación en el mapa',clickMap:'(haz clic en el mapa)',noLocation:'No hay ubicación seleccionada',removePoint:'Eliminar punto',important:'Importante:',safetyNotice:'No publiques datos privados, direcciones, teléfonos, amenazas o acoso dirigido.',publish:'Publicar →',aboutTitle:'Un punto en internet.',stepWrite:'Escribir',stepMark:'Marcar',stepDiscuss:'Conversar',adminCodeRequired:'Se requiere código de acceso.',codeLabel:'Código',open:'Abrir',lock:'Bloquear',activities:'Actividad',time:'Hora',type:'Tipo',who:'Quién',content:'Contenido',action:'Acción',mapLoading:'Cargando mapa…',discussion:'Conversación',send:'Enviar',messagePlaceholder:'Escribe un mensaje…',read:'Leer →',deleteOwn:'Eliminar',published:'Tu publicación fue publicada.',postDeleted:'Publicación eliminada.',messageSent:'Mensaje enviado.',wrongCode:'El código es incorrecto.',adminDeleted:'El administrador eliminó la publicación.'},
  fr:{navExplore:'Explorer',navNew:'Nouveau',navAbout:'À propos de THE DOT',heroText:'Trouvez des histoires, des pensées et des souvenirs de personnes du monde entier.',sections:'SECTIONS',forYou:'Pour vous',people:'Personnes',places:'Lieux',stories:'Histoires',myPosts:'Mes publications',newest:'Récentes',relevant:'Pertinentes',justPosted:'PUBLIÉ À L’INSTANT',webMusic:'Lecteur web',musicDesc:'Spotify, URLs audio directes et médias web pris en charge.',load:'Charger',noTrack:'Aucun titre sélectionné.',worldwide:'THE DOT est mondial.',worldDesc:'Écrivez sur une personne, un lieu ou un moment et lancez une discussion.',writeStory:'Écrire une histoire →',yourStory:'VOTRE HISTOIRE',setDot:'Posez un point.',composeDesc:'Écrivez sur vous, une personne, un lieu ou un moment.',titleLabel:'Titre',textLabel:'Texte',tagsLabel:'Tags',categoryLabel:'Catégorie',useMap:'Utiliser la carte ?',useMapDesc:'Optionnel. Activez-la pour marquer un lieu.',mapLocation:'Lieu sur la carte',clickMap:'(cliquez sur la carte)',noLocation:'Aucun lieu sélectionné',removePoint:'Retirer le point',important:'Important :',safetyNotice:'Ne publiez pas de données privées, adresses, numéros de téléphone, menaces ou harcèlement ciblé.',publish:'Publier →',aboutTitle:'Un point sur internet.',stepWrite:'Écrire',stepMark:'Marquer',stepDiscuss:'Discuter',adminCodeRequired:'Code d’accès requis.',codeLabel:'Code',open:'Ouvrir',lock:'Verrouiller',activities:'Activité',time:'Heure',type:'Type',who:'Qui',content:'Contenu',action:'Action',mapLoading:'Chargement de la carte…',discussion:'Discussion',send:'Envoyer',messagePlaceholder:'Écrivez un message…',read:'Lire →',deleteOwn:'Supprimer',published:'Votre publication a été publiée.',postDeleted:'Publication supprimée.',messageSent:'Message envoyé.',wrongCode:'Code incorrect.',adminDeleted:'La publication a été supprimée par l’administrateur.'}
};
let lang=localStorage.getItem('dotLang')||'en';
function t(key){return I18N[lang]?.[key]??I18N.en[key]??key}
function applyLanguage(){
  document.documentElement.lang=lang;
  $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $$('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
  $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  const sel=$('#languageSelect'); if(sel)sel.value=lang;
  const saved=$('#spotifyUrl'); if(saved && !saved.value) saved.placeholder=t('musicPlaceholder');
  if($('#locationStatus')&&!selectedLocation)$('#locationStatus').textContent=t('noLocation');
  render();
}

const $=x=>document.querySelector(x), $$=x=>[...document.querySelectorAll(x)];
const esc=s=>(s??"").toString().replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const ago=t=>{let m=Math.max(1,Math.floor((Date.now()-t)/60000));return m<60?`vor ${m} Min.`:m<1440?`vor ${Math.floor(m/60)} Std.`:`vor ${Math.floor(m/1440)} Tag${m>=2880?"en":""}`};
const locationLabel=p=>p.location?`${Number(p.location.lat).toFixed(4)}, ${Number(p.location.lng).toFixed(4)}`:"";
const locationLink=p=>p.location?`https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.location.lat)}&mlon=${encodeURIComponent(p.location.lng)}#map=8/${encodeURIComponent(p.location.lat)}/${encodeURIComponent(p.location.lng)}`:"";
const threadKey=p=>p.location?`loc:${Number(p.location.lat).toFixed(3)}:${Number(p.location.lng).toFixed(3)}`:`post:${p.id}`;
const savePosts=()=>localStorage.setItem("dotPosts",JSON.stringify(posts));
const saveChats=()=>localStorage.setItem("dotChats",JSON.stringify(chats));
const saveLogs=()=>localStorage.setItem("dotAdminLogs",JSON.stringify(adminLogs));

async function loadSharedData(){
  try{
    const [pr,cr]=await Promise.all([fetch('/api/posts',{cache:'no-store'}),fetch('/api/chats',{cache:'no-store'})]);
    if(pr.ok){const d=await pr.json();posts=Array.isArray(d.posts)?d.posts.map(p=>({...p,isMine:p.ownerId===ownerId})):[];savePosts();}
    if(cr.ok){const d=await cr.json();chats=d.chats&&typeof d.chats==='object'?d.chats:{};saveChats();}
    sharedReady=pr.ok&&cr.ok;
    render();
  }catch(e){ sharedReady=false; }
}

async function migrateLocalPosts(){
  if(localStorage.getItem('dotSharedMigrationV1')==='1')return;
  const local=JSON.parse(localStorage.getItem('dotPosts')||'[]');
  for(const p of local){
    try{await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...p,ownerId})});}catch(e){}
  }
  localStorage.setItem('dotSharedMigrationV1','1');
}


function logActivity(type, content, post=null){
  const entry={id:Date.now()+"-"+Math.random().toString(36).slice(2),time:Date.now(),type,user:post?.author||"anonymous",ip:"nicht verfügbar",content:(content||"").slice(0,1200),postId:post?.id||""};
  adminLogs.unshift(entry); adminLogs=adminLogs.slice(0,500); saveLogs();
  fetch('/api/log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,content,user:entry.user,postId:entry.postId})}).then(r=>r.ok?r.json():null).then(serverEntry=>{if(serverEntry){entry.ip=serverEntry.ip||entry.ip;entry.serverId=serverEntry.id;saveLogs();if(!$("#adminPanel").classList.contains('hidden'))renderAdmin();}}).catch(()=>{});
}

function list(){
  let a=posts.filter(p=>{
    const categoryOk=filter==="all"||filter==="mine"?true:p.category===filter;
    const mineOk=filter!=="mine"||p.isMine===true;
    return categoryOk&&mineOk&&(!q||[p.title,p.body,(p.tags||[]).join(" "),p.author,locationLabel(p)].join(" ").toLowerCase().includes(q.toLowerCase()));
  });
  if(sort==="new") a.sort((x,y)=>y.created-x.created);
  if(sort==="rel") a.sort((x,y)=>((y.tags||[]).length+(y.location?2:0))-((x.tags||[]).length+(x.location?2:0)));
  return a;
}

function render(){
  const a=list();
  $("#count").textContent=posts.length;
  $("#meta").textContent=q?`${a.length} ${t('searchResults')} „${esc(q)}”`:`${a.length} ${t('posts')}`;
  const titleMap={all:t('explore'),mine:t('myPostsTitle'),people:t('people'),places:t('places'),stories:t('stories')};
  $("#title").textContent=q?`${t('searchResults')} „${q}”`:titleMap[filter]||t('explore');
  $("#feed").innerHTML=a.length?a.map(p=>`<article class="card"><div class="author"><b>${esc(p.author)}</b> · ${esc(p.country||'Worldwide')} · ${ago(p.created)}</div><h3 data-open="${esc(p.id)}">${esc(p.title)}</h3><p class="excerpt">${esc(p.body.length>250?p.body.slice(0,250)+'…':p.body)}</p>${p.location?`<a class="post-location" href="https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.location.lat)}&mlon=${encodeURIComponent(p.location.lng)}" target="_blank" rel="noopener">⌖ ${t('onMap')} · ${locationLabel(p)}</a>`:''}<div class="tags">${(p.tags||[]).slice(0,4).map(x=>`<span class="tag">#${esc(x)}</span>`).join('')}</div>${p.isMine?`<button class="delete" data-delete="${esc(p.id)}">${t('deleteOwn')}</button>`:''}<button class="read" data-open="${esc(p.id)}">${t('read')}</button></article>`).join(''):`<div class="empty"><strong>${q?t('nothingFound'):t('noPosts')}</strong><p>${q?t('tryDifferent'):t('writeFirst')}</p></div>`;
  $("#latest").innerHTML=posts.length?posts.slice().sort((a,b)=>b.created-a.created).slice(0,5).map(p=>`<div class="rail" data-open="${esc(p.id)}"><small>${ago(p.created)} · ${esc(t(p.category)||p.category)}</small><strong>${esc(p.title)}</strong></div>`).join(''):`<p class="muted">${t('noPosts')}</p>`;
  $$('[data-open]').forEach(x=>x.onclick=()=>openArticle(x.dataset.open));
  $$('[data-delete]').forEach(x=>x.onclick=()=>deletePost(x.dataset.delete));
}

async function deletePost(id){
  const p=posts.find(x=>x.id===id); if(!p||p.ownerId!==ownerId)return;
  if(!confirm("Diesen eigenen Beitrag wirklich löschen?"))return;
  try{
    const r=await fetch(`/api/posts/${encodeURIComponent(id)}/delete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ownerId})});
    if(!r.ok)return toast('Could not delete the post.');
    posts=posts.filter(x=>x.id!==id); delete chats[threadKey(p)]; savePosts(); saveChats(); render(); toast(t("postDeleted"));
  }catch(e){toast('Could not reach THE DOT server.');}
}

function renderChat(p){
  const key=threadKey(p), arr=chats[key]||[];
  return `<div class="chat"><h3>${t('discussion')}</h3><div class="chat-sub">${p.location?t('discussionSubPlace'):t('discussionSubPost')}</div><div class="messages">${arr.length?arr.map(m=>`<div class="message"><b>${esc(m.author)}</b><time>${new Date(m.created).toLocaleString(lang)}</time><p>${esc(m.text)}</p></div>`).join(''):`<div class="chat-empty">${t('noMessages')}</div>`}</div><div class="chat-form"><input id="chatInput" maxlength="500" placeholder="${t('messagePlaceholder')}"><button id="chatSend">${t('send')}</button></div></div>`;
}

function openArticle(id){
  const p=posts.find(x=>x.id===id); if(!p)return;
  activeThread=threadKey(p);
  $("#detail").innerHTML=`<small>${esc((p.category||'').toUpperCase())} · ${esc(p.country||'Worldwide')}</small><h2 class="article-title">${esc(p.title)}</h2><div class="article-meta">${lang==='de'?'von':'by'} ${esc(p.author)} · ${new Date(p.created).toLocaleString(lang)}</div><div class="article-body">${esc(p.body)}</div>${p.location?`<p><a class="post-location" href="https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.location.lat)}&mlon=${encodeURIComponent(p.location.lng)}" target="_blank" rel="noopener">⌖ ${t('onMap')} · ${locationLabel(p)}</a></p>`:''}<div class="tags">${(p.tags||[]).map(x=>`<span class="tag">#${esc(x)}</span>`).join('')}</div>${renderChat(p)}`;
  $("#article").classList.remove('hidden');
  $("#chatSend").onclick=sendChat;
  $("#chatInput").onkeydown=e=>{if(e.key==='Enter')sendChat()};
}

async function sendChat(){
  const input=$("#chatInput"), text=input.value.trim(); if(!text)return;
  const msg={author:"anonymous",text,created:Date.now()};
  try{
    const r=await fetch('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:activeThread,...msg})});
    if(!r.ok)return toast('Could not send the message.');
    const p=posts.find(x=>threadKey(x)===activeThread);
    if(p)openArticle(p.id);
    toast(t("messageSent"));
    await loadSharedData();
    if(p)openArticle(p.id);
  }catch(e){toast('Could not reach THE DOT server.');}
}

function modal(id,on=true){
  $(id).classList.toggle("hidden",!on);
  if(id==="#compose"&&on){ setTimeout(()=>{if($("#useMap").checked)initMap()},80); }
}
function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}

// ---------- Interactive world map ----------
let dotMapInstance=null;
let dotMapMarker=null;
let mapReadyPromise=null;
function initMap(){
  const root=$("#locationMap");
  if(!root)return;
  if(dotMapInstance){dotMapInstance.remove();dotMapInstance=null;dotMapMarker=null;}
  root.innerHTML='<div id="dotMapLibre" class="dot-maplibre"></div><div class="map-loading">Loading world map…</div>';
  const boot=()=>{
    if(!window.maplibregl){root.querySelector('.map-loading').textContent='Map engine could not be loaded.';return;}
    const map=dotMapInstance=new window.maplibregl.Map({
      container:'dotMapLibre',
      style:'https://tiles.openfreemap.org/styles/dark',
      center:[10,25],
      zoom:2,
      minZoom:0.5,
      maxZoom:18,
      renderWorldCopies:false,
      attributionControl:true,
      dragRotate:false,
      pitchWithRotate:false,
      touchPitch:false,
      cooperativeGestures:false
    });
    map.addControl(new window.maplibregl.NavigationControl({showCompass:false}), 'top-right');
    map.addControl(new window.maplibregl.ScaleControl({maxWidth:120,unit:'metric'}), 'bottom-left');
    map.on('load',()=>{
      root.querySelector('.map-loading')?.remove();
      map.resize();
      if(selectedLocation){placeMapMarker(selectedLocation.lat,selectedLocation.lng,false)}
      map.getCanvas().style.cursor='crosshair';
    });
    map.on('click',e=>{
      setLocation(e.lngLat.lat,e.lngLat.lng);
    });
    map.on('error',e=>{
      const loading=root.querySelector('.map-loading');
      if(loading && e?.error?.message){
        loading.textContent='Map could not be loaded. Please check your internet connection.';
      }
    });
    if(selectedLocation){map.once('idle',()=>map.resize())}
  };
  if(window.maplibregl) boot(); else window.addEventListener('maplibre-ready',boot,{once:true});
}
function placeMapMarker(lat,lng,fly=true){
  if(!dotMapInstance)return;
  if(dotMapMarker)dotMapMarker.remove();
  const el=document.createElement('div');el.className='dot-location-marker';el.setAttribute('aria-label','Selected location');
  dotMapMarker=new window.maplibregl.Marker({element:el}).setLngLat([lng,lat]).addTo(dotMapInstance);
  if(fly)dotMapInstance.flyTo({center:[lng,lat],zoom:Math.max(dotMapInstance.getZoom(),7),duration:500});
}
function setLocation(lat,lng){
  selectedLocation={lat:Number(lat.toFixed(6)),lng:Number(lng.toFixed(6))};
  placeMapMarker(lat,lng,true);
  $("#locationStatus").textContent=`${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
function clearLocation(){
  selectedLocation=null;
  if(dotMapMarker){dotMapMarker.remove();dotMapMarker=null;}
  $("#locationStatus").textContent=t('noLocation');
}

// ---------- Web Music ----------
function spotifyEmbedUrl(raw){
  const value=(raw||"").trim(); const m=value.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)(?:\?[^\s]*)?/i);
  return m?`https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}?utm_source=generator&theme=0`:null;
}
function safeHttpUrl(raw){try{const u=new URL((raw||"").trim());return /^https?:$/.test(u.protocol)?u:null}catch{return null}}
function youtubeId(u){if(!u)return null; if(u.hostname==='youtu.be')return u.pathname.slice(1); if(/youtube\.com$/i.test(u.hostname))return u.searchParams.get('v')||((u.pathname.match(/\/(?:shorts|embed)\/([^/]+)/)||[])[1]||null); return null}
function soundcloudEmbedUrl(raw){const u=safeHttpUrl(raw);if(!u||!/(^|\.)soundcloud\.com$/i.test(u.hostname))return null;return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&color=%23000000&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&visual=false`}
function loadSpotify(){
  const raw=$("#spotifyUrl").value.trim(); const spotify=spotifyEmbedUrl(raw);
  if(spotify){$("#spotifyPlayer").innerHTML=`<iframe src="${spotify}" title="Spotify Web Player" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;localStorage.setItem("dotSpotifyUrl",raw);return}
  const u=safeHttpUrl(raw);if(!u)return toast(t("invalidUrl"));
  const yt=youtubeId(u);if(yt){$("#spotifyPlayer").innerHTML=`<iframe src="https://www.youtube.com/embed/${encodeURIComponent(yt)}?autoplay=0" title="YouTube Player" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;localStorage.setItem("dotSpotifyUrl",raw);return}
  const sc=soundcloudEmbedUrl(raw);if(sc){$("#spotifyPlayer").innerHTML=`<iframe src="${sc}" title="SoundCloud Player" loading="lazy" allow="autoplay"></iframe>`;localStorage.setItem("dotSpotifyUrl",raw);return}
  // Any HTTPS URL is handed directly to the browser. If the response is audio/video, the browser can play it even without a file extension.
  const media=document.createElement("audio");media.controls=true;media.preload="metadata";media.src=u.href;media.style.width="100%";
  const host=$("#spotifyPlayer"); host.innerHTML=""; host.appendChild(media);
  media.addEventListener("error",()=>{ host.innerHTML=`<iframe src="${esc(u.href)}" title="Web media" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="no-referrer"></iframe><div class="music-note">${esc(t('audioError'))}</div>`; },{once:true});
  localStorage.setItem("dotSpotifyUrl",raw);
}

// ---------- Admin ----------
function openAdmin(){$("#adminCode").value="";modal("#adminGate")}
async function loginAdmin(){
  const code=$("#adminCode").value.trim();
  if(!code)return toast(t('adminCodeRequired'));
  try{
    const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    if(!r.ok)return toast(t('wrongCode'));
    serverAdminToken=(await r.json()).token;
    modal("#adminGate",false); await renderAdmin(); modal("#adminPanel");
  }catch(e){toast('Start the site through the Node server to use Admin.');}
}
async function loadServerLogs(){
  if(!serverAdminToken)return;
  try{const r=await fetch('/api/admin/logs',{headers:{Authorization:'Bearer '+serverAdminToken}});if(r.ok){const data=await r.json();const byId=new Map(adminLogs.map(x=>[x.serverId||x.id,x]));for(const x of data.logs){if(!byId.has(x.id))adminLogs.push(x);else{const local=byId.get(x.id);local.ip=x.ip;local.serverId=x.id}}adminLogs.sort((a,b)=>b.time-a.time);adminLogs=adminLogs.slice(0,1000);saveLogs();}}catch(e){}
}
async function adminDeletePost(id){
  const p=posts.find(x=>x.id===id); if(!p)return;
  if(!confirm(`Beitrag „${p.title}“ als Admin löschen?`))return;
  try{
    const r=await fetch(`/api/admin/posts/${encodeURIComponent(id)}`,{method:'DELETE',headers:{Authorization:'Bearer '+serverAdminToken}});
    if(!r.ok)return toast('Could not delete the post.');
    posts=posts.filter(x=>x.id!==id); delete chats[threadKey(p)]; savePosts(); saveChats(); render(); await renderAdmin(); toast(t("adminDeleted"));
  }catch(e){toast('Could not reach THE DOT server.');}
}

async function renderAdmin(){
  await loadServerLogs();
  const postCount=adminLogs.filter(x=>x.type==='post').length, chatCount=adminLogs.filter(x=>x.type==='chat').length;
  $("#adminStats").innerHTML=`<div><b>${adminLogs.length}</b><span>${t('activities')}</span></div><div><b>${postCount}</b><span>${t('posts')}</span></div><div><b>${chatCount}</b><span>${t('chat')}</span></div>`;
  $("#adminRows").innerHTML=adminLogs.length?adminLogs.map(x=>`<tr><td>${new Date(x.time).toLocaleString(lang)}</td><td><span class="log-type ${esc(x.type)}">${esc(t(x.type)||x.type)}</span></td><td>${esc(x.user)}</td><td>${esc(x.ip||'unavailable')}</td><td title="${esc(x.content)}">${esc(x.content.length>110?x.content.slice(0,110)+'…':x.content)}</td>${x.postId&&posts.some(p=>p.id===x.postId)?`<td><button class="admin-delete" data-admin-delete="${esc(x.postId)}">${t('deleteOwn')}</button></td>`:'<td>—</td>'}</tr>`).join(''):`<tr><td colspan="6" class="table-empty">${t('noPosts')}</td></tr>`;
  $$('[data-admin-delete]').forEach(b=>b.onclick=()=>adminDeletePost(b.dataset.adminDelete));
}

// ---------- UI ----------
$("#languageSelect").onchange=e=>{lang=e.target.value;localStorage.setItem("dotLang",lang);applyLanguage();};
$("#search").oninput=e=>{q=e.target.value;render()};
$$('[data-q]').forEach(x=>x.onclick=()=>{$("#search").value=x.dataset.q;q=x.dataset.q;render()});
$$('.filter').forEach(x=>x.onclick=()=>{$$('.filter').forEach(y=>y.classList.remove('active'));x.classList.add('active');filter=x.dataset.f;render()});
$$('.sort').forEach(x=>x.onclick=()=>{$$('.sort').forEach(y=>y.classList.remove('active'));x.classList.add('active');sort=x.dataset.s;render()});
$("#writeBtn").onclick=$("#write2").onclick=$("#newBtn").onclick=()=>modal("#compose");
$("#aboutBtn").onclick=()=>modal("#about");
$$('.x').forEach(x=>x.onclick=()=>x.parentElement.parentElement.classList.add('hidden'));
$$('.modal').forEach(x=>x.onclick=e=>{if(e.target===x)x.classList.add('hidden')});
$("#pb").oninput=e=>$("#chars").textContent=`${e.target.value.length} / 1800`;
$("#clearLocation").onclick=clearLocation;
$("#useMap").onchange=e=>{$("#mapWrap").classList.toggle("hidden",!e.target.checked);if(e.target.checked)setTimeout(initMap,50);else clearLocation()};
$("#publish").onclick=async()=>{
  const title=$("#pt").value.trim(),body=$("#pb").value.trim();
  if(title.length<4||body.length<15)return toast(t("titleBodyError"));
  const tags=$("#pg").value.split(",").map(x=>x.trim()).filter(Boolean);
  const post={id:Date.now()+"-"+Math.random().toString(36).slice(2),title,body,tags,category:$("#pc").value,author:"anonymous",country:"Weltweit",ownerId,isMine:true,location:$("#useMap").checked&&selectedLocation?{...selectedLocation}:null,created:Date.now()};
  try{
    const r=await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(post)});
    if(!r.ok)return toast('Could not publish the post.');
    const data=await r.json(); post.id=data.post?.id||post.id;
    $("#pt").value=$("#pb").value=$("#pg").value="";$("#chars").textContent="0 / 1800";$("#useMap").checked=false;$("#mapWrap").classList.add("hidden");clearLocation();modal("#compose",false);filter="all";$$('.filter').forEach(x=>x.classList.toggle('active',x.dataset.f==="all"));await loadSharedData();toast(t("published"));
  }catch(e){toast('Could not reach THE DOT server.');}
};
$("#spotifyLoad").onclick=loadSpotify;
$("#spotifyUrl").onkeydown=e=>{if(e.key==="Enter")loadSpotify()};
const savedSpotify=localStorage.getItem("dotSpotifyUrl");if(savedSpotify){$("#spotifyUrl").value=savedSpotify;loadSpotify()}
$("#adminLogin").onclick=loginAdmin;$("#adminCode").onkeydown=e=>{if(e.key==="Enter")loginAdmin()};$("#adminLogout").onclick=async()=>{if(serverAdminToken)fetch("/api/admin/logout",{method:"POST",headers:{Authorization:"Bearer "+serverAdminToken}}).catch(()=>{});serverAdminToken="";modal("#adminPanel",false)};

document.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==="a"){e.preventDefault();openAdmin();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#search").focus()}if(e.key==="Escape")$$(".modal").forEach(x=>x.classList.add("hidden"))};
applyLanguage();
loadSharedData().then(migrateLocalPosts).then(loadSharedData);
setInterval(loadSharedData, 5000);
window.addEventListener('focus',loadSharedData);
