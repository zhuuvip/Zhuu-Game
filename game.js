'use strict';

// ─── AUDIO ENGINE ───────────────────────────────────────────────────────────
class AudioEngine {
  constructor() {
    this.ctx = null; this.bgGain = null; this.sfxGain = null;
    this.bgInterval = null; this.bgStarted = false; this.enabled = true;
  }
  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.bgGain = this.ctx.createGain(); this.bgGain.gain.value = 0.25;
      this.bgGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.ctx.destination);
    } catch(e) { this.enabled = false; }
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  _noise(dur, freq, gain, type='sawtooth') {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq*0.3, this.ctx.currentTime+dur);
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+dur);
    o.connect(g); g.connect(this.sfxGain); o.start(); o.stop(this.ctx.currentTime+dur);
  }
  _burst(dur, gain) {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const n = Math.ceil(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<n;i++) d[i] = (Math.random()*2-1);
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain();
    s.buffer = buf;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+dur);
    s.connect(g); g.connect(this.sfxGain); s.start(); s.stop(this.ctx.currentTime+dur);
  }
  playHit(heavy=false) {
    heavy ? (this._burst(0.08,0.6), this._noise(0.12,80,0.4,'square'))
           : (this._burst(0.04,0.3), this._noise(0.07,200,0.25,'square'));
  }
  playSpecial() {
    if (!this.ctx||!this.sfxGain||!this.enabled) return;
    const t = this.ctx.currentTime;
    [200,400,600,800].forEach((f,i) => {
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type='sawtooth'; o.frequency.setValueAtTime(f,t+i*0.05);
      o.frequency.exponentialRampToValueAtTime(f*2,t+i*0.05+0.15);
      g.gain.setValueAtTime(0.2,t+i*0.05); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.05+0.2);
      o.connect(g); g.connect(this.sfxGain); o.start(t+i*0.05); o.stop(t+i*0.05+0.2);
    }); this._burst(0.3,0.2);
  }
  playUltimate() {
    if (!this.ctx||!this.sfxGain||!this.enabled) return;
    const t=this.ctx.currentTime;
    [50,80,120,160].forEach((f,i) => {
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type='sawtooth'; o.frequency.setValueAtTime(f,t);
      o.frequency.exponentialRampToValueAtTime(f*4,t+0.5);
      g.gain.setValueAtTime(0.3,t+i*0.05); g.gain.exponentialRampToValueAtTime(0.001,t+0.8);
      o.connect(g); g.connect(this.sfxGain); o.start(t+i*0.05); o.stop(t+1);
    }); this._burst(0.8,0.4);
  }
  playJump() { this._noise(0.15,300,0.15,'sine'); }
  playBlock() { this._noise(0.1,150,0.2,'square'); }
  playVictory() {
    if (!this.ctx||!this.sfxGain||!this.enabled) return;
    const t=this.ctx.currentTime;
    [523,659,784,1047].forEach((f,i)=>{
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type='square'; o.frequency.value=f;
      g.gain.setValueAtTime(0.3,t+i*0.15); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.15+0.25);
      o.connect(g); g.connect(this.sfxGain); o.start(t+i*0.15); o.stop(t+i*0.15+0.25);
    });
  }
  startBGM() {
    if (this.bgStarted||!this.ctx||!this.bgGain||!this.enabled) return;
    this.bgStarted=true; let beat=0;
    const iv=250, pat=[[1,0,0,1,0,0,1,0],[0,0,1,0,0,1,0,0],[1,0,1,0,1,0,1,0]];
    const bass=[55,55,73,73,65,65,69,69];
    const tick=()=>{
      if (!this.ctx||!this.bgGain||!this.enabled) return;
      const t=this.ctx.currentTime, p=beat%8;
      if(pat[0][p]){
        const buf=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*0.05),this.ctx.sampleRate);
        const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
        const s=this.ctx.createBufferSource(),g=this.ctx.createGain();
        s.buffer=buf; g.gain.setValueAtTime(0.3,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
        s.connect(g); g.connect(this.bgGain); s.start(t);
      }
      if(pat[1][p]){
        const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type='sine'; o.frequency.setValueAtTime(60,t); o.frequency.exponentialRampToValueAtTime(30,t+0.12);
        g.gain.setValueAtTime(0.4,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
        o.connect(g); g.connect(this.bgGain); o.start(t); o.stop(t+0.15);
      }
      if(pat[2][p]){
        const o=this.ctx.createOscillator(),g=this.ctx.createGain();
        o.type='sawtooth'; o.frequency.value=bass[p];
        g.gain.setValueAtTime(0.15,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
        o.connect(g); g.connect(this.bgGain); o.start(t); o.stop(t+0.2);
      }
      beat++;
    };
    tick(); this.bgInterval=setInterval(tick,iv);
  }
  stopBGM() { if(this.bgInterval) clearInterval(this.bgInterval); this.bgStarted=false; }
}

// ─── PARTICLE SYSTEM ────────────────────────────────────────────────────────
class ParticleSystem {
  constructor() { this.particles=[]; }
  spawn(p) { this.particles.push({life:p.maxLife,...p}); }
  spawnHitSparks(x,y,count=12,color='#00ffff') {
    for(let i=0;i<count;i++){
      const a=(Math.PI*2*i/count)+Math.random()*0.5, sp=3+Math.random()*6;
      this.spawn({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,maxLife:18+Math.random()*10,size:2+Math.random()*4,color,type:'spark',gravity:0.25});
    }
  }
  spawnVoidBurst(x,y,count=20) {
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2,sp=1+Math.random()*8;
      const c=['#8800ff','#00ffff','#ff00ff','#4400cc'][Math.floor(Math.random()*4)];
      this.spawn({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,maxLife:25+Math.random()*20,size:3+Math.random()*6,color:c,type:'void',gravity:-0.05});
    }
  }
  spawnAura(x,y,color) {
    const a=Math.random()*Math.PI*2,sp=0.5+Math.random()*1.5;
    this.spawn({x:x+(Math.random()-0.5)*20,y:y+(Math.random()-0.5)*30,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,maxLife:20+Math.random()*15,size:2+Math.random()*4,color,type:'aura',gravity:-0.05});
  }
  spawnDeathExplosion(x,y) {
    for(let i=0;i<60;i++){
      const a=Math.random()*Math.PI*2,sp=1+Math.random()*10;
      const c=['#8800ff','#00ffff','#ff00ff','#ffffff','#4400cc'][Math.floor(Math.random()*5)];
      this.spawn({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,maxLife:40+Math.random()*30,size:2+Math.random()*8,color:c,type:'void',gravity:0.1});
    }
  }
  spawnTrail(x,y,color) {
    this.spawn({x,y,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,maxLife:10+Math.random()*8,size:3+Math.random()*4,color,type:'spark',gravity:0});
  }
  spawnSpecial(x,y,c1,c2) {
    for(let i=0;i<35;i++){
      const a=(Math.PI*2*i/35),sp=4+Math.random()*8;
      this.spawn({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,maxLife:30+Math.random()*20,size:4+Math.random()*6,color:Math.random()>0.5?c1:c2,type:'void',gravity:-0.02});
    }
  }
  update() {
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i];
      p.x+=p.vx; p.y+=p.vy;
      if(p.gravity!==undefined) p.vy+=p.gravity;
      p.vx*=0.97; p.life--;
      if(p.life<=0) this.particles.splice(i,1);
    }
  }
  draw(ctx) {
    ctx.save();
    for(const p of this.particles){
      const alpha=p.life/p.maxLife;
      ctx.globalAlpha=alpha;
      if(p.type==='spark'){
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*alpha,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.shadowBlur=8; ctx.shadowColor=p.color; ctx.fill(); ctx.shadowBlur=0;
      } else if(p.type==='void'||p.type==='aura'){
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
        g.addColorStop(0,p.color); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.shadowBlur=12; ctx.shadowColor=p.color; ctx.fill(); ctx.shadowBlur=0;
      } else if(p.type==='debris'){
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.life*0.15);
        ctx.fillStyle=p.color; ctx.shadowBlur=6; ctx.shadowColor=p.color;
        ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.shadowBlur=0; ctx.restore();
      }
    }
    ctx.globalAlpha=1; ctx.restore();
  }
  clear() { this.particles=[]; }
}

// ─── CHARACTERS ─────────────────────────────────────────────────────────────
const CHARACTERS = [
  { id:'void_reaper',name:'VOID REAPER',bodyColor:'#1a0033',glowColor:'#00ffff',auraColor:'#00ffff',accentColor:'#8800ff',special1Name:'VOID TENDRIL',special2Name:'DARK PULSE',ultimateName:'VOID COLLAPSE',hitColor:'#00ffff',pillarColor:'#8800ff' },
  { id:'zero_phantom',name:'ZERO PHANTOM',bodyColor:'#e8f4ff',glowColor:'#4488ff',auraColor:'#88ccff',accentColor:'#ffffff',special1Name:'ICE DRAGON',special2Name:'FROST WAVE',ultimateName:'PHANTOM SURGE',hitColor:'#88ccff',pillarColor:'#4488ff' },
  { id:'ember_void',name:'EMBER VOID',bodyColor:'#330000',glowColor:'#ff4400',auraColor:'#ff6600',accentColor:'#ff0000',special1Name:'FLAME BURST',special2Name:'VOID EMBER',ultimateName:'VOID INFERNO',hitColor:'#ff4400',pillarColor:'#ff6600' },
];

