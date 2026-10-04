/* Nishikie Lab site — hero shader, reveal, autoplay-on-view */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav border on scroll
  var nav = document.querySelector('.nav');
  var onScroll = function(){ if(nav) nav.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // reveal + autoplay only while visible
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -8% 0px'});
    var pend = [].slice.call(document.querySelectorAll('.rv'));
    pend.forEach(function(el){ io.observe(el); });
    // 速いスクロールやページ内ジャンプで飛ばされた要素も、通り過ぎたら必ず出す
    var sweep = function(){
      pend = pend.filter(function(el){
        if(el.classList.contains('in')) return false;
        if(el.getBoundingClientRect().top < innerHeight){ el.classList.add('in'); io.unobserve(el); return false; }
        return true;
      });
    };
    addEventListener('scroll', function(){ if(pend.length) requestAnimationFrame(sweep); }, {passive:true});
    var vo = new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting && !reduce){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
        else v.pause();
      });
    }, {threshold:.35});
    document.querySelectorAll('video[data-auto]').forEach(function(v){ vo.observe(v); });
  }else{
    document.documentElement.classList.add('noscript');
  }

  // ── 動きで見る：media.json の並びどおりに組み立てる ──
  // 素材の追加・差し替えは assets/ にファイルを置いて media.json を1行足すだけ。
  // 読めなかったときは HTML に書いてある既定の4本がそのまま残る。
  var gal = document.getElementById('gallery');
  var me = document.querySelector('script[src$="site.js"]');
  if(gal && me && window.fetch){
    var base = new URL('../', me.src);            // サイトの一番上
    var lang = (document.documentElement.lang || 'ja').slice(0,2);
    fetch(new URL('media.json', base), {cache:'no-cache'}).then(function(r){ return r.ok ? r.json() : null; }).then(function(list){
      if(!list || !list.length) return;
      var esc = function(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
      var html = list.filter(function(m){ return m && m.file && !m.hidden; }).map(function(m){
        var t = m[lang] || m.ja || m.en || {};
        var src = new URL('assets/' + m.file, base).href;
        var isVid = /\.(mp4|webm|mov)$/i.test(m.file);
        var poster = m.poster ? new URL('assets/' + m.poster, base).href : '';
        var media = isVid
          ? '<video data-auto muted loop playsinline preload="' + (poster ? 'none' : 'metadata') + '"' + (poster ? ' poster="' + poster + '"' : '') +
            ' aria-label="' + esc(t.title) + '"><source src="' + src + (poster ? '' : '#t=0.1') + '"></video>'
          : '<img src="' + src + '" loading="lazy" alt="' + esc(t.alt || t.title) + '">';
        return '<figure class="clip rv' + (m.wide ? ' wide' : '') + '">' + media +
          '<figcaption><b>' + esc(t.title) + '</b><span>' + esc(t.desc) + '</span></figcaption></figure>';
      }).join('');
      if(!html) return;
      gal.innerHTML = html;
      gal.querySelectorAll('.rv').forEach(function(el){
        if(typeof io !== 'undefined'){ io.observe(el); pend.push(el); } else el.classList.add('in');
      });
      gal.querySelectorAll('video[data-auto]').forEach(function(v){ if(typeof vo !== 'undefined') vo.observe(v); });
    }).catch(function(){});
  }

  // hero: 一本の線＝ひとつの距離場。墨の波線が紙の上をゆっくり流れる
  var cv = document.getElementById('heroGL');
  if(!cv) return;
  var gl = cv.getContext('webgl', {premultipliedAlpha:true, alpha:true, antialias:false});
  if(!gl){ cv.remove(); return; }
  var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision mediump float;',
    'uniform vec2 R;uniform float T;uniform vec3 INK;uniform vec3 SHU;uniform float DARK;uniform vec2 M;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/R.y; float x=uv.x, a=0.;',
    ' vec2 m=M/R.y;',
    ' for(int k=0;k<5;k++){',
    '  float fk=float(k);',
    '  float y0=.16+fk*.075+.02*sin(T*.21+fk);',
    '  float w=y0+.045*sin(x*3.1+T*.35+fk*1.7)+.022*sin(x*7.3-T*.5+fk)+.012*n(vec2(x*4.,fk*9.+T*.1));',
    '  float bend=.05*exp(-dot(uv-m,uv-m)*18.);',
    '  float d=abs(uv.y-w-bend);',
    '  float th=.0016+.0011*n(vec2(x*9.,fk*3.));',            // 筆圧っぽい太さの揺れ
    '  float lineA=smoothstep(th+.0016,th,d);',
    '  float dry=smoothstep(.35,.7,n(vec2(x*60.,uv.y*240.+fk*17.)));', // かすれ
    '  a+=lineA*mix(.55,1.,dry)*(.35+.13*fk);',
    ' }',
    ' float fade=smoothstep(0.,.35,uv.x/(R.x/R.y))*smoothstep(1.02,.55,uv.x/(R.x/R.y));',
    ' a*=mix(.55,1.,fade);',
    ' float grain=(n(gl_FragCoord.xy*.7)-.5)*.05;',
    ' vec3 c=mix(INK,SHU,smoothstep(.43,.48,uv.y)*.0);',
    ' float A=clamp(a*.32+grain*.35*(1.-DARK),0.,1.);',
    ' gl_FragColor=vec4(c*A,A);',
    '}'].join('\n');
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr, gl.LINK_STATUS)){ cv.remove(); return; }
  gl.useProgram(pr);
  var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(pr,'R'), uT=gl.getUniformLocation(pr,'T'), uI=gl.getUniformLocation(pr,'INK'),
      uS=gl.getUniformLocation(pr,'SHU'), uD=gl.getUniformLocation(pr,'DARK'), uM=gl.getUniformLocation(pr,'M');
  function hex(c){ c=c.trim().replace('#',''); return [0,2,4].map(function(i){return parseInt(c.substr(i,2),16)/255;}); }
  function colors(){
    var cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(uI, hex(cs.getPropertyValue('--ink'))); gl.uniform3fv(uS, hex(cs.getPropertyValue('--shu')));
    gl.uniform1f(uD, matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0);
  }
  colors();
  if(matchMedia('(prefers-color-scheme: dark)').addEventListener)
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colors);
  var mx=-9999, my=-9999, tx=-9999, ty=-9999;
  cv.parentElement.addEventListener('pointermove', function(e){
    var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio||1, 2);
    tx = (e.clientX - r.left) * d; ty = (r.bottom - e.clientY) * d;
    if(mx < -999){ mx = tx; my = ty; }
  });
  function size(){
    var d = Math.min(devicePixelRatio||1, 2);
    var w = cv.clientWidth*d|0, h = cv.clientHeight*d|0;
    if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; gl.viewport(0,0,w,h); }
    gl.uniform2f(uR, w, h);
  }
  var visible = true, t0 = performance.now(), queued = false;
  function kick(){ if(!queued){ queued = true; requestAnimationFrame(frame); } }
  if('IntersectionObserver' in window)
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(visible && !reduce) kick(); }).observe(cv);
  function frame(now){
    queued = false;
    size();
    mx += (tx-mx)*.06; my += (ty-my)*.06;
    gl.uniform2f(uM, mx, my);
    gl.uniform1f(uT, reduce ? 4.0 : (now - t0)/1000);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if(visible && !reduce && !document.hidden) kick();
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden && !reduce) kick(); });
  addEventListener('resize', function(){ kick(); });
  kick();
})();
