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
const LOG_FILE = path.join(ROOT, 'data', 'logs.json');
fs.mkdirSync(path.dirname(LOG_FILE), {recursive:true});
let logs = [];
try { logs = JSON.parse(fs.readFileSync(LOG_FILE,'utf8')); if(!Array.isArray(logs)) logs=[]; } catch {}
const sessions = new Map();
function persist(){ try { fs.writeFileSync(LOG_FILE, JSON.stringify(logs), 'utf8'); } catch {} }

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
    if(req.method==='DELETE'&&u.pathname.startsWith('/api/admin/logs/')){
      if(!auth(req))return send(res,401,{error:'unauthorized'});
      const id=decodeURIComponent(u.pathname.split('/').pop()); const before=logs.length; logs=logs.filter(x=>x.id!==id); persist(); return send(res,200,{ok:true,deleted:before-logs.length});
    }
    return serve(req,res);
  }catch(e){return send(res,500,{error:'server error'})}
});
server.listen(PORT,()=>console.log(`THE DOT running at http://localhost:${PORT}`));
