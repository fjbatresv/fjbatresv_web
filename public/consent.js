(function () {
  var measurementId = 'G-MSCC45EHNV';
  var consentKey = 'analytics_consent';
  var banner = document.getElementById('cookie-consent');
  var acceptButton = document.getElementById('cookie-consent-accept');
  var rejectButton = document.getElementById('cookie-consent-reject');
  var scriptAppended = false;

  function setCookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : null;
  }

  function updateBanner(visible) {
    if (!banner) return;
    banner.classList.toggle('cookie-consent-hidden', !visible);
    banner.style.display = visible ? 'flex' : 'none';
  }

  function clearAnalyticsCookies() {
    var hostname = window.location.hostname;
    var domains = ['', hostname, hostname.indexOf('.') > -1 ? '.' + hostname : ''].filter(Boolean);
    document.cookie.split(';').forEach(function (raw) {
      var name = raw.split('=')[0].trim();
      if (!/^_(ga|gid|gat|gcl_)/.test(name)) return;
      ['', '/'].forEach(function (path) {
        domains.concat(['']).forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
            (domain ? '; domain=' + domain : '') + (path ? '; path=' + path : '') + '; SameSite=Lax';
        });
      });
    });
  }

  function removeAnalyticsScript() {
    document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach(function (script) {
      script.remove();
    });
    window.gtag = function () {};
    window.dataLayer = [];
    scriptAppended = false;
  }

  function loadAnalytics() {
    if (scriptAppended) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    script.onload = function () { window.gtag('config', measurementId); };
    document.head.appendChild(script);
    scriptAppended = true;
  }

  function applyTranslations() {
    var spanish = (document.documentElement.lang || navigator.language || 'en').split('-')[0] === 'es';
    var message = banner && banner.querySelector('[data-cookie-message]');
    if (message) {
      var prefix = spanish
        ? 'Usamos cookies analíticas para entender cómo interactúan los visitantes con el sitio. Consulta nuestra '
        : 'We use analytics cookies to understand how visitors interact with the site. See our ';
      var linkText = spanish ? 'política de privacidad' : 'privacy policy';
      message.textContent = prefix;
      var link = document.createElement('a');
      link.href = '/privacy-policy.pdf';
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = linkText;
      message.appendChild(link);
      message.appendChild(document.createTextNode('.'));
    }
    if (acceptButton) acceptButton.textContent = spanish ? 'Aceptar' : 'Accept';
    if (rejectButton) rejectButton.textContent = spanish ? 'Rechazar' : 'Reject';
  }

  if (acceptButton) acceptButton.addEventListener('click', function () {
    setCookie(consentKey, 'accepted', 365);
    updateBanner(false);
    loadAnalytics();
  });
  if (rejectButton) rejectButton.addEventListener('click', function () {
    setCookie(consentKey, 'rejected', 365);
    updateBanner(false);
    removeAnalyticsScript();
    clearAnalyticsCookies();
  });

  var consent = getCookie(consentKey);
  if (consent === 'accepted') {
    loadAnalytics();
    updateBanner(false);
  } else {
    updateBanner(consent !== 'rejected');
  }
  applyTranslations();
  new MutationObserver(applyTranslations).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
})();
