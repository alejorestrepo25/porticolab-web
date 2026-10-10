// Fondo en píxeles: las fotos se ven normales y, al pasar el puntero, el FONDO se vuelve un mosaico de
// píxeles mientras el objeto (lo que hay en el centro, distinto del borde de la foto) queda nítido.
// En pantallas táctiles, sin "hover", el efecto se activa cuando la foto queda en la franja central
// de la pantalla al hacer scroll.
// El objeto se detecta en el navegador comparando cada punto con los colores del borde de la foto
// (no hay modelo de IA ni servidor). Si la imagen no permite leer sus píxeles (sin CORS), queda la foto.
(() => {
  const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Táctil: se activa la tarjeta que cruza la franja central (38 % - 62 % de la altura de la pantalla)
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

  const ANCHO = 320;      // resolución del lienzo que se superpone a la foto
  const ANCHO_MASCARA = 96; // resolución con la que se separa objeto y fondo
  const COLUMNAS = 28;    // cuántos "píxeles" de ancho tiene el mosaico del fondo
  const procesadas = new WeakSet();
  const chica = url => url.replace(/([?&])w=\d+/, '$1w=320');

  // ---------- Separar objeto y fondo ----------
  // Devuelve una máscara (1 = objeto, 0 = fondo) de ancho x alto.
  function mascaraDelObjeto(px, an, al) {
    const n = an * al;
    // 1) Colores del borde de la foto = el fondo probable (3 grupos por k-means)
    const grosor = Math.max(3, Math.round(an * 0.07));
    const muestras = [];
    for (let y = 0; y < al; y++) {
      for (let x = 0; x < an; x++) {
        if (x < grosor || y < grosor || x >= an - grosor || y >= al - grosor) {
          const i = (y * an + x) * 4;
          muestras.push([px[i], px[i + 1], px[i + 2]]);
        }
      }
    }
    muestras.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]));
    const K = 3;
    let centros = [0, 1, 2].map(k => muestras[Math.floor((k + 0.5) * muestras.length / K)].slice());
    let asigna = new Array(muestras.length).fill(0);
    const d2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
    for (let it = 0; it < 6; it++) {
      muestras.forEach((p, j) => {
        let mejor = 0, md = Infinity;
        centros.forEach((c, k) => { const d = d2(p, c); if (d < md) { md = d; mejor = k; } });
        asigna[j] = mejor;
      });
      centros = centros.map((c, k) => {
        const s = [0, 0, 0]; let m = 0;
        muestras.forEach((p, j) => { if (asigna[j] === k) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; m++; } });
        return m ? [s[0] / m, s[1] / m, s[2] / m] : c;
      });
    }
    const sigma = centros.map((c, k) => {
      let s = 0, m = 0;
      muestras.forEach((p, j) => { if (asigna[j] === k) { s += Math.sqrt(d2(p, c)); m++; } });
      return (m ? s / m : 10) + 14;
    });

    // 2) Qué tan distinto del fondo es cada punto, con preferencia por el centro
    const puntaje = new Float32Array(n);
    let maximo = 0;
    for (let y = 0; y < al; y++) {
      for (let x = 0; x < an; x++) {
        const i = (y * an + x) * 4;
        const p = [px[i], px[i + 1], px[i + 2]];
        let d = Infinity;
        centros.forEach((c, k) => { d = Math.min(d, Math.sqrt(d2(p, c)) / sigma[k]); });
        const dx = (x / an - 0.5) * 2, dy = (y / al - 0.5) * 2;
        const centro = 0.55 + 0.45 * Math.exp(-((dx / 0.7) ** 2 + (dy / 0.7) ** 2));
        const v = d * centro;
        puntaje[y * an + x] = v;
        if (v > maximo) maximo = v;
      }
    }

    // 3) Umbral de Otsu
    const BINS = 64;
    const hist = new Array(BINS).fill(0);
    for (let i = 0; i < n; i++) hist[Math.min(BINS - 1, Math.floor(puntaje[i] / (maximo || 1) * BINS))]++;
    let sumaTotal = 0;
    hist.forEach((h, b) => { sumaTotal += b * h; });
    let wB = 0, sB = 0, mejorVar = -1, umbral = 0;
    for (let b = 0; b < BINS; b++) {
      wB += hist[b];
      if (!wB) continue;
      const wF = n - wB;
      if (!wF) break;
      sB += b * hist[b];
      const mB = sB / wB, mF = (sumaTotal - sB) / wF;
      const v = wB * wF * (mB - mF) ** 2;
      if (v > mejorVar) { mejorVar = v; umbral = b; }
    }
    const corte = (umbral + 1) / BINS * maximo;
    let obj = new Uint8Array(n);
    for (let i = 0; i < n; i++) obj[i] = puntaje[i] > corte ? 1 : 0;

    // 4) Quedarse con las manchas grandes (y la que está en el centro), descartar motas
    const etiqueta = new Int32Array(n).fill(-1);
    const areas = [];
    const toca = [];
    for (let s = 0; s < n; s++) {
      if (!obj[s] || etiqueta[s] >= 0) continue;
      const id = areas.length;
      let area = 0, centrada = false;
      const pila = [s];
      etiqueta[s] = id;
      while (pila.length) {
        const q = pila.pop();
        area++;
        const x = q % an, y = (q / an) | 0;
        if (Math.abs(x / an - 0.5) < 0.18 && Math.abs(y / al - 0.5) < 0.18) centrada = true;
        if (x > 0 && obj[q - 1] && etiqueta[q - 1] < 0) { etiqueta[q - 1] = id; pila.push(q - 1); }
        if (x < an - 1 && obj[q + 1] && etiqueta[q + 1] < 0) { etiqueta[q + 1] = id; pila.push(q + 1); }
        if (y > 0 && obj[q - an] && etiqueta[q - an] < 0) { etiqueta[q - an] = id; pila.push(q - an); }
        if (y < al - 1 && obj[q + an] && etiqueta[q + an] < 0) { etiqueta[q + an] = id; pila.push(q + an); }
      }
      areas.push(area);
      toca.push(centrada);
    }
    const mayor = Math.max(0, ...areas);
    obj = obj.map((v, i) => (v && (areas[etiqueta[i]] >= mayor * 0.2 || (toca[etiqueta[i]] && areas[etiqueta[i]] >= n * 0.01)) ? 1 : 0));

    // 5) Rellenar huecos: el fondo que no se conecta con el borde de la foto es parte del objeto
    const fuera = new Uint8Array(n);
    const pila = [];
    const semilla = i => { if (!obj[i] && !fuera[i]) { fuera[i] = 1; pila.push(i); } };
    for (let x = 0; x < an; x++) { semilla(x); semilla((al - 1) * an + x); }
    for (let y = 0; y < al; y++) { semilla(y * an); semilla(y * an + an - 1); }
    while (pila.length) {
      const q = pila.pop();
      const x = q % an, y = (q / an) | 0;
      if (x > 0) semilla(q - 1);
      if (x < an - 1) semilla(q + 1);
      if (y > 0) semilla(q - an);
      if (y < al - 1) semilla(q + an);
    }
    for (let i = 0; i < n; i++) obj[i] = fuera[i] ? 0 : 1;

    // 6) Engordar un poco el objeto para que el borde del fondo no le muerda los bordes
    for (let it = 0; it < 2; it++) {
      const copia = obj.slice();
      for (let y = 1; y < al - 1; y++) {
        for (let x = 1; x < an - 1; x++) {
          const q = y * an + x;
          if (!copia[q] && (copia[q - 1] || copia[q + 1] || copia[q - an] || copia[q + an])) obj[q] = 1;
        }
      }
    }

    // 7) Si la detección no tiene sentido (casi nada o casi todo), se protege una elipse central
    let cubierto = 0;
    for (let i = 0; i < n; i++) cubierto += obj[i];
    if (cubierto < n * 0.05 || cubierto > n * 0.9) {
      for (let y = 0; y < al; y++) {
        for (let x = 0; x < an; x++) {
          const dx = (x / an - 0.5) / 0.36, dy = (y / al - 0.5) / 0.4;
          obj[y * an + x] = dx * dx + dy * dy < 1 ? 1 : 0;
        }
      }
    }
    return obj;
  }

  // ---------- Lienzo: mosaico solo donde está el fondo ----------
  function pintar(img, origen) {
    const alto = Math.max(1, Math.round(ANCHO * origen.naturalHeight / origen.naturalWidth));
    const lienzo = document.createElement('canvas');
    lienzo.width = ANCHO;
    lienzo.height = alto;
    lienzo.className = 'fondo-pixel';
    lienzo.setAttribute('aria-hidden', 'true');
    const ctx = lienzo.getContext('2d', { willReadFrequently: true });

    // a) la máscara del objeto, calculada en baja resolución
    const aM = ANCHO_MASCARA, hM = Math.max(1, Math.round(ANCHO_MASCARA * alto / ANCHO));
    const pequeno = document.createElement('canvas');
    pequeno.width = aM;
    pequeno.height = hM;
    const cp = pequeno.getContext('2d', { willReadFrequently: true });
    cp.drawImage(origen, 0, 0, aM, hM);
    const obj = mascaraDelObjeto(cp.getImageData(0, 0, aM, hM).data, aM, hM);
    const imgMascara = cp.createImageData(aM, hM);
    for (let i = 0; i < obj.length; i++) {
      imgMascara.data[i * 4 + 3] = obj[i] ? 0 : 255;   // opaco = fondo (se pixela), transparente = objeto
    }
    cp.putImageData(imgMascara, 0, 0);

    // b) el mosaico: la foto reducida y ampliada sin suavizar
    const cols = COLUMNAS, filas = Math.max(1, Math.round(COLUMNAS * alto / ANCHO));
    const mosaico = document.createElement('canvas');
    mosaico.width = cols;
    mosaico.height = filas;
    mosaico.getContext('2d').drawImage(origen, 0, 0, cols, filas);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mosaico, 0, 0, ANCHO, alto);

    // c) recortar el mosaico con la máscara (el objeto queda transparente y se ve la foto nítida)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(pequeno, 0, 0, ANCHO, alto);
    ctx.globalCompositeOperation = 'source-over';

    const marco = img.parentElement;
    marco.classList.add('fondo-pixel-wrap');
    marco.appendChild(lienzo);
    const tarjeta = img.closest('.gallery-item, figure, .dither-scope');
    if (!conMouse && tarjeta) { tarjetas.add(tarjeta); pedirRevision(); }
  }

  function procesar(img) {
    if (procesadas.has(img) || !img.src) return;
    procesadas.add(img);
    // Las láminas vectoriales (PNG) no llevan fondo fotográfico: se dejan como están
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
