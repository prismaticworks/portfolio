/* ============================================================
   Attack chain  ⟷  detection sweep.
   Crimson agents walk the ATT&CK progression left→right.
   A teal detection sweep runs right→left and intercepts them.
   The whole offence/defence thesis, as one moving picture.
   ============================================================ */
const STAGES = ['RECON','ACCESS','EXECUTION','PERSISTENCE','LATERAL','EXFIL'];

export function initChain(canvas, onIntercept){
  const ctx = canvas.getContext('2d');
  let W=0,H=0,nodes=[],agents=[],sparks=[],sweepX=1,intercepted=0,running=true,t=0;

  function resize(){
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio||1, 2);
    canvas.width = r.width*dpr; canvas.height = r.height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    W = r.width; H = r.height;
    const pad = W*0.09, span = W-pad*2;
    nodes = STAGES.map((s,i)=>({
      x: pad + span*(i/(STAGES.length-1)),
      y: H*0.44 + Math.sin(i*1.7)*H*0.13,
      label: s, hotR:0, hotG:0
    }));
  }
  resize();
  addEventListener('resize', resize);

  function spawn(){
    if(agents.length > 7) return;
    agents.push({ seg:0, p:0, speed:0.0045+Math.random()*0.004, trail:[], dead:false });
  }

  function burst(x,y,color,n){
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, s=Math.random()*2.6+.5;
      sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color});
    }
  }

  function step(){
    t += 0.016;

    // ---- detection sweep travels right → left, then resets
    sweepX -= 0.0034;
    if(sweepX < -0.08){ sweepX = 1.08; }
    const sx = sweepX * W;

    if(Math.random() < 0.032) spawn();

    // ---- advance agents
    agents.forEach(a=>{
      a.p += a.speed;
      if(a.p >= 1){ a.p = 0; a.seg++; }
      if(a.seg >= nodes.length-1){ // reached exfil — defence missed this one
        const n = nodes[nodes.length-1];
        burst(n.x,n.y,'225,29,72',16); n.hotR = 1; a.dead = true; return;
      }
      const n0 = nodes[a.seg], n1 = nodes[a.seg+1];
      a.x = n0.x + (n1.x-n0.x)*a.p;
      a.y = n0.y + (n1.y-n0.y)*a.p;
      a.trail.push({x:a.x,y:a.y}); if(a.trail.length>26) a.trail.shift();
      if(a.p < a.speed*1.5) n0.hotR = 1;

      // ---- interception: sweep line crosses the agent
      if(Math.abs(a.x - sx) < 5){
        burst(a.x,a.y,'61,220,151',20);
        a.dead = true; intercepted++;
        const near = nodes.reduce((b,n)=>Math.abs(n.x-a.x)<Math.abs(b.x-a.x)?n:b,nodes[0]);
        near.hotG = 1;
        onIntercept && onIntercept(intercepted);
      }
    });
    agents = agents.filter(a=>!a.dead);

    sparks.forEach(s=>{ s.x+=s.vx; s.y+=s.vy; s.vx*=.94; s.vy*=.94; s.life-=.025; });
    sparks = sparks.filter(s=>s.life>0);
    nodes.forEach(n=>{ n.hotR*=.955; n.hotG*=.955; });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // faint backdrop grid
    ctx.strokeStyle='rgba(255,255,255,.028)'; ctx.lineWidth=1;
    for(let x=0;x<W;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // links
    ctx.lineWidth=1;
    for(let i=0;i<nodes.length-1;i++){
      const a=nodes[i],b=nodes[i+1];
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.strokeStyle='rgba(255,255,255,.10)';ctx.stroke();
    }

    // detection sweep + trailing glow
    const sx = sweepX*W;
    const g = ctx.createLinearGradient(sx,0,sx+W*0.17,0);
    g.addColorStop(0,'rgba(61,220,151,.16)'); g.addColorStop(1,'rgba(61,220,151,0)');
    ctx.fillStyle=g; ctx.fillRect(sx,0,W*0.17,H);
    ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);
    ctx.strokeStyle='rgba(61,220,151,.75)';ctx.lineWidth=1.4;ctx.stroke();

    // agent trails
    agents.forEach(a=>{
      a.trail.forEach((p,i)=>{
        const al=(i/a.trail.length)*.5;
        ctx.beginPath();ctx.arc(p.x,p.y,1.7,0,7);
        ctx.fillStyle=`rgba(255,63,95,${al})`;ctx.fill();
      });
      if(a.x!=null){
        ctx.beginPath();ctx.arc(a.x,a.y,3.4,0,7);ctx.fillStyle='rgba(255,63,95,1)';ctx.fill();
        ctx.beginPath();ctx.arc(a.x,a.y,9,0,7);ctx.strokeStyle='rgba(225,29,72,.34)';ctx.lineWidth=1;ctx.stroke();
      }
    });

    // nodes
    ctx.font='10px "JetBrains Mono", monospace';
    ctx.textAlign='center';
    nodes.forEach(n=>{
      const heat = Math.max(n.hotR,n.hotG);
      const col  = n.hotG>n.hotR ? '61,220,151' : '225,29,72';
      ctx.save(); ctx.translate(n.x,n.y); ctx.rotate(Math.PI/4);
      const s=7+heat*3.4;
      ctx.strokeStyle=`rgba(${col},${.42+heat*.58})`; ctx.lineWidth=1.4;
      ctx.strokeRect(-s/2,-s/2,s,s);
      if(heat>.05){ ctx.fillStyle=`rgba(${col},${heat*.55})`; ctx.fillRect(-s/2,-s/2,s,s); }
      ctx.restore();
      if(heat>.05){
        ctx.beginPath();ctx.arc(n.x,n.y,13+heat*11,0,7);
        ctx.strokeStyle=`rgba(${col},${heat*.3})`;ctx.lineWidth=1;ctx.stroke();
      }
      ctx.fillStyle=`rgba(255,255,255,${.24+heat*.5})`;
      ctx.fillText(n.label, n.x, n.y+26);
    });

    // sparks
    sparks.forEach(s=>{
      ctx.beginPath();ctx.arc(s.x,s.y,1.8*s.life+.4,0,7);
      ctx.fillStyle=`rgba(${s.color},${s.life})`;ctx.fill();
    });
  }

  function frame(){ if(running){ step(); draw(); } requestAnimationFrame(frame); }
  frame();

  // pause offscreen — no point burning frames nobody sees
  new IntersectionObserver(es=>es.forEach(e=>running=e.isIntersecting),{threshold:0})
    .observe(canvas);
}
