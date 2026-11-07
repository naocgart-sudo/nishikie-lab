// LUX skin: 波の継ぎ目(金の線つき)・金の網点・小物・入手セクションの墨線 canvas を後付け(マークアップは本番と同じ)
(() => {
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WAVE_D = 'M0,50 C140,86 260,16 400,46 C540,76 660,22 800,48 C940,74 1060,18 1200,44 C1300,62 1380,30 1440,46';
  const wave = (fill) => `<svg viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path fill="${fill}" d="${WAVE_D} L1440,90 L0,90 Z"/><path class="ln" d="${WAVE_D}"/></svg>`;
  const topColor = (sec) => { const cs = getComputedStyle(sec); const m = (cs.backgroundImage || '').match(/rgb[a]?\([^)]*\)/); return m ? m[0] : cs.backgroundColor; };

  // 1) 波の継ぎ目
  const secs = [document.querySelector('.hero'), ...$$('main > section')].filter(Boolean);
  secs.forEach((s, i) => {
    const next = secs[i + 1] || document.querySelector('footer');
    if (!next) return;
    s.appendChild(el('div', 'wave', wave(topColor(next))));
  });

  // 2) カラーハーフトーン: 点の「大きさ」で消える(透明度ではなく)。canvas に描く
  //    cfg: color / step(格子) / rmax(最大半径) / dir(大きい側: left|right|bl|tr…) / span(消えるまでの幅 0..1)
  function halftone(host, cfg){
    const cv = el('canvas', 'ht'); host.prepend(cv);
    const draw = () => {
      const d = Math.min(devicePixelRatio || 1, 2), W = host.clientWidth, H = host.clientHeight;
      cv.width = W * d | 0; cv.height = H * d | 0; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, W, H); x.fillStyle = cfg.color;
      const st = cfg.step, rmax = cfg.rmax, span = cfg.span || .5;
      // 位置 → 0..1(1=点が最大)。方向ごとに「どこから測るか」
      const proj = (px, py) => {
        const u = px / W, v = py / H;
        switch(cfg.dir){
          case 'left': return 1 - u / span;
          case 'right': return 1 - (1 - u) / span;
          case 'bl': return 1 - Math.hypot(u, 1 - v) / span;
          case 'tr': return 1 - Math.hypot(1 - u, v) / span;
          case 'tl': return 1 - Math.hypot(u, v) / span;
          case 'br': return 1 - Math.hypot(1 - u, 1 - v) / span;
          default: return 1;
        }
      };
      for(let py = st / 2, row = 0; py < H + st; py += st, row++){
        const off = (row % 2) ? st / 2 : 0;
        for(let px = st / 2 + off; px < W + st; px += st){
          const t = Math.min(1, Math.max(0, proj(px, py)));
          if(t <= 0) continue;
          const r = rmax * Math.pow(t, .7);   // 大きさで消える(最小 0)
          if(r < .25) continue;
          x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
        }
      }
    };
    draw();
    if('ResizeObserver' in window) new ResizeObserver(draw).observe(host);
    return cv;
  }
  const hero = document.querySelector('.hero');
  if (hero) {
    halftone(hero, {color: 'rgba(211,176,106,.18)', step: 12, rmax: 3.1, dir: 'right', span: .56});
    halftone(hero, {color: 'rgba(224,106,79,.17)', step: 12, rmax: 2.8, dir: 'bl', span: .46});
  }
  // 本文の列(中央 1120px)に掛からないよう、端から 0.22〜0.3 で消す
  const htOf = { features: ['rgba(211,176,106,.15)', 'left', .22], motion: ['rgba(211,176,106,.15)', 'right', .24], mobile: ['rgba(224,106,79,.14)', 'left', .2],
                 works: ['rgba(211,176,106,.13)', 'tr', .3], get: ['rgba(211,176,106,.15)', 'tr', .34], faq: ['rgba(211,176,106,.14)', 'right', .22] };
  for (const id in htOf) { const s = document.getElementById(id); if (!s) continue; halftone(s, {color: htOf[id][0], step: 11, rmax: 2.7, dir: htOf[id][1], span: htOf[id][2] + .06}); }

  // 3) 小物(端寄せ・少なめ)
  let seed = 3; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const kinds = ['star', 'star', 'dot', 'ring', 'dots', 'sei', 'star', 'ring'];
  secs.forEach((s) => {
    const isHero = s.classList.contains('hero');
    const n = isHero ? 7 : 4;
    for (let k = 0; k < n; k++) {
      const cls = kinds[Math.floor(rnd() * kinds.length)];
      const d = el('span', 'deco ' + cls, cls === 'star' ? '✦' : '');
      const side = rnd() < .5;
      const x = isHero ? (side ? rnd() * 8 : 52 + rnd() * 46) : (side ? rnd() * 10 : 88 + rnd() * 10);
      d.style.left = x + '%'; d.style.top = (8 + rnd() * 78) + '%';
      d.style.setProperty('--sz', (cls === 'dots' || cls === 'sei' ? 56 + rnd() * 50 : cls === 'dot' ? 6 + rnd() * 6 : cls === 'ring' ? 22 + rnd() * 26 : 12 + rnd() * 14) + 'px');
      d.style.setProperty('--dur', (4 + rnd() * 5) + 's'); d.style.setProperty('--spin', (14 + rnd() * 16) + 's');
      d.style.animationDelay = (-rnd() * 7) + 's';
      s.appendChild(d);
    }
  });

  // 4) 「壱 — FEATURES」の区切りを ✦ に
  $$('.sec-head .num').forEach(n => { n.textContent = n.textContent.replace(/\s*[—–-]\s*/, ' ✦ '); });

  // 5) 入手セクションにも墨線(hero と同じ距離場の線。金と朱で)
  const target = document.getElementById('get');
  if (!target || reduce) return;
  const cv = el('canvas', 'inkline'); target.prepend(cv);
  const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) { cv.remove(); return; }
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision mediump float;uniform vec2 R;uniform float T;uniform vec3 C1;uniform vec3 C2;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    void main(){vec2 uv=gl_FragCoord.xy/R.y;float x=uv.x,a=0.;vec3 col=vec3(0.);
      for(int k=0;k<4;k++){float fk=float(k);float y0=.12+fk*.09+.02*sin(T*.19+fk);
        float w=y0+.05*sin(x*2.7+T*.3+fk*1.7)+.02*sin(x*6.9-T*.45+fk)+.012*n(vec2(x*4.,fk*9.+T*.1));
        float d=abs(uv.y-w);float th=.0014+.001*n(vec2(x*9.,fk*3.));float la=smoothstep(th+.0016,th,d);
        float dry=smoothstep(.35,.7,n(vec2(x*60.,uv.y*240.+fk*17.)));float v=la*mix(.5,1.,dry)*(.3+.12*fk);
        a+=v;col+=v*mix(C1,C2,step(2.5,fk));}
      float fade=smoothstep(0.,.3,uv.x/(R.x/R.y))*smoothstep(1.02,.6,uv.x/(R.x/R.y));
      float A=clamp(a*.3*mix(.5,1.,fade),0.,1.);
      gl_FragColor=vec4(col/max(a,1e-4)*A,A);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T');
  gl.uniform3f(gl.getUniformLocation(pr, 'C1'), .83, .69, .42); gl.uniform3f(gl.getUniformLocation(pr, 'C2'), .88, .42, .31);
  let visible = false, queued = false; const t0 = performance.now();
  function size() { const d = Math.min(devicePixelRatio || 1, 2); const w = cv.clientWidth * d | 0, h = cv.clientHeight * d | 0; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } gl.uniform2f(uR, w, h); }
  function frame(now) { queued = false; size(); gl.uniform1f(uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); if (visible) kick(); }
  function kick() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(cv);
})();
