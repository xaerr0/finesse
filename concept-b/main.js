(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Velvet: a slowly folding cloth rendered in WebGL ----------
  // Stands in for hero footage; real video fades in over it once the file exists.
  var initVelvet = function (canvas) {
  var gl = (canvas.getContext('webgl', { antialias: false, alpha: false }) || canvas.getContext('experimental-webgl'));
  if (gl) {
    var vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
    var fs = [
      'precision mediump float;',
      'uniform vec2 r; uniform float t;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);',
      '  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y); }',
      'float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += a*noise(p); p = p*2.03 + vec2(1.7, 9.2); a *= .5; } return v; }',
      'float H(vec2 p){',
      '  float s = t*.03;',
      '  vec2 q = vec2(fbm(p*.8 + vec2(0., s)), fbm(p*.8 + vec2(5.2, 1.3) - s));',
      '  float d = p.x*2.1 + p.y*.35 + 1.6*q.x;',
      '  return .7*sin(d*2.2 + s*3.) + .28*sin(d*4.4 - q.y*2.6 + s*2.) + .18*fbm(p*1.6 + 2.*q);',
      '}',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / r.y * 2.6;',
      '  float e = 3. / r.y;',
      '  float dx = (H(uv + vec2(e, 0.)) - H(uv - vec2(e, 0.))) / (2.*e);',
      '  float dy = (H(uv + vec2(0., e)) - H(uv - vec2(0., e))) / (2.*e);',
      '  vec3 n = normalize(vec3(-dx*.22, -dy*.22, 1.));',
      '  vec3 l = normalize(vec3(-.55, .5, .68));',
      '  float diff = max(dot(n, l), 0.);',
      '  float rim = pow(1. - n.z, 1.4);',
      '  float spec = pow(max(dot(reflect(-l, n), vec3(0., 0., 1.)), 0.), 22.);',
      '  vec3 night = vec3(.184, .067, .204), plum = vec3(.325, .125, .345), orchid = vec3(.549, .31, .627), gold = vec3(.843, .722, .42);',
      '  vec3 col = mix(night*.3, plum*1.1, pow(diff, 1.8));',
      '  col += orchid * pow(rim, 1.2) * .5 * diff + gold * spec * .16;',
      '  vec2 c = gl_FragCoord.xy / r - .5;',
      '  col *= 1. - dot(c, c) * .9;',
      '  gl_FragColor = vec4(col, 1.);',
      '}'
    ].join('\n');
    var compile = function (type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    var v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
    var prog = v && f && gl.createProgram();
    if (prog) {
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog); gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't');
      var scale = 0.5, visible = true, last = 0, start = performance.now();

      var resize = function () {
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uR, canvas.width, canvas.height);
      };
      var draw = function (now) {
        gl.uniform1f(uT, (now - start) / 1000 + 40);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      var loop = function (now) {
        if (visible && !document.hidden && now - last > 33) { draw(now); last = now; }
        requestAnimationFrame(loop);
      };
      resize();
      var onResize = function () { resize(); if (reduceMotion) draw(start); };
      if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(canvas);
      else window.addEventListener('resize', onResize);
      if (reduceMotion) {
        draw(start);
      } else {
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
        }
        requestAnimationFrame(loop);
      }
    }
  }
  };
  document.querySelectorAll('[data-velvet]').forEach(initVelvet);

  // ---------- Footage slots: load when near view, drop silently if the file is missing ----------
  var startVideo = function (video) {
    if (reduceMotion || video.dataset.started) return;
    video.dataset.started = '1';
    video.src = video.dataset.src;
    video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
    video.addEventListener('error', function () { video.remove(); }, { once: true });
    video.play().catch(function () {});
  };
  var videos = document.querySelectorAll('video[data-src]');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { startVideo(e.target); vio.unobserve(e.target); } });
    }, { rootMargin: '200px' });
    videos.forEach(function (vid) { vio.observe(vid); });
  } else {
    videos.forEach(startVideo);
  }

  // ---------- Collection tabs ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.scent-list [role="tab"]'));
  var select = function (tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) panel.querySelectorAll('video[data-src]').forEach(startVideo);
    });
    if (focus) tab.focus();
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  // ---------- The parrot crosses the updates section once ----------
  var updates = document.querySelector('.updates');
  if (updates && 'IntersectionObserver' in window) {
    var uio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { updates.classList.add('is-seen'); uio.disconnect(); }
    }, { threshold: 0.35 });
    uio.observe(updates);
  } else if (updates) {
    updates.classList.add('is-seen');
  }

  // ---------- Demo forms ----------
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var signup = form.classList.contains('signup');
      if (status) status.textContent = signup ? 'You’re on the list.' : 'Message sent. Ines will reply by email.';
      form.reset();
    });
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
