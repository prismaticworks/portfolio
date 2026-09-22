/* ============================================================
   Offensive scan matrix — the red-team counterpart to the radar.
   The radar waits in polar coordinates; this one goes looking,
   raster-scanning a target grid cell by cell and locking onto
   every finding it turns up.
   ============================================================ */
export function initScanner(canvas){
  const ctx = canvas.getContext('2d');
  let W=0,H=0,cols=0,rows=0,cw=0,ch=0,ox=0,oy=0;
  let cells=[],head=0,acc=0,locks=[],running=true;

  function resize(){
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio||1, 2);
    canvas.width = r.width*dpr; canvas.height = r.height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    W=r.width; H=r.height;
    cols = 15; cw = W/(cols+1);
    rows = Math.max(5, Math.round(H/cw)-1); ch = cw;
    ox = (W - cols*cw)/2 + cw/2;
    oy = (H - rows*ch)/2 + ch/2;
    cells = Array.from({length:cols*rows},()=>({p:0,f:0}));
    head = 0; locks = [];
  }
  resize();
  addEventListener('resize', resize);

  function step(){
    acc += 1;
    if(acc >= 2){                       // advance the probe head
      acc = 0;
      const c = cells[head];
      if(c){
        c.p = 1;
        if(Math.random() < 0.055){       // this probe turned something up
          c.f = 1;
          locks.push({ i:head, life:1 });
          if(locks.length > 3) locks.shift();
        }
      }
      head = (head+1) % (cols*rows);
    }
    cells.forEach(c=>{ c.p *= .986; c.f *= .975; });
    locks.forEach(l=> l.life -= .006);
    locks = locks.filter(l=>l.life > 0);
  }

  const cx = i => ox + (i % cols)*cw;
  const cy = i => oy + Math.floor(i/cols)*ch;

  function draw(){
    ctx.clearRect(0,0,W,H);

    const hx = cx(head), hy = cy(head);

    // probe crosshair spanning the full target area
    ctx.strokeStyle='rgba(225,29,72,.26)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,hy); ctx.lineTo(W,hy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx,0); ctx.lineTo(hx,H); ctx.stroke();

    // the grid itself
    for(let i=0;i<cells.length;i++){
      const c=cells[i], x=cx(i), y=cy(i);
      const heat = Math.max(c.p, c.f);
      if(c.f > .04){
        const s = 3 + c.f*2.4;
        ctx.fillStyle = `rgba(255,63,95,${.35+c.f*.65})`;
        ctx.fillRect(x-s/2, y-s/2, s, s);
        ctx.beginPath(); ctx.arc(x,y, 6+(1-c.f)*16, 0, 7);
        ctx.strokeStyle = `rgba(225,29,72,${c.f*.45})`; ctx.lineWidth=1; ctx.stroke();
      } else {
        const s = 2.3 + heat*1.7;
        ctx.fillStyle = `rgba(255,120,140,${.20 + heat*.55})`;
        ctx.fillRect(x-s/2, y-s/2, s, s);
      }
    }

    // live probe head
    ctx.fillStyle='rgba(255,180,140,1)';
    ctx.fillRect(hx-2.4, hy-2.4, 4.8, 4.8);
    ctx.strokeStyle='rgba(255,107,61,.85)'; ctx.lineWidth=1.2;
    ctx.strokeRect(hx-6, hy-6, 12, 12);

    // lock brackets on confirmed findings
    locks.forEach(l=>{
      const x=cx(l.i), y=cy(l.i), r=9+(1-l.life)*3, a=l.life*.9, arm=4;
      ctx.strokeStyle=`rgba(255,63,95,${a})`; ctx.lineWidth=1.3;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sy])=>{
        ctx.beginPath();
        ctx.moveTo(x+sx*r, y+sy*r - sy*arm);
        ctx.lineTo(x+sx*r, y+sy*r);
        ctx.lineTo(x+sx*r - sx*arm, y+sy*r);
        ctx.stroke();
      });
    });

    // HUD corner framing, so it reads as an instrument like the radar
    const m=8, L=16;
    ctx.strokeStyle='rgba(225,29,72,.34)'; ctx.lineWidth=1;
    [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(([x,y,sx,sy])=>{
      ctx.beginPath();
      ctx.moveTo(x+sx*L, y); ctx.lineTo(x, y); ctx.lineTo(x, y+sy*L);
      ctx.stroke();
    });
  }

  function frame(){ if(running){ step(); draw(); } requestAnimationFrame(frame); }
  frame();

  new IntersectionObserver(es=>es.forEach(e=>running=e.isIntersecting),{threshold:0})
    .observe(canvas);
}
