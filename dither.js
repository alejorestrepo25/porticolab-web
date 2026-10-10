// Dithering "concreto cromado": las fotos se ven como una trama de puntos (Bayer 4x4) con degradado
// plata -> lila -> cian y pasan a la foto real al pasar el mouse. En pantallas táctiles, que no tienen
// "hover", la foto se revela cuando queda en la franja central de la pantalla al hacer scroll.
// Si la imagen no permite leer sus píxeles (sin CORS), se deja la foto tal cual.
(() => {
  const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Táctil: se revela la tarjeta que cruza la franja central (38 % - 62 % de la altura de la pantalla)
  const tarjetas = new Set();
  let pendiente = false;
  function revisar() {
    pendiente = false;
    const a = innerHeight * 0.38;
    const b = innerHeight * 0.62;
    tarjetas.forEach(t => {
      const r = t.getBoundingClientRect();
      t.classList.toggle('revelado', r.top < b && r.bottom > a);
    });
  }
  function pedirRevision() {
    if (!pendiente) { pendiente = true; setTimeout(revisar, 60); }
  }
  if (!conMouse) {
    addEventListener('scroll', pedirRevision, { passive: true });
    addEventListener('resize', pedirRevision);
  }

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const ANCHO = 120;
  const PLATA = [232, 232, 238];
  const LILA = [185, 167, 255];
  const CIAN = [126, 232, 255];
  const procesadas = new WeakSet();

  const mezclar = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const cromo = t => (t < 0.5 ? mezclar(PLATA, LILA, t * 2) : mezclar(LILA, CIAN, (t - 0.5) * 2));
  const chica = url => url.replace(/([?&])w=\d+/, '$1w=240');

  function pintar(img, origen) {
    const alto = Math.max(1, Math.round(ANCHO * origen.naturalHeight / origen.naturalWidth));
    const lienzo = document.createElement('canvas');
    lienzo.width = ANCHO;
    lienzo.height = alto;
    lienzo.className = 'dither';
    lienzo.setAttribute('aria-hidden', 'true');
    const ctx = lienzo.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(origen, 0, 0, ANCHO, alto);
    const datos = ctx.getImageData(0, 0, ANCHO, alto);
    const px = datos.data;
    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ANCHO; x++) {
        const i = (y * ANCHO + x) * 4;
        let l = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
        l = Math.min(1, Math.max(0, (l - 0.5) * 1.3 + 0.5));
        const encendido = l > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
        const c = encendido ? cromo((x / ANCHO + y / alto) / 2) : [8, 8, 14];
        px[i] = c[0];
        px[i + 1] = c[1];
        px[i + 2] = c[2];
        px[i + 3] = 255;
      }
    }
    ctx.putImageData(datos, 0, 0);
    const marco = img.parentElement;
    marco.classList.add('dither-wrap');
    marco.appendChild(lienzo);
    const tarjeta = img.closest('.gallery-item, figure, .dither-scope');
    if (!conMouse && tarjeta) { tarjetas.add(tarjeta); pedirRevision(); }
  }

  function procesar(img) {
    if (procesadas.has(img) || !img.src) return;
    procesadas.add(img);
    // Las láminas vectoriales (PNG) ya tienen el estilo y pierden legibilidad con la trama
    if (/\.png(\?|$)/i.test(img.src)) return;
    const origen = new Image();
    origen.crossOrigin = 'anonymous';
    origen.onload = () => { try { pintar(img, origen); } catch (e) { /* sin CORS: queda la foto */ } };
    origen.src = chica(img.currentSrc || img.src);
  }

  // Cola: una imagen cada 40 ms para no competir con la carga de la página
  const cola = [];
  let drenando = false;
  function drenar() {
    const img = cola.shift();
    if (img) procesar(img);
    if (cola.length) setTimeout(drenar, 40);
    else drenando = false;
  }
  function registrar(img) {
    if (procesadas.has(img) || cola.includes(img)) return;
    cola.push(img);
    if (!drenando) { drenando = true; setTimeout(drenar, 0); }
  }

  const SELECTOR = '.gallery-item img, img[data-dither]';
  const barrer = raiz => {
    if (raiz.matches && raiz.matches(SELECTOR)) registrar(raiz);
    if (raiz.querySelectorAll) raiz.querySelectorAll(SELECTOR).forEach(registrar);
  };

  barrer(document);
  new MutationObserver(cambios => cambios.forEach(c => c.addedNodes.forEach(n => { if (n.nodeType === 1) barrer(n); })))
    .observe(document.body, { childList: true, subtree: true });
})();
