(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footage slots: load when near view, remove quietly if the file is not there yet.
  var start = function (video) {
    if (reduceMotion) return;
    video.src = video.dataset.src;
    video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
    video.addEventListener('error', function () { video.remove(); }, { once: true });
    video.play().catch(function () {});
  };
  var videos = document.querySelectorAll('video[data-src]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { start(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '200px' });
    videos.forEach(function (v) { io.observe(v); });
  } else {
    videos.forEach(start);
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