// ─── FIGHTER ────────────────────────────────────────────────────────────────
class Fighter {
  constructor(char,x,y,facing,groundY,stageW,particles,audio,playerIndex) {
    this.char=char; this.x=x; this.y=y; this.facing=facing;
    this.groundY=groundY; this.stageW=stageW; this.particles=particles; this.audio=audio;
    this.playerIndex=playerIndex;
    this.vx=0; this.vy=0; this.hp=100; this.maxHp=100;
    this.specialMeter=0; this.maxSpecial=100;
    this.state='idle'; this.stateTimer=0; this.isGrounded=false; this.isBlocking=false;
    this.hitboxActive=false; this.invincible=0;
    this.comboCount=0; this.comboTimer=0; this.auraPhase=0;
    this.deathTimer=0; this.pillarEffects=[]; this.limbPhase=0; this.glitchTimer=0;
  }
  get hitbox() { return {x:this.x-20,y:this.y-80,w:40,h:80}; }
  get attackHitbox() {
    if(!this.hitboxActive) return null;
    const dir=this.facing;
    const heavy=['attack3','special1','special2','ultimate'].includes(this.state);
    const reach=heavy?70:55;
    return {x:this.x+dir*10,y:this.y-55,w:dir*reach,h:30};
  }
  get isDead() { return this.state==='dead'; }
  update(opponent) {
    this.auraPhase+=0.08; this.limbPhase+=0.12; this.stateTimer++;
    if(this.comboTimer>0) this.comboTimer--; else if(this.comboCount>0) this.comboCount=0;
    if(this.invincible>0) this.invincible--;
    if(this.glitchTimer>0) this.glitchTimer--;
    if(this.state!=='dead'&&Math.random()<0.3) this.particles.spawnAura(this.x,this.y-40,this.char.auraColor);
    for(let i=this.pillarEffects.length-1;i>=0;i--){this.pillarEffects[i].life--; if(this.pillarEffects[i].life<=0) this.pillarEffects.splice(i,1);}
    if(this.state==='dead'){this.deathTimer++;this.vx*=0.9;this.vy*=0.9;return;}
    this.vy+=0.6; this.x+=this.vx; this.y+=this.vy;
    if(this.y>=this.groundY){this.y=this.groundY;this.vy=0;this.isGrounded=true;}else{this.isGrounded=false;}
    this.x=Math.max(30,Math.min(this.stageW-30,this.x));
    if(this.isGrounded) this.vx*=0.75; else this.vx*=0.92;
    this._updateState(); this._updateHitbox();
  }
  _updateState() {
    const st=this.state,t=this.stateTimer;
    if(st==='attack1'&&t>14) this.setState('idle');
    else if(st==='attack2'&&t>16) this.setState('idle');
    else if(st==='attack3'&&t>20) this.setState('idle');
    else if(st==='special1'&&t>35) this.setState('idle');
    else if(st==='special2'&&t>40) this.setState('idle');
    else if(st==='ultimate'&&t>80) this.setState('idle');
    else if(st==='hurt'&&t>18) this.setState('idle');
    else if(st==='jump'&&this.isGrounded&&t>5) this.setState('idle');
  }
  _updateHitbox() {
    const t=this.stateTimer;
    if(this.state==='attack1') this.hitboxActive=t>=4&&t<=10;
    else if(this.state==='attack2') this.hitboxActive=t>=5&&t<=12;
    else if(this.state==='attack3') this.hitboxActive=t>=6&&t<=15;
    else if(this.state==='special1') this.hitboxActive=t>=8&&t<=25;
    else if(this.state==='special2') this.hitboxActive=t>=10&&t<=30;
    else if(this.state==='ultimate') this.hitboxActive=t>=15&&t<=60;
    else this.hitboxActive=false;
  }
  setState(s) { this.state=s; this.stateTimer=0; }
  doAttack(type) {
    const busy=['attack1','attack2','attack3','special1','special2','ultimate','hurt','dead','block'].includes(this.state);
    if(busy) return;
    if(type==='attack'){
      if(this.comboTimer>0&&this.comboCount===1) this.setState('attack2');
      else if(this.comboTimer>0&&this.comboCount===2) this.setState('attack3');
      else{this.setState('attack1'); this.comboCount=0;}
      this.comboCount++; this.comboTimer=25; this.audio.playHit(false);
    } else if(type==='special1'&&this.specialMeter>=30){
      this.setState('special1'); this.specialMeter=Math.max(0,this.specialMeter-30);
      this.audio.playSpecial(); this._triggerSp1();
    } else if(type==='special2'&&this.specialMeter>=40){
      this.setState('special2'); this.specialMeter=Math.max(0,this.specialMeter-40);
      this.audio.playSpecial(); this._triggerSp2();
    } else if(type==='ultimate'&&this.specialMeter>=100){
      this.setState('ultimate'); this.specialMeter=0;
      this.audio.playUltimate(); this._triggerUlt();
    }
  }
  _triggerSp1() {
    this.particles.spawnSpecial(this.x+this.facing*60,this.y-40,this.char.glowColor,this.char.accentColor);
    this.pillarEffects.push({x:this.x+this.facing*80,y:this.groundY,h:120,life:40,maxLife:40,color:this.char.pillarColor});
  }
  _triggerSp2() {
    for(let i=0;i<2;i++){
      this.particles.spawnVoidBurst(this.x+this.facing*(60+i*40),this.y-40);
      this.pillarEffects.push({x:this.x+this.facing*(60+i*50),y:this.groundY,h:90+i*30,life:45,maxLife:45,color:this.char.accentColor});
    }
  }
  _triggerUlt() {
    for(let i=0;i<5;i++){
      setTimeout(()=>{
        const px=this.x+this.facing*(40+i*55);
        this.particles.spawnVoidBurst(px,this.groundY-60);
        this.pillarEffects.push({x:px,y:this.groundY,h:150+i*20,life:60,maxLife:60,color:this.char.pillarColor});
      },i*80);
    }
    this.glitchTimer=60;
  }
  doJump() {
    if(this.isGrounded&&!['dead','hurt','special1','special2','ultimate'].includes(this.state)){
      this.vy=-15; this.setState('jump'); this.audio.playJump();
    }
  }
  move(dx) {
    if(['dead','hurt','attack1','attack2','attack3','special1','special2','ultimate','block'].includes(this.state)) return;
    if(dx!==0){this.vx+=dx*2.8; if(this.isGrounded) this.setState('walk');}
    else{if(this.state==='walk') this.setState('idle');}
  }
  crouch(c) {
    if(c&&this.isGrounded&&!['dead','hurt','attack1','attack2','attack3','special1','special2','ultimate'].includes(this.state)) this.setState('crouch');
    else if(!c&&this.state==='crouch') this.setState('idle');
  }
  block(b) {
    if(b&&this.isGrounded&&!['dead','hurt','attack1','attack2','attack3','special1','special2','ultimate'].includes(this.state)){this.isBlocking=true;this.setState('block');}
    else if(!b){this.isBlocking=false; if(this.state==='block') this.setState('idle');}
  }
  receiveHit(damage,direction,isHeavy) {
    if(this.invincible>0||this.state==='dead') return;
    if(this.isBlocking){damage=Math.floor(damage*0.15); this.audio.playBlock(); this.particles.spawnHitSparks(this.x,this.y-40,6,'#8888ff');}
    else{this.audio.playHit(isHeavy); this.particles.spawnHitSparks(this.x,this.y-40,isHeavy?18:10,this.char.hitColor);}
    this.hp=Math.max(0,this.hp-damage); this.specialMeter=Math.min(this.maxSpecial,this.specialMeter+8);
    if(!this.isBlocking){this.vx=direction*(isHeavy?8:4); this.vy=isHeavy?-6:-3; this.setState('hurt'); this.invincible=20;}
    if(this.hp<=0) this.die();
  }
  die() { this.setState('dead'); this.vx=this.facing*-4; this.vy=-8; this.particles.spawnDeathExplosion(this.x,this.y-40); }
  faceOpponent(opp) { if(!['dead','hurt','special1','special2','ultimate'].includes(this.state)) this.facing=opp.x>this.x?1:-1; }
  draw(ctx) {
    if(this.state==='dead'&&this.deathTimer>30){this._drawDeath(ctx);return;}
    ctx.save();
    if(this.invincible>0&&Math.floor(this.invincible/3)%2===0){ctx.restore();return;}
    ctx.translate(this.x,this.y);
    if(this.glitchTimer>0&&Math.random()<0.3) ctx.translate((Math.random()-0.5)*8,(Math.random()-0.5)*4);
    ctx.scale(this.facing,1);
    this._drawPillars(ctx);
    this._drawAura(ctx);
    this._drawStickman(ctx);
    ctx.restore();
  }
  _drawAura(ctx) {
    const pulse=0.5+0.5*Math.sin(this.auraPhase), isUlt=this.state==='ultimate';
    const size=isUlt?60+pulse*30:30+pulse*15;
    const aGrad=ctx.createRadialGradient(0,-40,0,0,-40,size);
    const r=parseInt(this.char.glowColor.slice(1,3),16), g=parseInt(this.char.glowColor.slice(3,5),16), b=parseInt(this.char.glowColor.slice(5,7),16);
    aGrad.addColorStop(0,`rgba(${r},${g},${b},${isUlt?0.4:0.2})`); aGrad.addColorStop(1,'transparent');
    ctx.fillStyle=aGrad;
    ctx.beginPath(); ctx.ellipse(0,-40,size,size*1.2,0,0,Math.PI*2); ctx.fill();
  }
  _drawStickman(ctx) {
    const {glowColor,bodyColor}=this.char, lw=3.5;
    ctx.strokeStyle=glowColor; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.shadowBlur=12; ctx.shadowColor=glowColor;
    const bob=this.isGrounded?Math.sin(this.limbPhase*0.5)*2:0;
    const cr=this.state==='crouch'?15:0, hurt=this.state==='hurt';
    const hy=-78+bob-cr;
    ctx.fillStyle=bodyColor; ctx.beginPath(); ctx.arc(0,hy,10,0,Math.PI*2); ctx.fill(); ctx.stroke();
    const ny=hy+10, ty=this.state==='crouch'?ny+20:ny+28;
    ctx.beginPath(); ctx.moveTo(0,ny); ctx.lineTo(hurt?4:0,ty); ctx.stroke();
    const lp=this.isGrounded?this.limbPhase:0;
    const ls=this.state==='walk'?Math.sin(lp)*18:0, rs=this.state==='walk'?Math.sin(lp+Math.PI)*18:0;
    const lk=this.state==='crouch'?25:18, lf=this.state==='crouch'?5:0;
    ctx.beginPath(); ctx.moveTo(0,ty); ctx.lineTo(-8+ls*0.3,ty+lk); ctx.lineTo(-10+ls,ty+lk+lf+20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,ty); ctx.lineTo(8+rs*0.3,ty+lk); ctx.lineTo(10+rs,ty+lk+lf+20); ctx.stroke();
    this._drawArms(ctx,ty,ny);
    ctx.fillStyle=glowColor; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(-4,hy-2,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(4,hy-2,2,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  }
  _drawArms(ctx,ty,ny) {
    const t=this.stateTimer;
    let lx=-35,ly=ty+10,rx=35,ry=ty+10;
    if(this.state==='attack1'){const e=Math.min(t/7,1);rx=20+e*40;ry=ty-10;}
    else if(this.state==='attack2'){const e=Math.min(t/8,1);rx=25+e*45;ry=ty-20;}
    else if(this.state==='attack3'){const e=Math.min(t/10,1);rx=15+e*55;ry=ty-30;lx=-30+e*20;ly=ty-15;}
    else if(this.state==='special1'||this.state==='special2'){const e=Math.min(t/15,1);rx=20+e*60;ry=ty-35;lx=-40;ly=ty-25;}
    else if(this.state==='ultimate'){const e=Math.min(t/20,1);rx=-20+e*80;ry=-20-e*30;lx=-20-e*80;ly=-20-e*30;}
    else if(this.state==='block'){rx=15;ry=ty-35;lx=5;ly=ty-35;}
    else if(this.state==='jump'){rx=30;ry=ty-20;lx=-30;ly=ty-20;}
    else if(this.state==='hurt'){rx=-25;ry=ty-15;lx=25;ly=ty-15;}
    else if(this.state==='walk'){const a=Math.sin(this.limbPhase+Math.PI)*15;rx=30+a;ry=ty+15;lx=-30-a;ly=ty+15;}
    ctx.beginPath(); ctx.moveTo(0,ny+8); ctx.lineTo(-22,ty-6); ctx.lineTo(lx,ly); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,ny+8); ctx.lineTo(22,ty-6); ctx.lineTo(rx,ry); ctx.stroke();
    if(['attack1','attack2','attack3','special1','special2','ultimate'].includes(this.state)&&Math.random()<0.6){
      this.particles.spawnTrail(this.x+rx*this.facing,this.y+ry,this.char.glowColor);
    }
  }
  _drawPillars(ctx) {
    for(const p of this.pillarEffects){
      const alpha=p.life/p.maxLife, px=p.x-this.x, py=p.y-this.y;
      ctx.save(); ctx.globalAlpha=alpha;
      const g=ctx.createLinearGradient(px,py-p.h,px,py);
      g.addColorStop(0,'transparent'); g.addColorStop(0.3,p.color); g.addColorStop(0.7,p.color); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.shadowBlur=20; ctx.shadowColor=p.color;
      const w=18+Math.sin(Date.now()*0.01)*4;
      ctx.fillRect(px-w/2,py-p.h,w,p.h); ctx.shadowBlur=0; ctx.restore();
    }
  }
  _drawDeath(ctx) {
    const prog=Math.min((this.deathTimer-30)/40,1); if(prog>=1) return;
    ctx.save(); ctx.translate(this.x,this.y); ctx.globalAlpha=1-prog;
    ctx.strokeStyle=this.char.glowColor; ctx.lineWidth=2; ctx.shadowBlur=15; ctx.shadowColor=this.char.glowColor;
    for(let i=0;i<6;i++){
      const off=prog*(i%2===0?20:-20);
      ctx.save(); ctx.translate((Math.random()-0.5)*prog*25,(Math.random()-0.5)*prog*15);
      ctx.rotate((Math.random()-0.5)*prog*0.5);
      ctx.beginPath(); ctx.moveTo(0,-60+off*i); ctx.lineTo(0,-40+off*i); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  drawPortrait(ctx,cx,cy,size) {
    ctx.save(); ctx.translate(cx,cy);
    ctx.beginPath(); ctx.arc(0,0,size,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fill();
    ctx.strokeStyle=this.char.glowColor; ctx.lineWidth=2; ctx.shadowBlur=8; ctx.shadowColor=this.char.glowColor; ctx.stroke(); ctx.shadowBlur=0;
    ctx.strokeStyle=this.char.glowColor; ctx.lineWidth=2; ctx.lineCap='round';
    const s=size*0.45;
    ctx.beginPath(); ctx.arc(0,-s*0.9,s*0.25,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-s*0.6); ctx.lineTo(0,s*0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-s*0.3); ctx.lineTo(-s*0.5,s*0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-s*0.3); ctx.lineTo(s*0.5,s*0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,s*0.3); ctx.lineTo(-s*0.35,s*0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,s*0.3); ctx.lineTo(s*0.35,s*0.9); ctx.stroke();
    ctx.restore();
  }
}

// ─── STAGE ──────────────────────────────────────────────────────────────────
class Stage {
  constructor(w,h) {
    this.w=w; this.h=h; this.time=0; this.shards=[]; this.wormholes=[]; this.stars=[];
    const sc=['#4400aa','#220066','#006666','#440066'];
    for(let i=0;i<20;i++) this.shards.push({x:Math.random()*w,y:Math.random()*(h*0.7),vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.3,size:6+Math.random()*20,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-0.5)*0.02,color:sc[Math.floor(Math.random()*4)]});
    for(let i=0;i<3;i++) this.wormholes.push({x:(i+1)*(w/4),y:h*0.3+(Math.random()-0.5)*80,radius:40+Math.random()*60,phase:Math.random()*Math.PI*2,speed:0.01+Math.random()*0.02});
    for(let i=0;i<80;i++) this.stars.push({x:Math.random()*w,y:Math.random()*h*0.85,brightness:0.3+Math.random()*0.7,speed:0.1+Math.random()*0.5});
  }
  update() {
    this.time++;
    for(const s of this.shards){s.x+=s.vx;s.y+=s.vy;s.rot+=s.rotSpeed;if(s.x<-50)s.x=this.w+50;if(s.x>this.w+50)s.x=-50;if(s.y<-50)s.y=this.h*0.7+50;if(s.y>this.h*0.7+50)s.y=-50;}
    for(const w of this.wormholes) w.phase+=w.speed;
  }
  draw(ctx,sx=0,sy=0) {
    ctx.save(); ctx.translate(sx,sy);
    const bg=ctx.createLinearGradient(0,0,0,this.h);
    bg.addColorStop(0,'#050010'); bg.addColorStop(0.4,'#0a0022'); bg.addColorStop(0.7,'#060015'); bg.addColorStop(1,'#020008');
    ctx.fillStyle=bg; ctx.fillRect(0,0,this.w,this.h);
    const t=this.time*0.003;
    for(let i=0;i<3;i++){
      const nx=this.w*(0.2+i*0.3)+Math.sin(t+i)*30,ny=this.h*0.3;
      const gr=ctx.createRadialGradient(nx,ny,0,nx,ny,200);
      gr.addColorStop(0,`rgba(${i===1?'0,60,80':'50,0,80'},0.25)`); gr.addColorStop(1,'transparent');
      ctx.fillStyle=gr; ctx.beginPath(); ctx.ellipse(nx,ny,220,120,Math.sin(t*0.5+i),0,Math.PI*2); ctx.fill();
    }
    for(const s of this.stars){
      const tw=0.5+0.5*Math.sin(this.time*s.speed+s.x);
      ctx.globalAlpha=s.brightness*tw; ctx.fillStyle='#ffffff'; ctx.fillRect(s.x,s.y,1.5,1.5);
    }
    ctx.globalAlpha=1;
    for(const w of this.wormholes) this._drawWormhole(ctx,w.x,w.y,w.radius,w.phase);
    for(const s of this.shards){
      ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot);
      ctx.globalAlpha=0.4+0.2*Math.sin(this.time*0.02+s.x);
      ctx.fillStyle=s.color; ctx.shadowBlur=8; ctx.shadowColor='#8800ff';
      ctx.beginPath(); ctx.moveTo(0,-s.size); ctx.lineTo(s.size*0.5,s.size*0.5); ctx.lineTo(-s.size*0.5,s.size*0.5); ctx.closePath(); ctx.fill();
      ctx.shadowBlur=0; ctx.restore();
    }
    ctx.globalAlpha=1;
    this._drawGround(ctx);
    this._drawScanlines(ctx);
    ctx.restore();
  }
  _drawWormhole(ctx,x,y,radius,phase) {
    for(let i=8;i>=0;i--){
      ctx.beginPath(); ctx.arc(x,y,radius*(i/8),0,Math.PI*2);
      ctx.strokeStyle=`hsla(${(240+phase*50+i*20)%360},100%,60%,${0.05+(i/8)*0.12})`; ctx.lineWidth=2; ctx.stroke();
    }
    for(let i=0;i<6;i++){
      const a=phase*2+(i/6)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*radius*0.6,y+Math.sin(a)*radius*0.6);
      ctx.lineTo(x+Math.cos(a+0.4)*radius*0.9,y+Math.sin(a+0.4)*radius*0.9);
      ctx.strokeStyle='rgba(0,255,255,0.4)'; ctx.lineWidth=1.5; ctx.shadowBlur=6; ctx.shadowColor='#00ffff'; ctx.stroke(); ctx.shadowBlur=0;
    }
    const glow=ctx.createRadialGradient(x,y,0,x,y,radius*0.4);
    glow.addColorStop(0,'rgba(100,0,200,0.3)'); glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x,y,radius*0.4,0,Math.PI*2); ctx.fill();
  }
  _drawGround(ctx) {
    const gy=this.h-80;
    ctx.shadowBlur=20; ctx.shadowColor='#8800ff';
    const gg=ctx.createLinearGradient(0,gy,0,this.h);
    gg.addColorStop(0,'#1a0044'); gg.addColorStop(0.3,'#0d0022'); gg.addColorStop(1,'#050010');
    ctx.fillStyle=gg; ctx.fillRect(0,gy,this.w,80);
    ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(this.w,gy);
    ctx.strokeStyle='#8800ff'; ctx.lineWidth=2; ctx.shadowBlur=15; ctx.shadowColor='#8800ff'; ctx.stroke();
    ctx.shadowBlur=5; ctx.shadowColor='#440088'; ctx.strokeStyle='rgba(136,0,255,0.2)'; ctx.lineWidth=1;
    for(let x=0;x<this.w;x+=60){ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x+30,this.h);ctx.stroke();}
    ctx.shadowBlur=0;
  }
  _drawScanlines(ctx) {
    ctx.save(); ctx.globalAlpha=0.04; ctx.fillStyle='#000';
    for(let y=0;y<this.h;y+=3) ctx.fillRect(0,y,this.w,1);
    ctx.globalAlpha=0.35;
    const v=ctx.createRadialGradient(this.w/2,this.h/2,this.h*0.3,this.w/2,this.h/2,this.h*0.9);
    v.addColorStop(0,'transparent'); v.addColorStop(1,'rgba(0,0,0,0.8)');
    ctx.fillStyle=v; ctx.fillRect(0,0,this.w,this.h); ctx.restore();
  }
  get groundY() { return this.h-80; }
}

