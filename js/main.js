import { initChain }  from './chain.js';
import { initRadar }  from './radar.js';
import { initScanner } from './scanner.js';
import { initEmbers } from './embers.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- hero reveal ---------- */
addEventListener('load', () => $('#top').classList.add('reveal'));

/* ---------- nav state + scroll progress ---------- */
const nav = $('#nav'), prog = $('#prog');
addEventListener('scroll', () => {
  nav.classList.toggle('solid', scrollY > 40);
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
}, { passive: true });

/* ---------- ambient cursor glow ---------- */
if (!reduced) {
  const g = $('#glow');
  let tx = innerWidth / 2, ty = 320, cx = tx, cy = ty;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop(){
    cx += (tx - cx) * .07; cy += (ty - cy) * .07;
    g.style.transform = `translate(${cx}px,${cy}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- tech marquee ---------- */
const tools = ['Python','Nuclei','Java','TypeScript','React','Splunk','QRadar','Azure Sentinel',
  'CrowdStrike','SentinelOne','Cortex XDR','AWS','PostgreSQL','Docker','YARA','Velociraptor','Chronicle'];
$('#mtrack').innerHTML = [...tools, ...tools].map(t => `<span>${t}</span>`).join('');

/* ---------- scroll reveals + number counters ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll?.('[data-n]').forEach(n => {
      const target = +n.dataset.n; let i = 0;
      const tick = setInterval(() => {
        i++; n.textContent = i >= target ? target + '+' : i;
        if (i >= target) clearInterval(tick);
      }, 440 / target);
    });
    io.unobserve(e.target);
  });
}, { threshold: .18 });
$$('.r').forEach(e => io.observe(e));
$$('.job').forEach((e, i) => { e.style.transitionDelay = i * .12 + 's'; io.observe(e); });

/* ---------- timeline fill tracks scroll through the list ---------- */
const tl = $('#tl'), tlFill = $('#tlFill');
if (tl && tlFill) {
  addEventListener('scroll', () => {
    const r = tl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * .72 - r.top) / r.height));
    tlFill.style.height = p * 100 + '%';
  }, { passive: true });
}

/* ---------- magnetic buttons ---------- */
if (!reduced && matchMedia('(pointer:fine)').matches) {
  $$('.mag').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform =
        `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- lazy-load generated art, fade in once decoded ---------- */
const imgIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const img = e.target, src = img.dataset.src;
    img.onload = () => img.classList.add('on');
    img.onerror = () => img.remove();          // art missing? card still works
    img.src = src;
    imgIO.unobserve(img);
  });
}, { rootMargin: '200px' });
$$('.pthumb img[data-src]').forEach(i => imgIO.observe(i));

/* hero plate — only shown once it actually loads */
(() => {
  const plate = $('#heroPlate'), probe = new Image();
  probe.onload  = () => { plate.style.backgroundImage = `url(${probe.src})`; plate.classList.add('on'); };
  probe.onerror = () => {};
  probe.src = 'assets/hero-plate.webp';
})();

/* portrait — swaps the silhouette placeholder if a real photo is present */
(() => {
  const probe = new Image();
  probe.onload = () => {
    const img = document.createElement('img');
    img.src = probe.src; img.alt = 'Vaibhav Kunjir'; img.className = 'portrait';
    $('#portraitPh').replaceWith(img);
    $('#phNote')?.remove();
    if (!reduced && matchMedia('(pointer:fine)').matches) {
      addEventListener('mousemove', e => {
        const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
        img.style.transform = `translateX(calc(-50% + ${dx * -16}px)) translateY(${dy * -10}px)`;
      }, { passive: true });
    }
  };
  probe.onerror = () => {};
  probe.src = 'assets/portrait.png';
})();

/* placeholder silhouette gets the parallax too, until the real photo lands */
if (!reduced && matchMedia('(pointer:fine)').matches) {
  const ph = $('#portraitPh');
  addEventListener('mousemove', e => {
    if (!ph.isConnected) return;
    const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
    ph.style.transform = `translateX(calc(-50% + ${dx * -16}px)) translateY(${dy * -10}px)`;
  }, { passive: true });
}

/* ---------- canvases ---------- */
if (!reduced) {
  initEmbers($('#embers'));
  initRadar($('#radar'));
  initScanner($('#scanner'));
  const stat = $('#chainStat');
  initChain($('#chain'), n => { stat.textContent = `INTERCEPTED ${n}`; });
}
