// Hero WebGL "concreto cromado": lámpara curva que pasa de cromo iridiscente a concreto crudo.
// Three.js se carga diferido y solo si hay WebGL y el usuario no pidió menos movimiento.

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const stage = document.querySelector('[data-y2k-hero]');

if (stage && !matchMedia('(prefers-reduced-motion: reduce)').matches && tieneWebGL()) {
  const iniciar = () => import(THREE_URL).then(montar).catch(() => {});
  const programar = () => ('requestIdleCallback' in window ? requestIdleCallback(iniciar, { timeout: 2500 }) : setTimeout(iniciar, 800));
  if (document.readyState === 'complete') programar();
  else addEventListener('load', programar, { once: true });
}

function tieneWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

const VERTEX = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vV;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vP = position;
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uMix;
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vV;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 4; i++) {
      s += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    if (!gl_FrontFacing) N = -N;
    vec3 L = normalize(vec3(0.5, 0.8, 0.6));

    // Cromo líquido: entorno procedural con horizonte duro + iridiscencia plata -> lila -> cian
    vec3 R = reflect(-V, N);
    float h = R.y * 0.5 + 0.5;
    vec3 env = mix(vec3(0.07, 0.07, 0.11), vec3(0.96, 0.97, 1.0), smoothstep(0.26, 0.66, h));
    float tira1 = smoothstep(0.78, 0.94, sin(R.x * 2.6 + uTime * 0.35 + 0.8) * 0.5 + 0.5);
    float tira2 = smoothstep(0.86, 0.98, sin(R.z * 3.4 - uTime * 0.22) * 0.5 + 0.5);
    env += vec3(1.0) * tira1 * 0.55 + vec3(0.8, 0.85, 1.0) * tira2 * 0.35;
    float fr = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fr * 1.1 + vec3(0.0, 0.33, 0.67) + R.y * 0.3));
    irid = mix(vec3(0.76, 0.79, 0.86), irid, 0.55);
    vec3 chrome = env * irid * 1.12 + irid * fr * 0.35;

    // Concreto crudo: gris poroso con iluminación difusa
    float n1 = fbm(vP * 3.2);
    float n2 = fbm(vP * 11.0 + 7.0);
    vec3 conc = vec3(0.54, 0.54, 0.52) * (0.72 + 0.55 * n1);
    conc *= 1.0 - 0.62 * smoothstep(0.64, 0.70, n2);
    conc *= max(dot(N, L), 0.0) * 0.8 + 0.26;

    // El cromo se transforma en concreto siguiendo un frente de ruido
    float front = fbm(vP * 1.6 + 3.0);
    float m = smoothstep(front - 0.12, front + 0.12, uMix * 1.25 - 0.12);
    float borde = smoothstep(0.0, 0.5, 1.0 - abs(m - 0.5) * 2.0);
    vec3 col = mix(chrome, conc, m) + irid * borde * 0.28;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function montar(THREE) {
  const canvas = stage.querySelector('canvas');
  const movil = matchMedia('(max-width: 768px)').matches || matchMedia('(pointer: coarse)').matches;
  const sinHover = matchMedia('(hover: none)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !movil, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.9, 7.2);
  camera.lookAt(0, 0.05, 0);

  // Perfil de la lámpara curva (radio, altura): base, cuello, boca abocinada, borde y cavidad interior
  const V2 = (r, y) => new THREE.Vector2(r, y);
  const exterior = new THREE.SplineCurve([V2(0.46, -1.7), V2(0.44, -1.2), V2(0.34, -0.3), V2(0.36, 0.45), V2(0.58, 1.15), V2(1.0, 1.75)]).getPoints(movil ? 28 : 56);
  const interior = new THREE.SplineCurve([V2(0.92, 1.74), V2(0.56, 1.14), V2(0.34, 0.7)]).getPoints(movil ? 12 : 24);
  const perfil = [V2(0.001, -1.7), ...exterior, V2(1.02, 1.78), V2(0.98, 1.8), ...interior, V2(0.001, 0.62)];
  const geometria = new THREE.LatheGeometry(perfil, movil ? 40 : 88);

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: { uMix: { value: 0 }, uTime: { value: 0 } },
    side: THREE.DoubleSide
  });
  const lampara = new THREE.Mesh(geometria, material);
  lampara.rotation.x = 0.16;
  scene.add(lampara);

  function ajustar() {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera); // setSize borra el lienzo: se vuelve a dibujar de inmediato
  }
  new ResizeObserver(ajustar).observe(stage);
  ajustar();

  let encima = false;
  let objetivoX = 0;
  let objetivoY = 0;
  stage.addEventListener('pointerenter', () => { encima = true; });
  stage.addEventListener('pointerleave', () => { encima = false; objetivoX = 0; objetivoY = 0; });
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    objetivoY = ((e.clientX - r.left) / r.width - 0.5) * 0.9;
    objetivoX = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
  });

  let visible = true;
  let pestana = !document.hidden;
  let activo = false;
  let mezcla = 0;
  let giro = 0;
  let suaveY = 0;
  let previo = performance.now();

  function cuadro(ahora) {
    if (!(visible && pestana)) { activo = false; return; }
    const dt = Math.min(0.05, (ahora - previo) / 1000);
    previo = ahora;
    const t = ahora / 1000;

    const progreso = Math.min(1, Math.max(0, window.scrollY / Math.max(1, stage.offsetHeight * 0.9)));
    let objetivo = Math.max(encima ? 1 : 0, progreso * 1.2);
    if (sinHover) objetivo = Math.max(objetivo, 0.5 + 0.5 * Math.sin(t * 0.55 - 1.4));
    mezcla += (Math.min(1, objetivo) - mezcla) * 0.06;

    giro += dt * 0.28;
    suaveY += (objetivoY - suaveY) * 0.06;
    lampara.rotation.y = giro + suaveY;
    lampara.rotation.x += ((0.16 + objetivoX) - lampara.rotation.x) * 0.05;
    material.uniforms.uMix.value = mezcla;
    material.uniforms.uTime.value = t;
    renderer.render(scene, camera);
    requestAnimationFrame(cuadro);
  }
  function arrancar() {
    if (activo || !(visible && pestana)) return;
    activo = true;
    previo = performance.now();
    requestAnimationFrame(cuadro);
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) arrancar(); }, { threshold: 0 }).observe(stage);
  document.addEventListener('visibilitychange', () => { pestana = !document.hidden; if (pestana) arrancar(); });

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); visible = false; stage.classList.remove('is-live'); });

  renderer.render(scene, camera);
  stage.classList.add('is-live');
  arrancar();
}