// ─── INPUT MANAGER ──────────────────────────────────────────────────────────
class InputManager {
  constructor() {
    this.p1={left:false,right:false,up:false,down:false,attack:false,special1:false,special2:false,block:false,attackPressed:false,special1Pressed:false,special2Pressed:false};
    this.p2={...this.p1};
    this._p1Prev={...this.p1}; this._p2Prev={...this.p1};
    this._touch=new Map();
    const km={'ArrowLeft':['left',2],'ArrowRight':['right',2],'ArrowUp':['up',2],'ArrowDown':['down',2],
      'Numpad1':['attack',2],'Numpad2':['special1',2],'Numpad3':['special2',2],'Numpad0':['block',2],
      'KeyA':['left',1],'KeyD':['right',1],'KeyW':['up',1],'KeyS':['down',1],
      'KeyZ':['attack',1],'KeyX':['special1',1],'KeyC':['special2',1],'KeyQ':['block',1]};
    window.addEventListener('keydown',e=>{
      const m=km[e.code]; if(m){const[k,p]=m;(p===1?this.p1:this.p2)[k]=true;e.preventDefault();}
    });
    window.addEventListener('keyup',e=>{
      const m=km[e.code]; if(m){const[k,p]=m;(p===1?this.p1:this.p2)[k]=false;}
    });
  }
  setTouch(id,pressed) { this._touch.set(id,pressed); this._syncTouch(); }
  _syncTouch() {
    ['left','right','up','down','attack','special1','special2','block'].forEach(k=>{this.p1[k]=this._touch.get(k)||false;});
  }
  update() {
    this.p1.attackPressed=this.p1.attack&&!this._p1Prev.attack;
    this.p1.special1Pressed=this.p1.special1&&!this._p1Prev.special1;
    this.p1.special2Pressed=this.p1.special2&&!this._p1Prev.special2;
    this.p2.attackPressed=this.p2.attack&&!this._p2Prev.attack;
    this.p2.special1Pressed=this.p2.special1&&!this._p2Prev.special1;
    this.p2.special2Pressed=this.p2.special2&&!this._p2Prev.special2;
    this._p1Prev={...this.p1}; this._p2Prev={...this.p2};
  }
}

