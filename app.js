// ===== CONFIG PAGES =====
const PAGES = [
  { slug: "index.html",   step: 1, total: 5, title: "Release candidate" },
  { slug: "why.html",     step: 2, total: 5, title: "Pourquoi ce départ ?" },
  { slug: "env.html",     step: 3, total: 5, title: "Environnement : Camargue" },
  { slug: "roadmap.html", step: 4, total: 5, title: "Roadmap du week-end" },
  { slug: "tests.html",   step: 5, total: 5, title: "Tests & Décision" },
];

function currentIndex(){
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  return Math.max(0, PAGES.findIndex(p => p.slug.toLowerCase() === path));
}

function setProgress(){
  const i = currentIndex();
  const page = PAGES[i];
  const bar = document.querySelector(".progress > span");
  const lbl = document.querySelector(".stepLabel");
  if(bar) bar.style.width = `${Math.round((page.step / page.total) * 100)}%`;
  if(lbl) lbl.textContent = `Step ${page.step}/${page.total} • ${page.title}`;
}

function goNext(){
  const i = currentIndex();
  const next = PAGES[Math.min(i+1, PAGES.length-1)].slug;
  if (next) location.href = next;
}
function goPrev(){
  const i = currentIndex();
  const prev = PAGES[Math.max(i-1, 0)].slug;
  if (prev) location.href = prev;
}

function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.style.display="none", 1600);
}

// ===== Confetti (mini) =====
function confettiBurst(durationMs = 1400){
  const c = document.getElementById("confetti");
  if(!c) return;
  const ctx = c.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize(){
    c.width = Math.floor(innerWidth * dpr);
    c.height = Math.floor(innerHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  addEventListener("resize", resize, { passive:true });

  const pieces = Array.from({length: 160}).map(() => ({
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight * 0.2,
    r: 2 + Math.random()*4,
    vy: 2 + Math.random()*4.5,
    vx: -1.2 + Math.random()*2.4,
    a: Math.random() * Math.PI * 2,
    va: -0.25 + Math.random()*0.5,
    life: 0,
    ttl: 60 + Math.random()*80
  }));

  let start = performance.now();

  function frame(now){
    const t = now - start;
    ctx.clearRect(0,0, innerWidth, innerHeight);

    for(const p of pieces){
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      p.vy += 0.02; // gravity-ish

      const alpha = Math.max(0, 1 - (p.life / p.ttl));
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      // no explicit colors: use HSL but not fixed palette
      const hue = (p.x / innerWidth) * 360;
      ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
      ctx.fillRect(-p.r, -p.r, p.r*2.2, p.r*2.2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    if(t < durationMs){
      requestAnimationFrame(frame);
    }else{
      ctx.clearRect(0,0, innerWidth, innerHeight);
    }
  }
  requestAnimationFrame(frame);
}

// ===== Small UX helpers =====
function enableKeyboardNav(){
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  });
}

function revealOnLoad(){
  document.querySelectorAll("[data-animate]").forEach((el, idx) => {
    el.style.animationDelay = `${Math.min(idx * 70, 420)}ms`;
    el.classList.add("fadeUp");
  });
}

function typewriter(el, text, speed=18){
  if(!el) return;
  el.textContent = "";
  let i=0;
  const tick = () => {
    el.textContent += text[i++];
    if(i < text.length) setTimeout(tick, speed);
  };
  tick();
}

function init(){
  setProgress();
  enableKeyboardNav();
  revealOnLoad();

  // Optional: a tiny typewriter on elements that ask for it
  document.querySelectorAll("[data-typewriter]").forEach((el) => {
    const txt = el.getAttribute("data-typewriter") || el.textContent;
    typewriter(el, txt, 14);
  });

  // Wire nav buttons if present
  const prev = document.querySelector("[data-prev]");
  const next = document.querySelector("[data-next]");
  if(prev) prev.addEventListener("click", goPrev);
  if(next) next.addEventListener("click", goNext);

  // Special "Non 🙃" prank behavior if present
  const noBtn = document.getElementById("noBtn");
  if(noBtn){
    noBtn.addEventListener("click", () => {
      noBtn.classList.remove("shake");
      void noBtn.offsetWidth; // reflow
      noBtn.classList.add("shake");
      toast("Sans facon");
    });
  }

  // Special "Oui 😎" celebration if present
  const yesBtn = document.getElementById("yesBtn");
  const celebration = document.getElementById("celebration");
  if(yesBtn && celebration){
    yesBtn.addEventListener("click", () => {
      celebration.style.display = "block";
      yesBtn.style.display = "none";
      const nb = document.getElementById("noBtn");
      if(nb) nb.style.display = "none";
      confettiBurst(1500);
      toast("Mission validée ✅");
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
