// THE DOT – optional Node server for real server-side activity/IP logging.
// Start with: node server.js
// For production, set DOT_ADMIN_CODE to a strong secret and use HTTPS.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const ADMIN_CODE = process.env.DOT_ADMIN_CODE || '9kz12AGO';
const DATA_DIR = path.join(ROOT, 'data');
const LOG_FILE = path.join(DATA_DIR, 'logs.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');
fs.mkdirSync(DATA_DIR, {recursive:true});
let logs = [];
try { logs = JSON.parse(fs.readFileSync(LOG_FILE,'utf8')); if(!Array.isArray(logs)) logs=[]; } catch {}
const sessions = new Map();
let posts = [];
let chats = {};
try { posts = JSON.parse(fs.readFileSync(POSTS_FILE,'utf8')); if(!Array.isArray(posts)) posts=[]; } catch {}
try { chats = JSON.parse(fs.readFileSync(CHATS_FILE,'utf8')); if(!chats || typeof chats!=='object') chats={}; } catch {}
function persist(){ try { fs.writeFileSync(LOG_FILE, JSON.stringify(logs), 'utf8'); } catch {} }
function persistPosts(){ try { fs.writeFileSync(POSTS_FILE, JSON.stringify(posts), 'utf8'); } catch {} }
function persistChats(){ try { fs.writeFileSync(CHATS_FILE, JSON.stringify(chats), 'utf8'); } catch {} }