// ─── UI MANAGER ─────────────────────────────────────────────────────────────
class UIManager {
  constructor(w,h) { this.w=w; this.h=h; this.time=0; }
  update() { this.time++; }
  resetTime() { this.time=0; }
  _rr(ctx,x,y,w,h,r) {
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }
  drawHUD(ctx,p1,p2,timer,round,c1,c2) {
    this._drawHP(ctx,p1,20,18,false); this._drawHP(ctx,p2,this.w-226,18,true);
    this._drawPortrait(ctx,p1,20,18,false); this._drawPortrait(ctx,p2,this.w-20,18,true);
    this._drawSP(ctx,p1,20,60); this._drawSP(ctx,p2,this.w-204,60);
    this._drawTimer(ctx,timer,round);
    if(c1>1) this._drawCombo(ctx,c1,80,this.h*0.4,p1.char.glowColor);
    if(c2>1) this._drawCombo(ctx,c2,this.w-80,this.h*0.4,p2.char.glowColor);
    this._drawSkills(ctx,p1,p2);
  }
  _drawHP(ctx,f,x,y,flip) {
    const W=220,H=22,pct=Math.max(0,f.hp/f.maxHp);
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.strokeStyle=f.char.glowColor; ctx.lineWidth=1.5;
    ctx.shadowBlur=8; ctx.shadowColor=f.char.glowColor;
    this._rr(ctx,x,y,W+6,H+6,4); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle='#1a0033'; this._rr(ctx,x+3,y+3,W,H,3); ctx.fill();
    if(pct>0){
      const bw=W*pct, bx=flip?x+3+W*(1-pct):x+3;
      const bg=ctx.createLinearGradient(bx,0,bx+bw,0);
      if(pct>0.5){bg.addColorStop(0,'#ff6600');bg.addColorStop(0.5,'#ff4400');bg.addColorStop(1,'#ffaa00');}
      else if(pct>0.25){bg.addColorStop(0,'#ff3300');bg.addColorStop(1,'#ff6600');}
      else{bg.addColorStop(0,'#cc0000');bg.addColorStop(1,'#ff3300');}
      ctx.fillStyle=bg; this._rr(ctx,bx,y+3,bw,H,3); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.15)'; this._rr(ctx,bx,y+3,bw,H/2,3); ctx.fill();
    }
    ctx.fillStyle='#fff'; ctx.font="bold 11px 'Orbitron',monospace"; ctx.textAlign=flip?'right':'left';
    ctx.fillText(Math.ceil(f.hp).toString(),flip?x+W+3:x+7,y+H-1); ctx.restore();
  }
  _drawPortrait(ctx,f,x,y,right) {
    const size=20,cx=right?x-size-3:x+229+size+3;
    f.drawPortrait(ctx,cx,y+14,size);
    ctx.save(); ctx.fillStyle=f.char.glowColor; ctx.font="bold 9px 'Orbitron',monospace";
    ctx.textAlign=right?'right':'left'; ctx.shadowBlur=6; ctx.shadowColor=f.char.glowColor;
    ctx.fillText(f.char.name,right?x-size*2-8:x+8,y+10); ctx.shadowBlur=0; ctx.restore();
  }
  _drawSP(ctx,f,x,y) {
    const W=200,H=12,pct=f.specialMeter/f.maxSpecial;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.strokeStyle='rgba(136,0,255,0.6)'; ctx.lineWidth=1;
    this._rr(ctx,x,y,W+4,H+4,3); ctx.fill(); ctx.stroke();
    if(pct>0){
      const isUlt=pct>=1;
      const bg=ctx.createLinearGradient(x+2,0,x+2+W*pct,0);
      if(isUlt){const p=0.7+0.3*Math.sin(this.time*0.2);bg.addColorStop(0,`rgba(200,0,255,${p})`);bg.addColorStop(0.5,`rgba(0,255,255,${p})`);bg.addColorStop(1,`rgba(200,0,255,${p})`);}
      else{bg.addColorStop(0,'#6600cc');bg.addColorStop(1,'#00ccff');}
      ctx.fillStyle=bg; this._rr(ctx,x+2,y+2,W*pct,H,2); ctx.fill();
      if(isUlt){ctx.shadowBlur=10;ctx.shadowColor='#00ffff';this._rr(ctx,x+2,y+2,W*pct,H,2);ctx.fill();ctx.shadowBlur=0;}
    }
    ctx.fillStyle='rgba(0,0,0,0.4)';
    for(let i=1;i<4;i++) ctx.fillRect(x+2+(W/4)*i-1,y+2,2,H);
    ctx.fillStyle=pct>=1?'#00ffff':'rgba(170,0,255,0.8)'; ctx.font="bold 8px 'Orbitron',monospace"; ctx.textAlign='left';
    ctx.fillText(pct>=1?'ULTIMATE!':'VOID ENERGY',x+6,y+H-1); ctx.restore();
  }
  _drawTimer(ctx,time,round) {
    const cx=this.w/2,urgent=time<=10,pulse=urgent?0.8+0.2*Math.sin(this.time*0.3):1;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.strokeStyle=urgent?'#ff3300':'#8800ff';
    ctx.lineWidth=2; ctx.shadowBlur=urgent?20:10; ctx.shadowColor=urgent?'#ff3300':'#8800ff';
    this._rr(ctx,cx-40,8,80,38,6); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle=urgent?`rgba(255,${Math.floor(50+100*pulse)},0,1)`:'#ffffff';
    ctx.font=`bold ${Math.floor(22*pulse)}px 'Orbitron',monospace`; ctx.textAlign='center';
    ctx.shadowBlur=urgent?15:8; ctx.shadowColor=urgent?'#ff3300':'#00ffff';
    ctx.fillText(Math.max(0,Math.ceil(time)).toString(),cx,36); ctx.shadowBlur=0;
    ctx.fillStyle='#8800ff'; ctx.font="bold 9px 'Orbitron',monospace"; ctx.fillText(`ROUND ${round}`,cx,18);
    ctx.restore();
  }
  _drawCombo(ctx,count,x,y,color) {
    if(count<2) return;
    ctx.save(); ctx.textAlign='center'; ctx.shadowBlur=15; ctx.shadowColor=color; ctx.fillStyle=color;
    ctx.font=`bold ${Math.min(18+count*2,36)}px 'Orbitron',monospace`; ctx.fillText(`${count} HIT`,x,y);
    ctx.font="bold 11px 'Orbitron',monospace"; ctx.fillText('COMBO',x,y+18); ctx.shadowBlur=0; ctx.restore();
  }
  _drawSkills(ctx,p1,p2) {
    ctx.save(); ctx.font="bold 9px 'Orbitron',monospace";
    ctx.textAlign='left'; ctx.fillStyle='rgba(0,255,255,0.6)';
    ctx.fillText(`[Z] Punch  [X] ${p1.char.special1Name}  [C] ${p1.char.special2Name}`,15,this.h-18);
    ctx.textAlign='right'; ctx.fillText(`${p2.char.special1Name} [Num2]  ${p2.char.special2Name} [Num3]  [Num1] Punch`,this.w-15,this.h-18);
    ctx.restore();
  }
  drawAnnounce(ctx,text,sub='') {
    const alpha=Math.min(1,Math.max(0,1-(this.time-60)/30)); if(alpha<=0) return;
    ctx.save(); ctx.globalAlpha=alpha; ctx.textAlign='center';
    if(Math.random()<0.2) ctx.translate((Math.random()-0.5)*6,0);
    ctx.shadowBlur=30; ctx.shadowColor='#00ffff'; ctx.fillStyle='#ffffff';
    ctx.font="bold 52px 'Orbitron',monospace"; ctx.fillText(text,this.w/2,this.h/2);
    if(sub){ctx.font="bold 24px 'Orbitron',monospace";ctx.fillStyle='#8800ff';ctx.fillText(sub,this.w/2,this.h/2+40);}
    ctx.shadowBlur=0; ctx.restore();
  }
  drawVictory(ctx,winner) {
    ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(0,0,this.w,this.h);
    const cx=this.w/2,cy=this.h/2; ctx.textAlign='center';
    ctx.shadowBlur=40; ctx.shadowColor='#8800ff'; ctx.fillStyle='#8800ff';
    ctx.font="bold 18px 'Orbitron',monospace"; ctx.fillText('ROUND CLEAR',cx,cy-80); ctx.shadowBlur=0;
    const pulse=0.8+0.2*Math.sin(this.time*0.1);
    ctx.shadowBlur=30; ctx.shadowColor=winner?winner.char.glowColor:'#ffffff'; ctx.fillStyle=winner?winner.char.glowColor:'#ffffff';
    ctx.font=`bold ${Math.floor(46*pulse)}px 'Orbitron',monospace`; ctx.fillText(winner?winner.char.name:'DRAW!',cx,cy-20);
    ctx.shadowBlur=15; ctx.fillStyle='#00ffff'; ctx.font="bold 24px 'Orbitron',monospace"; ctx.fillText('WINS!',cx,cy+30); ctx.shadowBlur=0;
    this._btn(ctx,this._rb.cx,this._rb.cy,this._rb.w,this._rb.h,'REMATCH','#8800ff','#00ffff');
    this._btn(ctx,this._mb.cx,this._mb.cy,this._mb.w,this._mb.h,'MENU','#440066','#8800ff');
  }
  _btn(ctx,cx,cy,w,h,label,bg,border) {
    ctx.save(); ctx.fillStyle=bg+'aa'; ctx.strokeStyle=border; ctx.lineWidth=2;
    ctx.shadowBlur=10; ctx.shadowColor=border; this._rr(ctx,cx-w/2,cy-h/2,w,h,6); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle='#fff'; ctx.font="bold 14px 'Orbitron',monospace"; ctx.textAlign='center'; ctx.fillText(label,cx,cy+5); ctx.restore();
  }
  drawVirtualControls(ctx) {
    ctx.save(); ctx.globalAlpha=0.55;
    const R=Math.floor(this.h*0.1),dpx=Math.floor(this.w*0.09),dpy=Math.floor(this.h*0.74);
    const Ra=Math.floor(this.h*0.12),Rs=Math.floor(this.h*0.1),bx=Math.floor(this.w*0.91),by=Math.floor(this.h*0.67);
    this._drawDPad(ctx,dpx,dpy,R);
    this._drawActions(ctx,bx,by,Ra,Rs);
    ctx.restore();
  }
  _drawDPad(ctx,cx,cy,R=28) {
    [{dx:0,dy:-R*1.5,label:'▲'},{dx:0,dy:R*1.5,label:'▼'},{dx:-R*1.5,dy:0,label:'◄'},{dx:R*1.5,dy:0,label:'►'}].forEach(b=>{
      ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.strokeStyle='#8800ff'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx+b.dx,cy+b.dy,R,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#cc88ff'; ctx.font=`bold ${Math.floor(R*0.85)}px monospace`; ctx.textAlign='center'; ctx.fillText(b.label,cx+b.dx,cy+b.dy+R*0.33);
    });
  }
  _drawActions(ctx,cx,cy,Ra=32,Rs=26) {
    [{dx:0,dy:-Rs*2,label:'ATK',color:'#00ffff',r:Ra},{dx:-Ra*1.6,dy:Rs*0.4,label:'SP1',color:'#8800ff',r:Rs},{dx:Ra*1.6,dy:Rs*0.4,label:'SP2',color:'#ff00ff',r:Rs},{dx:0,dy:Rs*2.4,label:'BLK',color:'#0066aa',r:Rs}].forEach(b=>{
      ctx.fillStyle=b.color+'33'; ctx.strokeStyle=b.color; ctx.lineWidth=2;
      ctx.shadowBlur=6; ctx.shadowColor=b.color;
      ctx.beginPath(); ctx.arc(cx+b.dx,cy+b.dy,b.r||Rs,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
      ctx.fillStyle='#fff'; ctx.font=`bold ${Math.floor((b.r||Rs)*0.42)}px 'Orbitron',monospace`; ctx.textAlign='center'; ctx.fillText(b.label,cx+b.dx,cy+b.dy+(b.r||Rs)*0.16);
    });
  }
  getVirtualRegions(w,h) {
    const R=Math.floor(h*0.1),dpx=Math.floor(w*0.09),dpy=Math.floor(h*0.74);
    const Ra=Math.floor(h*0.12),Rs=Math.floor(h*0.1),bx=Math.floor(w*0.91),by=Math.floor(h*0.67);
    return [{id:'up',cx:dpx,cy:dpy-R*1.5,r:R+4},{id:'down',cx:dpx,cy:dpy+R*1.5,r:R+4},{id:'left',cx:dpx-R*1.5,cy:dpy,r:R+4},{id:'right',cx:dpx+R*1.5,cy:dpy,r:R+4},{id:'attack',cx:bx,cy:by-Rs*2,r:Ra+4},{id:'special1',cx:bx-Ra*1.6,cy:by+Rs*0.4,r:Rs+4},{id:'special2',cx:bx+Ra*1.6,cy:by+Rs*0.4,r:Rs+4},{id:'block',cx:bx,cy:by+Rs*2.4,r:Rs+4}];
  }
}

