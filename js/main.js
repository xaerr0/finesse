(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Background videos: only load if the file exists and motion is allowed.
  // Until real footage is dropped into assets/video/, the CSS velvet stays in place.
  if (!reduceMotion) {
    document.querySelectorAll('video[data-src]').forEach(function (video) {
      var start = function () {
        video.src = video.dataset.src;
        video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
        video.addEventListener('error', function () { video.remove(); }, { once: true });
        video.play().catch(function () {});
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { start(); io.disconnect(); }
        }, { rootMargin: '200px' });
        io.observe(video);
      } else {
        start();
      }
    });
  }

  // Collection rail arrows
  var rail = document.querySelector('.rail');
  var buttons = document.querySelectorAll('.rail-btn');
  if (rail && buttons.length) {
    var step = function () {
      var item = rail.querySelector('.scent');
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : rail.clientWidth;
    };
    var update = function () {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      buttons[0].disabled = rail.scrollLeft <= 2;
      buttons[1].disabled = rail.scrollLeft >= max;
    };
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        rail.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Demo forms: no backend yet, so confirm locally.
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