function send(res, status, data, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'SAMEORIGIN', 'Referrer-Policy':'strict-origin-when-cross-origin'});
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>200000) req.destroy();});req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}});req.on('error',reject)})}
function clientIp(req){
  const trustedProxy=process.env.TRUST_PROXY==='1';
  const forwarded=trustedProxy ? (req.headers['x-forwarded-for']||'').split(',')[0].trim() : '';
  let ip=forwarded || req.socket.remoteAddress || 'unknown';
  if(ip.startsWith('::ffff:')) ip=ip.slice(7);
  return ip;
}
function auth(req){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const exp=sessions.get(token);
  if(!exp || exp<Date.now()){sessions.delete(token);return false}
  return true;
}
function safeLog(x){return {...x,content:String(x.content||'').slice(0,1200)}}
function cleanPost(data){
  return {
    id:String(data.id||Date.now()+'-'+crypto.randomBytes(3).toString('hex')).slice(0,100),
    title:String(data.title||'').slice(0,180),
    body:String(data.body||'').slice(0,1800),
    tags:Array.isArray(data.tags)?data.tags.map(x=>String(x).slice(0,40)).slice(0,12):[],
    category:String(data.category||'stories').slice(0,40),
    author:String(data.author||'anonymous').slice(0,120),
    country:String(data.country||'Worldwide').slice(0,80),
    ownerId:String(data.ownerId||'').slice(0,120),
    location:data.location&&Number.isFinite(Number(data.location.lat))&&Number.isFinite(Number(data.location.lng))?{lat:Number(data.location.lat),lng:Number(data.location.lng)}:null,
    created:Number(data.created)||Date.now()
  };
}
function cleanMessage(data){
  return {author:String(data.author||'anonymous').slice(0,120),text:String(data.text||'').slice(0,500),created:Number(data.created)||Date.now()};
}
function addLog(data,req){
  const entry={id:Date.now()+'-'+crypto.randomBytes(4).toString('hex'),time:Date.now(),type:String(data.type||'activity'),user:String(data.user||'anonymous').slice(0,120),ip:clientIp(req),content:String(data.content||'').slice(0,1200),postId:String(data.postId||'')};
  logs.unshift(entry); if(logs.length>5000) logs.pop(); persist(); return entry;
}
function serve(req,res){
  let pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/' ) pathname='/index.html';
  const file=path.normalize(path.join(ROOT,pathname));
  if(!file.startsWith(ROOT)) return send(res,403,{error:'forbidden'});
  fs.readFile(file,(err,data)=>{
    if(err)return send(res,404,{error:'not found'});
    const ext=path.extname(file); const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
    send(res,200,data,types[ext]||'application/octet-stream');
  });
}
const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    if(req.method==='POST'&&u.pathname==='/api/log'){
      const d=await body(req); return send(res,201,addLog(d,req));
    }
    if(req.method==='GET'&&u.pathname==='/api/posts'){
      return send(res,200,{posts});
    }
    if(req.method==='POST'&&u.pathname==='/api/posts'){
      const d=await body(req); const post=cleanPost(d);
      if(post.title.length<4||post.body.length<15)return send(res,400,{error:'invalid post'});
      if(posts.some(x=>x.id===post.id)) post.id=Date.now()+'-'+crypto.randomBytes(3).toString('hex');
      posts.unshift(post); if(posts.length>5000) posts.pop(); persistPosts();
      addLog({type:'post',content:`${post.title} — ${post.body}`,user:post.author,postId:post.id},req);
      return send(res,201,{post});
    }
    if(req.method==='POST'&&u.pathname.startsWith('/api/posts/')&&u.pathname.endsWith('/delete')){
      const id=decodeURIComponent(u.pathname.split('/')[3]||''); const d=await body(req);
      const idx=posts.findIndex(x=>x.id===id); if(idx<0)return send(res,404,{error:'not found'});
      const post=posts[idx]; if(String(d.ownerId||'')!==String(post.ownerId||''))return send(res,403,{error:'forbidden'});
      posts.splice(idx,1); delete chats['post:'+id]; persistPosts(); persistChats();
      addLog({type:'delete',content:`Beitrag gelöscht: ${post.title}`,user:post.author,postId:post.id},req);
      return send(res,200,{ok:true});
    }
    if(req.method==='GET'&&u.pathname==='/api/chats'){
      return send(res,200,{chats});
    }
    if(req.method==='POST'&&u.pathname==='/api/chats'){
      const d=await body(req); const key=String(d.key||'').slice(0,180); const msg=cleanMessage(d);
      if(!key||!msg.text)return send(res,400,{error:'invalid chat'});
      chats[key]??=[]; chats[key].push(msg); if(chats[key].length>1000) chats[key]=chats[key].slice(-1000); persistChats();
      const postId=key.startsWith('post:')?key.slice(5):''; const post=posts.find(x=>x.id===postId);
      addLog({type:'chat',content:msg.text,user:msg.author,postId},req);
      return send(res,201,{message:msg});
    }
    if(req.method==='POST'&&u.pathname==='/api/admin/login'){
      const d=await body(req);
      if(d.code!==ADMIN_CODE)return send(res,401,{error:'invalid code'});
      const token=crypto.randomBytes(32).toString('hex'); sessions.set(token,Date.now()+1000*60*60*8); return send(res,200,{token});
    }
    if(req.method==='GET'&&u.pathname==='/api/admin/logs'){
      if(!auth(req))return send(res,401,{error:'unauthorized'});
      return send(res,200,{logs});
    }
    if(req.method==='POST'&&u.pathname==='/api/admin/logout'){
      const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,''); sessions.delete(token); return send(res,200,{ok:true});
    }
    if(req.method==='DELETE'&&u.pathname.startsWith('/api/admin/posts/')){
      if(!auth(req))return send(res,401,{error:'unauthorized'});
      const id=decodeURIComponent(u.pathname.split('/').pop()); const idx=posts.findIndex(x=>x.id===id);
      if(idx<0)return send(res,404,{error:'not found'}); const post=posts[idx]; posts.splice(idx,1); delete chats['post:'+id]; persistPosts(); persistChats();
      addLog({type:'admin-delete',content:`Admin löschte: ${post.title}`,user:post.author,postId:id},req);
      return send(res,200,{ok:true});
    }
    if(req.method==='DELETE'&&u.pathname.startsWith('/api/admin/logs/')){
      if(!auth(req))return send(res,401,{error:'unauthorized'});
      const id=decodeURIComponent(u.pathname.split('/').pop()); const before=logs.length; logs=logs.filter(x=>x.id!==id); persist(); return send(res,200,{ok:true,deleted:before-logs.length});
    }
    return serve(req,res);
  }catch(e){return send(res,500,{error:'server error'})}
});
server.listen(PORT,()=>console.log(`THE DOT running at http://localhost:${PORT}`));
