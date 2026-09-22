/* Slow ember drift behind the hero portrait. */
export function initEmbers(canvas){
  const ctx=canvas.getContext('2d');
  let W=0,H=0,running=true;
  const P=Array.from({length:48},()=>({
    x:Math.random(), y:Math.random(),
    s:Math.random()*1.6+.4, v:Math.random()*.0011+.0003, o:Math.random()*.5+.14
  }));
  function resize(){
    const r=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=r.width*dpr; canvas.height=r.height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0); W=r.width; H=r.height;
  }
  resize(); addEventListener('resize',resize);
  function frame(){
    if(!running){ requestAnimationFrame(frame); return; }
    ctx.clearRect(0,0,W,H);
    P.forEach(p=>{
      p.y-=p.v; if(p.y<-.05){ p.y=1.05; p.x=Math.random(); }
      ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.s, 0, 7);
      ctx.fillStyle=`rgba(255,${90+p.s*50|0},${70+p.s*30|0},${p.o})`; ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
  new IntersectionObserver(es=>es.forEach(e=>running=e.isIntersecting),{threshold:0}).observe(canvas);
}
