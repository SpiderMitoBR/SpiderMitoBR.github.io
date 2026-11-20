// Bruno Areal (marca fictícia) · comportamento compartilhado
document.documentElement.classList.remove('no-js');

// Na versão real, este é o número do consultor (ex.: "5511999999999"). Vazio = o WhatsApp pede o contato.
const FONE = "";
const wa = (t) => `https://wa.me/${FONE}?text=${encodeURIComponent(t)}`;
document.querySelectorAll('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || 'Olá, Bruno. Vim pelo site e queria conversar sobre os dados da minha empresa.'); });

// menu no celular
const mb = document.querySelector('.menu-btn'), menu = document.querySelector('.menu');
if (mb && menu) {
  mb.addEventListener('click', () => { const ab = menu.classList.toggle('aberto'); mb.setAttribute('aria-expanded', ab); mb.textContent = ab ? 'Fechar' : 'Menu'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aberto')) { menu.classList.remove('aberto'); mb.setAttribute('aria-expanded', false); mb.textContent = 'Menu'; mb.focus(); } });
}

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// entradas escalonadas por seção
const revs = document.querySelectorAll('.rev');
if ('IntersectionObserver' in window && !reduz) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  revs.forEach(el => io.observe(el));
} else revs.forEach(el => el.classList.add('in'));

// nome gigante: escala ligada à rolagem (assinatura)
const nomes = [...document.querySelectorAll('[data-escala]')];
if (nomes.length && !reduz) {
  let tick = false;
  const upd = () => {
    const vh = innerHeight;
    nomes.forEach(n => {
      const r = n.getBoundingClientRect();
      let s;
      if (n.dataset.escala === 'sai') { const p = Math.min(Math.max(-r.top / vh, 0), 1); s = 1 - p * 0.07; }
      else { const p = Math.min(Math.max((vh - r.top) / vh, 0), 1); s = 0.93 + p * 0.07; }
      n.style.transform = `scale(${s.toFixed(4)})`;
    });
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}

// placar do topo: três números que deviam ser um
const placar = document.querySelector('.placar');
if (placar) {
  const bt = placar.querySelector('button'), dds = placar.querySelectorAll('.v'), nota = placar.querySelector('.placar-txt');
  const antes = [...dds].map(d => d.textContent);
  bt.addEventListener('click', () => {
    const ok = !placar.hasAttribute('data-ok');
    placar.toggleAttribute('data-ok', ok);
    dds.forEach((d, i) => d.textContent = ok ? 'R$ 4,82 mi' : antes[i]);
    nota.textContent = ok ? 'Depois: uma regra de receita, um número para todos.' : 'Receita de outubro, segundo cada área.';
    bt.textContent = ok ? 'Ver como era antes' : 'Ver depois da consultoria';
    bt.setAttribute('aria-pressed', ok);
  });
}

// chaves: o que muda quando os dados ficam em ordem
const bandas = [...document.querySelectorAll('.banda')];
const total = document.querySelector('[data-total]');
const somar = () => {
  if (!total) return;
  const h = bandas.filter(b => b.classList.contains('on')).reduce((s, b) => s + Number(b.dataset.horas), 0);
  total.textContent = h + ' h';
};
bandas.forEach(b => {
  const c = b.querySelector('.chave');
  const set = on => { b.classList.toggle('on', on); c.setAttribute('aria-checked', on); somar(); };
  c.addEventListener('click', () => set(c.getAttribute('aria-checked') !== 'true'));
  set(b.hasAttribute('data-on'));
});

// contato: horário + formulário que salva
const hs = document.querySelectorAll('.horarios button');
const campoH = document.querySelector('#horario');
hs.forEach(h => h.addEventListener('click', () => {
  hs.forEach(o => o.setAttribute('aria-pressed', 'false'));
  h.setAttribute('aria-pressed', 'true');
  if (campoH) campoH.value = h.dataset.h;
}));
const grade = document.querySelector('.horarios');
if (grade) {
  // próximos 3 dias úteis, 9h, 11h, 15h e 17h
  const dias = []; const d = new Date(); d.setHours(0, 0, 0, 0);
  while (dias.length < 3) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) dias.push(new Date(d)); }
  const nomeD = x => x.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '');
  grade.innerHTML = '';
  dias.forEach(x => ['9h', '11h', '15h', '17h'].forEach(hr => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.dataset.h = `${nomeD(x)} às ${hr}`; b.textContent = `${nomeD(x)}, ${hr}`;
    b.addEventListener('click', () => { grade.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); campoH.value = b.dataset.h; });
    grade.appendChild(b);
  }));
}
const form = document.querySelector('#form-contato');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const err = form.querySelector('.erro'); err.textContent = '';
    const dados = Object.fromEntries(new FormData(form));
    if (!dados.nome || !dados.email || !dados.empresa) { err.textContent = 'Preencha nome, empresa e e-mail.'; form.querySelector(':invalid')?.focus(); return; }
    if (!/^\S+@\S+\.\S+$/.test(dados.email)) { err.textContent = 'Confira o e-mail.'; form.email.focus(); return; }
    dados.quando = new Date().toISOString();
    // Na versão real, o contato vai para uma tabela (Supabase ou planilha) e chega por e-mail.
    try { const l = JSON.parse(localStorage.getItem('ba-contatos') || '[]'); l.push(dados); localStorage.setItem('ba-contatos', JSON.stringify(l)); } catch (_) {}
    const ok = document.querySelector('.ok-msg');
    ok.querySelector('[data-resumo]').textContent = dados.horario ? `Conversa marcada para ${dados.horario}. A confirmação chega em ${dados.email}.` : `Retorno em até 1 dia útil em ${dados.email}.`;
    ok.classList.add('mostra'); form.hidden = true; ok.querySelector('h2').focus();
  });
}
