/* Defensive threat-surface radar — teal, because this side is blue-team. */
export function initRadar(canvas){
  const ctx=canvas.getContext('2d');
  let W=0,H=0,ang=0,running=true;
  const blips=Array.from({length:10},()=>({
    a:Math.random()*Math.PI*2, d:.16+Math.random()*.76, s:Math.random()*2+1.3
  }));
  function resize(){
    const r=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=r.width*dpr; canvas.height=r.height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0); W=r.width; H=r.height;
  }
  resize(); addEventListener('resize',resize);

  function frame(){
    if(!running){ requestAnimationFrame(frame); return; }
    const cx=W/2, cy=H/2, R=Math.min(W,H)*.45;
    ctx.clearRect(0,0,W,H);

    ctx.strokeStyle='rgba(255,255,255,.07)'; ctx.lineWidth=1;
    for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx,cy,R*i/4,0,7);ctx.stroke();}
    for(let i=0;i<8;i++){
      ctx.beginPath();ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(i*Math.PI/4)*R, cy+Math.sin(i*Math.PI/4)*R);ctx.stroke();
    }

    if(ctx.createConicGradient){
      const g=ctx.createConicGradient(ang,cx,cy);
      g.addColorStop(0,'rgba(61,220,151,.34)');
      g.addColorStop(.13,'rgba(61,220,151,0)');
      g.addColorStop(1,'rgba(61,220,151,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fill();
    }
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(ang)*R, cy+Math.sin(ang)*R);
    ctx.strokeStyle='rgba(61,220,151,.8)';ctx.lineWidth=1.3;ctx.stroke();

    blips.forEach(b=>{
      const d=(ang-b.a+Math.PI*4)%(Math.PI*2);
      const f=Math.max(0,1-d/1.8); if(f<=0) return;
      const px=cx+Math.cos(b.a)*R*b.d, py=cy+Math.sin(b.a)*R*b.d;
      ctx.beginPath();ctx.arc(px,py,b.s,0,7);
      ctx.fillStyle=`rgba(127,240,194,${f})`;ctx.fill();
      ctx.beginPath();ctx.arc(px,py,b.s+8*(1-f),0,7);
      ctx.strokeStyle=`rgba(61,220,151,${f*.32})`;ctx.lineWidth=1;ctx.stroke();
    });

    ang=(ang+.015)%(Math.PI*2);
    requestAnimationFrame(frame);
  }
  frame();
  new IntersectionObserver(es=>es.forEach(e=>running=e.isIntersecting),{threshold:0}).observe(canvas);
}