// ─── GAME ENGINE ────────────────────────────────────────────────────────────
class GameEngine {
  constructor(canvas) {
    this.canvas=canvas; this.ctx=canvas.getContext('2d');
    this.particles=new ParticleSystem(); this.audio=new AudioEngine();
    this.ui=new UIManager(canvas.width,canvas.height); this.input=new InputManager();
    this.screen='title'; this.titleTime=0;
    this.p1CharIdx=0; this.p2CharIdx=1; this.difficulty='knight'; this.gameMode='vs_cpu';
    this.stage=null; this.p1=null; this.p2=null;
    this.roundTimer=60; this.roundTimerTick=0;
    this.roundState={p1Wins:0,p2Wins:0,round:1};
    this.hitstopFrames=0; this.shakeX=0; this.shakeY=0; this.shakeDuration=0;
    this.battlePhase='announce'; this.phaseTimer=0;
    this.announceText=''; this.announceSubText=''; this.winner=null;
    this.aiThinkTimer=0; this.aiAction=null;
    this.selectedMode='p1';
    this._rb={cx:0,cy:0,w:160,h:48}; this._mb={cx:0,cy:0,w:160,h:48};
    this.audio.init();
    this._bindTouchAndClick();
  }
  _bindTouchAndClick() {
    const getR=()=>this.ui.getVirtualRegions(this.canvas.width,this.canvas.height);
    const pos=(e,t)=>{return{x:t.clientX,y:t.clientY};};
    const applyTouches=(touches)=>{
      const regions=getR();
      regions.forEach(r=>this.input.setTouch(r.id,false));
      for(const t of Array.from(touches)){const p=pos(null,t);for(const r of regions){if(Math.hypot(p.x-r.cx,p.y-r.cy)<=r.r)this.input.setTouch(r.id,true);}}
    };
    this.canvas.addEventListener('touchstart',e=>{e.preventDefault();this.audio.resume();
      if(this.screen==='battle'){applyTouches(e.touches);}
      else{const t=e.touches[0];if(t){this._handleClick(t.clientX,t.clientY);}}
    },{passive:false});
    this.canvas.addEventListener('touchmove',e=>{e.preventDefault();if(this.screen==='battle')applyTouches(e.touches);},{passive:false});
    this.canvas.addEventListener('touchend',e=>{e.preventDefault();if(this.screen==='battle')applyTouches(e.touches);},{passive:false});
    this.canvas.addEventListener('touchcancel',e=>{e.preventDefault();if(this.screen==='battle')applyTouches(e.touches);},{passive:false});
    this.canvas.addEventListener('click',e=>{
      this._handleClick(e.clientX,e.clientY);
      this.audio.resume();
    });
  }
  _handleClick(mx,my) {
    const cx=this.canvas.width/2,cy=this.canvas.height/2;
    if(this.screen==='title'){
      const w=this.canvas.width,h=this.canvas.height;
      const bw5=Math.min(240,w*0.38),bh5=h*0.11;
      if(mx>cx-bw5/2&&mx<cx+bw5/2&&my>h*0.62-bh5/2&&my<h*0.62+bh5/2){this.gameMode='vs_cpu';this._goCharSelect();return;}
      if(mx>cx-bw5/2&&mx<cx+bw5/2&&my>h*0.75-bh5/2&&my<h*0.75+bh5/2){this.gameMode='2player';this._goCharSelect();return;}
      ['initiate','knight','god'].forEach((d,i)=>{
        const bx=cx+(i-1)*w*0.22,dw=w*0.18,dh=h*0.08;
        if(mx>bx-dw/2&&mx<bx+dw/2&&my>h*0.87&&my<h*0.87+dh) this.difficulty=d;
      });
    } else if(this.screen==='charSelect'){
      const cardW=160,startX=cx-((CHARACTERS.length*(cardW+20))/2)+cardW/2;
      CHARACTERS.forEach((c,i)=>{
        const cardX=startX+i*(cardW+20),cardY=cy-80;
        if(mx>cardX-cardW/2&&mx<cardX+cardW/2&&my>cardY-110&&my<cardY+110){
          if(this.selectedMode==='p1'){this.p1CharIdx=i;this.selectedMode='p2';}
          else{this.p2CharIdx=i;this.selectedMode='p1';}
        }
      });
      if(mx>cx-80&&mx<cx+80&&my>cy+150&&my<cy+194) this._startBattle();
      ['initiate','knight','god'].forEach((d,i)=>{const bx=cx-120+i*120;if(mx>bx-50&&mx<bx+50&&my>cy+133&&my<cy+155)this.difficulty=d;});
    } else if(this.screen==='victory'){
      const cy2=this.canvas.height/2;
      if(mx>this._rb.cx-80&&mx<this._rb.cx+80&&my>this._rb.cy-24&&my<this._rb.cy+24)this._startBattle();
      if(mx>this._mb.cx-80&&mx<this._mb.cx+80&&my>this._mb.cy-24&&my<this._mb.cy+24)this._goTitle();
    }
  }
  _goTitle(){this.screen='title';this.titleTime=0;this.audio.stopBGM();this.p1=null;this.p2=null;this.particles.clear();this.roundState={p1Wins:0,p2Wins:0,round:1};}
  _goCharSelect(){this.screen='charSelect';this.selectedMode='p1';}
  _startBattle(){
    const w=this.canvas.width,h=this.canvas.height;
    this.stage=new Stage(w,h); const gy=h-80;
    const c1=CHARACTERS[this.p1CharIdx],c2=CHARACTERS[this.p2CharIdx];
    this.p1=new Fighter(c1,w*0.25,gy,1,gy,w,this.particles,this.audio,1);
    this.p2=new Fighter(c2,w*0.75,gy,-1,gy,w,this.particles,this.audio,2);
    this.roundTimer=60; this.roundTimerTick=0; this.hitstopFrames=0;
    this.shakeX=0;this.shakeY=0;this.shakeDuration=0;
    this.battlePhase='announce'; this.phaseTimer=0; this.winner=null;
    this.ui=new UIManager(w,h); this.ui.resetTime();
    this.announceText=`ROUND ${this.roundState.round}`;
    this.announceSubText=['VOID INITIATE','VOID KNIGHT','VOID GOD'][['initiate','knight','god'].indexOf(this.difficulty)];
    this.screen='battle'; this.audio.startBGM();
  }
  start(){this._animId=0;this._lastTime=0;this._loop(0);}
  stop(){cancelAnimationFrame(this._animId);this.audio.stopBGM();}
  _loop(ts){
    this._lastTime=this._lastTime||ts;
    this._update(); this._render();
    this._animId=requestAnimationFrame(t=>this._loop(t));
  }
  _update(){
    this.input.update(); this.titleTime++;
    if(this.screen==='battle'&&this.p1&&this.p2&&this.stage) this._updateBattle();
    this.particles.update(); this.ui.update();
    if(this.shakeDuration>0){this.shakeDuration--;const m=Math.max(1,this.shakeDuration*0.8);this.shakeX=(Math.random()-0.5)*m;this.shakeY=(Math.random()-0.5)*m;}
    else{this.shakeX=0;this.shakeY=0;}
  }
  _updateBattle(){
    const p1=this.p1,p2=this.p2; this.stage.update(); this.phaseTimer++;
    if(this.battlePhase==='announce'){if(this.phaseTimer>90){this.battlePhase='fighting';this.phaseTimer=0;}return;}
    if(this.battlePhase==='roundEnd'){if(this.phaseTimer>180)this._checkMatchEnd();return;}
    if(this.hitstopFrames>0){this.hitstopFrames--;return;}
    this.roundTimerTick++; if(this.roundTimerTick>=60){this.roundTimerTick=0;this.roundTimer=Math.max(0,this.roundTimer-1);}
    const i1=this.input.p1;
    p1.faceOpponent(p2);
    if(i1.left) p1.move(-1); else if(i1.right) p1.move(1); else p1.move(0);
    if(i1.up) p1.doJump(); p1.crouch(i1.down); p1.block(i1.block);
    if(i1.attackPressed) p1.doAttack('attack');
    if(i1.special1Pressed) p1.doAttack('special1');
    if(i1.special2Pressed) p1.doAttack('special2');
    if(i1.special1&&i1.special2&&p1.specialMeter>=100) p1.doAttack('ultimate');
    if(this.gameMode==='2player'){
      const i2=this.input.p2; p2.faceOpponent(p1);
      if(i2.left) p2.move(-1); else if(i2.right) p2.move(1); else p2.move(0);
      if(i2.up) p2.doJump(); p2.crouch(i2.down); p2.block(i2.block);
      if(i2.attackPressed) p2.doAttack('attack');
      if(i2.special1Pressed) p2.doAttack('special1');
      if(i2.special2Pressed) p2.doAttack('special2');
    } else { this._updateAI(p2,p1); }
    p1.update(p2); p2.update(p1);
    this._checkHits(p1,p2); this._checkHits(p2,p1);
    const dist=Math.abs(p1.x-p2.x); if(dist<50){const push=(50-dist)/2;p1.x+=p1.x<p2.x?-push:push;p2.x+=p2.x<p1.x?-push:push;}
    p1.specialMeter=Math.min(p1.maxSpecial,p1.specialMeter+0.02);
    p2.specialMeter=Math.min(p2.maxSpecial,p2.specialMeter+0.02);
    if(p1.isDead||p2.isDead||this.roundTimer<=0) this._endRound();
  }
  _checkHits(a,d){
    const ab=a.attackHitbox; if(!ab) return;
    const db=d.hitbox,heavy=['attack3','special1','special2','ultimate'].includes(a.state);
    const dmg=heavy?(a.state==='ultimate'?18:12):7,dir=a.x<d.x?1:-1;
    const ax=Math.min(ab.x,ab.x+ab.w),aw=Math.abs(ab.w);
    if(ax<db.x+db.w&&ax+aw>db.x&&ab.y<db.y+db.h&&ab.y+ab.h>db.y){
      d.receiveHit(dmg,dir,heavy); a.specialMeter=Math.min(a.maxSpecial,a.specialMeter+12);
      if(heavy){this.hitstopFrames=a.state==='ultimate'?8:5;this.shakeDuration=Math.max(this.shakeDuration,heavy?18:10);}
    }
  }
  _endRound(){
    if(this.battlePhase==='roundEnd') return;
    this.battlePhase='roundEnd'; this.phaseTimer=0;
    const p1=this.p1,p2=this.p2;
    if(p1.hp>p2.hp||(p2.isDead&&!p1.isDead)){this.winner=p1;this.roundState.p1Wins++;}
    else if(p2.hp>p1.hp||(p1.isDead&&!p2.isDead)){this.winner=p2;this.roundState.p2Wins++;}
    else this.winner=null;
    this.audio.playVictory(); this.particles.spawnVoidBurst(this.canvas.width/2,this.canvas.height/2,40);
  }
  _checkMatchEnd(){
    const{p1Wins,p2Wins}=this.roundState;
    if(p1Wins>=2||p2Wins>=2){this.screen='victory';this.ui.resetTime();const cx=this.canvas.width/2,cy=this.canvas.height/2;this._rb={cx:cx-100,cy:cy+100,w:160,h:48};this._mb={cx:cx+100,cy:cy+100,w:160,h:48};}
    else{this.roundState.round++;this._startBattle();}
  }
  _updateAI(ai,player){
    const thinkSpeed=this.difficulty==='god'?8:this.difficulty==='knight'?20:40;
    const aggr=this.difficulty==='god'?0.85:this.difficulty==='knight'?0.6:0.35;
    ai.faceOpponent(player); this.aiThinkTimer++;
    if(this.aiThinkTimer<thinkSpeed){this._execAI(ai,player);return;}
    this.aiThinkTimer=0;
    const dist=Math.abs(ai.x-player.x),rand=Math.random();
    if(dist>200) this.aiAction={type:'approach',dur:thinkSpeed*2};
    else if(dist<50){
      if(rand<aggr){
        if(ai.specialMeter>=100) this.aiAction={type:'ultimate',dur:5};
        else if(ai.specialMeter>=40&&rand<aggr*0.5) this.aiAction={type:'special2',dur:5};
        else if(ai.specialMeter>=30&&rand<aggr*0.4) this.aiAction={type:'special1',dur:5};
        else this.aiAction={type:'combo',dur:25};
      } else this.aiAction={type:'retreat',dur:15};
    } else {
      if(rand<aggr) this.aiAction={type:'attack',dur:15};
      else if(rand<aggr+0.2) this.aiAction={type:'jump_attack',dur:25};
      else this.aiAction={type:'block',dur:20};
    }
    this._execAI(ai,player);
  }
  _execAI(ai,player){
    if(!this.aiAction) return;
    const dir=player.x>ai.x?1:-1;
    switch(this.aiAction.type){
      case 'approach': ai.move(dir); break;
      case 'retreat': ai.move(-dir); break;
      case 'attack': ai.move(dir); ai.doAttack('attack'); break;
      case 'combo': ai.doAttack('attack'); break;
      case 'special1': ai.doAttack('special1'); break;
      case 'special2': ai.doAttack('special2'); break;
      case 'ultimate': ai.doAttack('ultimate'); break;
      case 'jump_attack': ai.move(dir); ai.doJump(); ai.doAttack('attack'); break;
      case 'block': ai.block(true); setTimeout(()=>ai.block(false),400); break;
    }
    this.aiAction.dur--; if(this.aiAction.dur<=0) this.aiAction=null;
  }
  _render(){
    const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height;
    ctx.clearRect(0,0,w,h);
    if(this.screen==='title') this._renderTitle(ctx,w,h);
    else if(this.screen==='charSelect') this._renderCharSelect(ctx,w,h);
    else if(this.screen==='battle') this._renderBattle(ctx,w,h);
    else if(this.screen==='victory') this._renderVictory(ctx,w,h);
  }
  _rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
  _renderTitle(ctx,w,h){
    const t=this.titleTime,cx=w/2,cy=h/2;
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#030010');bg.addColorStop(1,'#080020');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    for(let i=10;i>=0;i--){ctx.beginPath();ctx.arc(cx,h*0.38,80+i*25+Math.sin(t*0.02+i)*10,0,Math.PI*2);ctx.strokeStyle=`rgba(${i%2===0?'0,255,255':'136,0,255'},${0.06+(i/10)*0.08})`;ctx.lineWidth=2;ctx.stroke();}
    for(let i=0;i<6;i++){const a=(t*0.01*(i%2===0?1:-1))+(i/6)*Math.PI*2,r=120+i*15;ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,h*0.38+Math.sin(a)*r*0.5,4,0,Math.PI*2);ctx.fillStyle=i%2===0?'#00ffff':'#8800ff';ctx.shadowBlur=8;ctx.shadowColor=ctx.fillStyle;ctx.fill();ctx.shadowBlur=0;}
    ctx.save();ctx.textAlign='center';
    if(Math.random()<0.08)ctx.translate((Math.random()-0.5)*8,0);
    ctx.font="bold 52px 'Orbitron',monospace";ctx.shadowBlur=30;ctx.shadowColor='#00ffff';ctx.fillStyle='#00ffff';ctx.fillText('ZHUU-05',cx,h*0.52);
    ctx.font="bold 72px 'Orbitron',monospace";ctx.shadowColor='#8800ff';ctx.shadowBlur=40;ctx.fillStyle='#ffffff';ctx.fillText('VOID',cx,h*0.62);
    ctx.shadowBlur=0;ctx.restore();
    // Scanlines
    ctx.save();ctx.globalAlpha=0.05;ctx.fillStyle='#000';for(let y=0;y<h;y+=3)ctx.fillRect(0,y,w,1);ctx.restore();
    // Mode select text
    const ps=0.6+0.4*Math.sin(t*0.08);ctx.save();ctx.globalAlpha=ps;ctx.textAlign='center';ctx.font="bold 14px 'Orbitron',monospace";ctx.fillStyle='#8800ff';ctx.shadowBlur=10;ctx.shadowColor='#8800ff';ctx.fillText('— SELECT GAME MODE —',cx,cy+18);ctx.shadowBlur=0;ctx.restore();
    const bw2=Math.min(240,w*0.38),bh2=Math.floor(h*0.11);
    this._menuBtn(ctx,cx,h*0.62,bw2,bh2,'VS CPU','#00ffff','#8800ff');
    this._menuBtn(ctx,cx,h*0.75,bw2,bh2,'2 PLAYER','#8800ff','#00ffff');
    ctx.save();ctx.textAlign='center';ctx.font="10px 'Orbitron',monospace";ctx.fillStyle='rgba(0,255,255,0.5)';ctx.fillText('CPU DIFFICULTY:',cx,cy+155);
    ['INITIATE','KNIGHT','GOD'].forEach((d,i)=>{
      const bx=cx-120+i*120,active=this.difficulty===['initiate','knight','god'][i];
      ctx.fillStyle=active?'#8800ff':'rgba(136,0,255,0.2)';ctx.strokeStyle=active?'#00ffff':'#440088';ctx.lineWidth=active?2:1;
      this._rr(ctx,bx-50,cy+162,100,26,4);ctx.fill();ctx.stroke();
      ctx.fillStyle=active?'#fff':'rgba(255,255,255,0.4)';ctx.font="bold 10px 'Orbitron',monospace";ctx.fillText(d,bx,cy+180);
    });ctx.restore();
    this.particles.draw(ctx);
  }
  _menuBtn(ctx,cx,cy,w,h,label,border,glow){
    ctx.save();const pulse=0.8+0.2*Math.sin(this.titleTime*0.05);
    ctx.fillStyle=`rgba(0,0,0,${0.65*pulse})`;ctx.strokeStyle=border;ctx.lineWidth=2;ctx.shadowBlur=15;ctx.shadowColor=glow;
    this._rr(ctx,cx-w/2,cy-h/2,w,h,8);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font="bold 16px 'Orbitron',monospace";ctx.textAlign='center';ctx.shadowBlur=8;ctx.shadowColor=border;ctx.fillText(label,cx,cy+6);ctx.shadowBlur=0;ctx.restore();
  }
  _renderCharSelect(ctx,w,h){
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#030015');bg.addColorStop(1,'#08001a');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.textAlign='center';ctx.font="bold 28px 'Orbitron',monospace";ctx.fillStyle='#00ffff';ctx.shadowBlur=20;ctx.shadowColor='#00ffff';ctx.fillText('SELECT FIGHTER',w/2,55);ctx.shadowBlur=0;
    const cx=w/2,cy=h/2,cardW=160,cardH=220;
    const startX=cx-((CHARACTERS.length*(cardW+20))/2)+cardW/2;
    ctx.font="bold 11px 'Orbitron',monospace";ctx.fillStyle='rgba(0,255,255,0.7)';
    ctx.fillText(this.selectedMode==='p1'?'← P1 SELECT CHARACTER →':this.selectedMode==='p2'?'← P2 SELECT CHARACTER →':'CLICK TO SELECT',cx,cy-130);
    CHARACTERS.forEach((c,i)=>{
      const cardX=startX+i*(cardW+20),cardY=cy-80,isP1=this.p1CharIdx===i,isP2=this.p2CharIdx===i;
      ctx.fillStyle=isP1||isP2?c.accentColor+'33':'rgba(0,0,0,0.7)';
      ctx.strokeStyle=isP1?c.glowColor:isP2?c.accentColor:'rgba(136,0,255,0.4)';
      ctx.lineWidth=isP1||isP2?3:1.5;ctx.shadowBlur=isP1||isP2?20:5;ctx.shadowColor=isP1?c.glowColor:isP2?c.accentColor:'transparent';
      this._rr(ctx,cardX-cardW/2,cardY-cardH/2,cardW,cardH,10);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      const bx=cardX,by=cardY+10,phase=this.titleTime*0.08+i,bob=Math.sin(phase)*3;
      ctx.save();ctx.strokeStyle=c.glowColor;ctx.lineWidth=3;ctx.lineCap='round';ctx.shadowBlur=12;ctx.shadowColor=c.glowColor;
      ctx.beginPath();ctx.arc(bx,by-45+bob,12,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx,by-30+bob);ctx.lineTo(bx,by+20+bob);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx,by-15+bob);ctx.lineTo(bx-22,by+5+bob);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx,by-15+bob);ctx.lineTo(bx+22,by+5+bob);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx,by+20+bob);ctx.lineTo(bx-14,by+50+bob);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx,by+20+bob);ctx.lineTo(bx+14,by+50+bob);ctx.stroke();
      ctx.fillStyle=c.glowColor;ctx.beginPath();ctx.arc(bx-4,by-48+bob,2.5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(bx+4,by-48+bob,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.restore();
      if(Math.random()<0.15)this.particles.spawnAura(bx+(Math.random()-0.5)*30,by+(Math.random()-0.5)*60,c.auraColor);
      ctx.font="bold 11px 'Orbitron',monospace";ctx.fillStyle=c.glowColor;ctx.shadowBlur=8;ctx.shadowColor=c.glowColor;ctx.fillText(c.name,cardX,cardY+85);ctx.shadowBlur=0;
      ctx.font="9px 'Orbitron',monospace";ctx.fillStyle='rgba(200,200,255,0.7)';ctx.fillText(c.special1Name,cardX,cardY+103);ctx.fillText(c.special2Name,cardX,cardY+116);
      ctx.fillStyle='#ffaa00';ctx.font="bold 9px 'Orbitron',monospace";ctx.fillText('ULT: '+c.ultimateName,cardX,cardY+134);
      if(isP1){ctx.fillStyle=c.glowColor;ctx.font="bold 10px 'Orbitron',monospace";ctx.fillText('P1',cardX-cardW/2+16,cardY-cardH/2+18);}
      if(isP2){ctx.fillStyle=c.accentColor;ctx.font="bold 10px 'Orbitron',monospace";ctx.fillText('P2',cardX+cardW/2-8,cardY-cardH/2+18);}
    });
    ctx.font="bold 24px 'Orbitron',monospace";ctx.fillStyle='#ffffff';ctx.shadowBlur=15;ctx.shadowColor='#ff00ff';ctx.fillText('VS',cx,cy+115);ctx.shadowBlur=0;
    if(this.gameMode==='vs_cpu'){
      ctx.font="bold 10px 'Orbitron',monospace";ctx.fillStyle='rgba(0,255,255,0.6)';ctx.fillText('CPU DIFFICULTY:',cx,cy+130);
      ['INITIATE','KNIGHT','GOD'].forEach((d,i)=>{
        const bx=cx-120+i*120,active=this.difficulty===['initiate','knight','god'][i];
        ctx.fillStyle=active?'#8800ff':'rgba(68,0,136,0.3)';ctx.strokeStyle=active?'#00ffff':'#440088';ctx.lineWidth=active?2:1;
        this._rr(ctx,bx-50,cy+133,100,22,4);ctx.fill();ctx.stroke();
        ctx.fillStyle=active?'#fff':'rgba(255,255,255,0.4)';ctx.fillText(d,bx,cy+149);
      });
    }
    const pulse=0.8+0.2*Math.sin(this.titleTime*0.1);
    ctx.fillStyle=`rgba(136,0,255,${0.6*pulse})`;ctx.strokeStyle='#00ffff';ctx.lineWidth=2;ctx.shadowBlur=15*pulse;ctx.shadowColor='#00ffff';
    this._rr(ctx,cx-80,cy+150,160,44,8);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font="bold 15px 'Orbitron',monospace";ctx.fillText('FIGHT!',cx,cy+177);
    ctx.restore();
    this.particles.draw(ctx);
  }
  _renderBattle(ctx,w,h){
    if(!this.p1||!this.p2||!this.stage) return;
    this.stage.draw(ctx,this.shakeX,this.shakeY);
    this.particles.draw(ctx);
    this.p1.draw(ctx); this.p2.draw(ctx);
    this.ui.drawHUD(ctx,this.p1,this.p2,this.roundTimer,this.roundState.round,this.p1.comboCount,this.p2.comboCount);
    this.ui.drawVirtualControls(ctx);
    if(this.battlePhase==='announce') this.ui.drawAnnounce(ctx,this.announceText,this.announceSubText);
    if(this.battlePhase==='roundEnd') this.ui.drawAnnounce(ctx,this.winner?this.winner.char.name:'DRAW!','WINS THE ROUND!');
    this._drawRoundWins(ctx,w);
  }
  _drawRoundWins(ctx,w){
    for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(260+i*20,30,7,0,Math.PI*2);ctx.fillStyle=i<this.roundState.p1Wins?'#ffaa00':'rgba(80,40,0,0.5)';ctx.strokeStyle='#ff6600';ctx.lineWidth=1.5;ctx.fill();ctx.stroke();}
    for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(w-260-i*20,30,7,0,Math.PI*2);ctx.fillStyle=i<this.roundState.p2Wins?'#ffaa00':'rgba(80,40,0,0.5)';ctx.strokeStyle='#ff6600';ctx.lineWidth=1.5;ctx.fill();ctx.stroke();}
  }
  _renderVictory(ctx,w,h){
    if(this.stage) this.stage.draw(ctx,0,0);
    this.particles.draw(ctx);
    this.ui.drawVictory(ctx,this.winner);
    if(Math.random()<0.3) this.particles.spawnVoidBurst(Math.random()*w,Math.random()*h*0.6,5);
    ctx.save();ctx.globalAlpha=0.04;ctx.fillStyle='#000';for(let y=0;y<h;y+=3)ctx.fillRect(0,y,w,1);ctx.restore();
  }
  resize(w,h){this.canvas.width=w;this.canvas.height=h;if(this.stage)this.stage=new Stage(w,h);this.ui=new UIManager(w,h);}
}

