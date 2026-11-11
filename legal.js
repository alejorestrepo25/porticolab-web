// Consentimiento de cookies y enlaces legales de Pórtico Lab.
// - Google Analytics y Metricool NO se cargan hasta que la persona acepta la analítica.
// - La decisión (aceptar o rechazar) queda registrada con un identificador, fecha y versión.
// - Expone window.PL_LEGAL para que los formularios incluyan la prueba de aceptación.
(function () {
  'use strict';
  var VERSION = '2026-11-11';            // versión vigente de Términos, Privacidad, Cookies y Reembolsos
  var CLAVE = 'pl_consent';
  var GA = 'G-LZW7VQF6PR';
  var METRICOOL = 'e399044339d195af0c08d307ff70b030';
  var cargado = false;

  function uuid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    var b = new Uint8Array(16);
    try { crypto.getRandomValues(b); } catch (e) { for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256); }
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function ahora() {
    var d = new Date(), local = '';
    try { local = d.toLocaleString('es-CO', { timeZone: 'America/Bogota', hour12: false }) + ' (hora de Colombia)'; } catch (e) {}
    return { iso: d.toISOString(), local: local };
  }
  function leer() {
    try { var r = JSON.parse(localStorage.getItem(CLAVE) || 'null'); return r && r.id ? r : null; } catch (e) { return null; }
  }
  function guardar(analitica) {
    var t = ahora();
    var r = { id: uuid(), fecha: t.iso, fechaLocal: t.local, version: VERSION, necesarias: true, analitica: !!analitica };
    try { localStorage.setItem(CLAVE, JSON.stringify(r)); } catch (e) {}
    return r;
  }

  // gtag nunca envía nada sin consentimiento: los eventos del sitio se ignoran hasta que se acepta.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { var c = leer(); if (c && c.analitica && cargado) dataLayer.push(arguments); };

  function cargarAnalitica() {
    if (cargado) return;
    cargado = true;
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', GA, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var g = document.createElement('script');
    g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(g);
    var m = document.createElement('script');
    m.src = 'https://tracker.metricool.com/resources/be.js';
    m.onload = function () { try { beTracker.t({ hash: METRICOOL }); } catch (e) {} };
    document.head.appendChild(m);
  }

  function retirarAnalitica() {
    // Borra las cookies de Analytics de este dominio. La carga se detiene al recargar la página.
    var host = location.hostname.split('.');
    var bases = [location.hostname, '.' + location.hostname];
    if (host.length > 2) bases.push('.' + host.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^_ga($|_)|^_gid$|^_gat|^_mb|^mb_/.test(n)) bases.forEach(function (d) { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d; document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; });
    });
  }

  // ---------- Aviso de cookies ----------
  var estilo = '' +
    '.pl-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:520px;margin:0 auto 0 0;background:#111114;color:#f1f0f2;border:1px solid #34323c;border-radius:10px;padding:16px 18px;font:400 13px/1.55 Montserrat,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.45)}' +
    '.pl-cookies p{margin:0 0 12px;color:#d7d6dc}.pl-cookies a{color:#fff;text-decoration:underline}' +
    '.pl-cookies__fila{display:flex;gap:10px;flex-wrap:wrap}' +
    '.pl-cookies button{flex:1 1 150px;min-height:42px;padding:0 14px;border-radius:4px;border:1px solid rgba(241,240,242,.4);background:transparent;color:#f1f0f2;font:600 11px/1 Montserrat,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}' +
    '.pl-cookies button:hover{border-color:#f1f0f2;background:rgba(241,240,242,.1)}.pl-cookies button:focus-visible{outline:2px solid #7ee8ff;outline-offset:2px}' +
    '.pl-legal{position:fixed;left:12px;bottom:2px;z-index:900;font:500 10px/1.4 Montserrat,system-ui,sans-serif;letter-spacing:.04em;color:#8d8c96;display:flex;gap:10px;flex-wrap:wrap;max-width:calc(100vw - 24px)}' +
    '.pl-legal a,.pl-legal button{color:inherit;text-decoration:none;background:none;border:0;padding:2px 0;font:inherit;letter-spacing:inherit;cursor:pointer}.pl-legal a:hover,.pl-legal button:hover{color:#fff;text-decoration:underline}' +
    ':root[data-theme="light"] .pl-legal{color:#55535c}:root[data-theme="light"] .pl-legal a:hover,:root[data-theme="light"] .pl-legal button:hover{color:#000}' +
    '.pl-legal-pie{display:flex;gap:14px;flex-wrap:wrap}.pl-legal-pie a,.pl-legal-pie button{color:inherit;background:none;border:0;padding:0;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}' +
    '@media(max-width:600px){.pl-cookies{left:10px;right:10px;bottom:10px;padding:14px}}';

  function aviso() {
    if (document.getElementById('pl-cookies')) return;
    var d = document.createElement('div');
    d.id = 'pl-cookies'; d.className = 'pl-cookies'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML = '<p>Usamos cookies necesarias para que el sitio funcione y, con su permiso, cookies opcionales: analítica (Google Analytics y Metricool) para saber qué páginas se visitan y contenido de Pinterest. Puede cambiar su decisión cuando quiera. <a href="cookies.html">Política de cookies</a></p>' +
      '<div class="pl-cookies__fila"><button type="button" data-d="no">Solo necesarias</button><button type="button" data-d="si">Aceptar todas</button></div>';
    d.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-d]'); if (!b) return;
      decidir(b.getAttribute('data-d') === 'si');
      d.remove();
    });
    document.body.appendChild(d);
  }
  function decidir(si) {
    var previo = leer();
    var r = guardar(si);
    if (si) cargarAnalitica();
    else if (previo && previo.analitica) { retirarAnalitica(); }
    try { document.dispatchEvent(new CustomEvent('pl:consent', { detail: r })); } catch (e) {}
    return r;
  }

  // ---------- Enlaces legales ----------
  function enlaces() {
    var html = '<a href="terminos.html">Términos y condiciones</a><a href="privacidad.html">Política de privacidad</a><a href="cookies.html">Cookies</a><a href="reembolso.html">Reembolsos</a><button type="button" data-pl="cookies">Preferencias de cookies</button>';
    var pie = document.querySelector('footer.pie-home');
    if (pie) {
      var n = document.createElement('span'); n.className = 'pl-legal-pie'; n.innerHTML = html; pie.appendChild(n); pie.style.flexWrap = 'wrap';
    } else if (!document.querySelector('.pl-legal') && !/^\/?(terminos|privacidad|cookies|reembolso)\.html$/.test(location.pathname)) {
      var f = document.createElement('nav'); f.className = 'pl-legal'; f.setAttribute('aria-label', 'Información legal'); f.innerHTML = html; document.body.appendChild(f);
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-pl="cookies"]'); if (!b) return;
      e.preventDefault();
      var a = document.getElementById('pl-cookies'); if (a) a.remove(); aviso();
    });
  }

  function iniciar() {
    var s = document.createElement('style'); s.textContent = estilo; document.head.appendChild(s);
    enlaces();
    var c = leer();
    if (!c) aviso();
    else if (c.analitica) cargarAnalitica();
  }

  // Prueba de aceptación para los formularios: quién, cuándo, qué versión y desde dónde.
  window.PL_LEGAL = {
    version: VERSION,
    consentimientoCookies: function () { return leer(); },
    prueba: function (formulario, textos) {
      var t = ahora(), c = leer();
      return {
        id: uuid(),
        formulario: formulario,
        fecha_utc: t.iso,
        fecha_colombia: t.local,
        version_documentos: VERSION,
        terminos: { aceptado: true, url: location.origin + '/terminos.html', texto_casilla: textos.terminos },
        privacidad: { aceptado: true, url: location.origin + '/privacidad.html', texto_casilla: textos.privacidad },
        pagina: location.href,
        origen: document.referrer || '',
        idioma: navigator.language || '',
        zona_horaria: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })(),
        navegador: navigator.userAgent,
        cookies_consentimiento_id: c ? c.id : '',
        cookies_analitica: c ? c.analitica : null
      };
    },
    resumen: function (p) {
      return 'CONSENTIMIENTO ' + p.id + ' | ' + p.fecha_utc + ' UTC | docs v' + p.version_documentos + ' | terminos=SI | privacidad=SI | ' + p.pagina;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