// ─── BOOTSTRAP ──────────────────────────────────────────────────────────────
(function() {
  // Rotate overlay
  (function(){
    var d=document.createElement("div");
    d.id="rov";
    d.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:#020008;z-index:9999;display:none;flex-direction:column;align-items:center;justify-content:center;";
    d.innerHTML='<div id="ri" style="font-size:72px;display:inline-block;">&#128241;</div><div style="color:#00ffff;font-size:20px;font-weight:bold;margin-top:16px;letter-spacing:3px;">ROTATE DEVICE</div><div style="color:#8800ff;font-size:12px;margin-top:8px;letter-spacing:2px;">LANDSCAPE REQUIRED</div>';
    document.body.appendChild(d);
    var a=0;
    setInterval(function(){
      var pt=window.innerHeight>window.innerWidth;
      d.style.display=pt?"flex":"none";
      if(pt){a++;var ic=document.getElementById("ri");if(ic)ic.style.transform="rotate("+(Math.sin(a*0.05)*25-45)+"deg)";}
    },80);
  })();
  const canvas = document.getElementById('gameCanvas');
  function getSize() {
    return {w: window.innerWidth, h: window.innerHeight};
  }
  const{w,h}=getSize(); canvas.width=w; canvas.height=h;
  canvas.style.width=canvas.width+"px";canvas.style.height=canvas.height+"px";
  const engine=new GameEngine(canvas);
  engine.start();
  window.addEventListener('resize',()=>{
    const{w:nw,h:nh}=getSize();
    engine.resize(nw,nh);
    canvas.style.width=canvas.width+"px";canvas.style.height=canvas.height+"px";
  });
})();
