/*
  Integrações:
  - Configure os endpoints abaixo para produção.
  - O front está preparado para fallback em mock quando a API não está disponível.
*/
const BRAMBATTI_CONFIG = {
  googleReviewsEndpoint: "",
  instagramEndpoint: "",
  facebookEndpoint: ""
};

const mockReviews = [
  {
    name: "Carla M.",
    rating: 5,
    comment: "Atendimento impecável. Tudo muito bem explicado e o resultado estético ficou natural."
  },
  {
    name: "João P.",
    rating: 5,
    comment: "Ambiente muito confortável, equipe atenciosa e excelente tecnologia na avaliação."
  },
  {
    name: "Vanessa R.",
    rating: 5,
    comment: "Fiz clareamento e amei o resultado. Profissionais cuidadosos e muito humanos."
  },
  {
    name: "Lucas F.",
    rating: 5,
    comment: "Planejamento completo e transparente. Me senti seguro em cada etapa do tratamento."
  },
  {
    name: "Patrícia S.",
    rating: 5,
    comment: "Clínica linda, atendimento no horário e ótima experiência do início ao fim."
  },
  {
    name: "Bruno T.",
    rating: 5,
    comment: "Excelente equipe. Resolvi uma reabilitação com conforto e confiança."
  }
];

const mockInstagram = [
  {
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=700&q=80",
    caption: "Antes e depois com naturalidade.",
    url: "https://www.instagram.com/brambatti_odontologia/"
  },
  {
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=700&q=80",
    caption: "Clareamento com planejamento individual.",
    url: "https://www.instagram.com/brambatti_odontologia/"
  },
  {
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=700&q=80",
    caption: "Ambiente pensado para seu conforto.",
    url: "https://www.instagram.com/brambatti_odontologia/"
  },
  {
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=700&q=80",
    caption: "Recepção acolhedora e atendimento humanizado.",
    url: "https://www.instagram.com/brambatti_odontologia/"
  },
  {
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=700&q=80",
    caption: "Equipe preparada para transformar sorrisos.",
    url: "https://www.instagram.com/brambatti_odontologia/"
  },
  {
    image: "https://images.unsplash.com/photo-1666214280775-2dbf3a6b9e77?auto=format&fit=crop&w=700&q=80",
    caption: "Estética avançada com segurança clínica.",
    url: "https://www.instagram.com/brambatti_odontologia/"
  }
];

const mockFacebook = [
  {
    title: "Novidade na clínica",
    text: "Agenda aberta para avaliação estética personalizada com foco em naturalidade.",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80",
    date: "Atualizado recentemente",
    url: "https://www.facebook.com/brambattiodontologia/"
  },
  {
    title: "Dica de cuidado diário",
    text: "Pequenos hábitos fazem diferença na saúde bucal e na durabilidade dos tratamentos.",
    image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80",
    date: "Post institucional",
    url: "https://www.facebook.com/brambattiodontologia/"
  }
];

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stars(rating = 5) {
  const count = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return `${"★".repeat(count)}${"☆".repeat(5 - count)}`;
}

function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");

  if (!toggle || !nav) return;

  function closeMenu() {
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const opening = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", opening);
    toggle.classList.toggle("is-open", opening);
    toggle.setAttribute("aria-expanded", String(opening));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) closeMenu();
  });
}

function initHeaderState() {
  const header = document.getElementById("site-header");
  const hero = document.getElementById("home");
  if (!header || !hero) return;

  const setHeader = () => {
    const threshold = hero.offsetHeight * 0.22;
    header.classList.toggle("is-solid", window.scrollY > threshold);
  };

  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });
  window.addEventListener("resize", setHeader);
}

function initRevealAnimations() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  revealEls.forEach((el, idx) => {
    const delay = Math.min((idx % 7) * 70, 340);
    el.style.transitionDelay = `${delay}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.2 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initHeroParallax() {
  const stack = document.querySelector(".hero-photo-stack");
  if (!stack) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const pics = stack.querySelectorAll("img");
  if (!pics.length) return;

  let rafId = null;
  stack.addEventListener("mousemove", (event) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const bounds = stack.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      pics[0].style.transform = `translate3d(${x * 8}px, ${y * 10}px, 0) rotate(${x * 2.2}deg)`;
      if (pics[1]) {
        pics[1].style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0) rotate(${x * -2.8}deg)`;
      }
    });
  });

  stack.addEventListener("mouseleave", () => {
    pics.forEach((img) => {
      img.style.transform = "";
    });
  });
}

function renderReviews(items) {
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;

  const safeItems = Array.isArray(items) ? items.slice(0, 6) : [];
  grid.innerHTML = safeItems
    .map((item) => {
      const name = escapeHtml(item.name || "Paciente");
      const rating = Number(item.rating || 5);
      const comment = escapeHtml(item.comment || "");
      return `
        <article class="review-card reveal is-visible">
          <header>
            <h3>${name}</h3>
            <span class="rating" aria-label="Avaliação ${rating} de 5">${stars(rating)}</span>
          </header>
          <p>${comment}</p>
        </article>
      `;
    })
    .join("");
}

async function loadReviews() {
  const status = document.getElementById("reviews-status");
  const endpoint = BRAMBATTI_CONFIG.googleReviewsEndpoint?.trim();

  if (!endpoint) {
    renderReviews(mockReviews);
    return;
  }

  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const reviews = Array.isArray(data) ? data : data.reviews;

    if (!Array.isArray(reviews) || !reviews.length) throw new Error("Sem avaliações");

    renderReviews(reviews);
    if (status) status.textContent = "Avaliações carregadas com sucesso da integração configurada.";
  } catch (error) {
    renderReviews(mockReviews);
    if (status) status.textContent = "Falha na integração de avaliações. Exibindo conteúdo mock.";
    console.warn("Erro ao carregar avaliações:", error);
  }
}

function renderInstagram(items) {
  const grid = document.getElementById("instagram-grid");
  if (!grid) return;

  const safeItems = Array.isArray(items) ? items.slice(0, 6) : [];
  grid.innerHTML = safeItems
    .map((post) => {
      const image = escapeHtml(post.image || "");
      const caption = escapeHtml(post.caption || "Post do Instagram");
      const url = escapeHtml(post.url || "https://www.instagram.com/brambatti_odontologia/");
      return `
        <a class="post-card reveal is-visible" href="${url}" data-caption="${caption}" target="_blank" rel="noopener noreferrer" aria-label="${caption}">
          <img src="${image}" alt="${caption}" loading="lazy">
        </a>
      `;
    })
    .join("");
}

async function loadInstagram() {
  const status = document.getElementById("instagram-status");
  const endpoint = BRAMBATTI_CONFIG.instagramEndpoint?.trim();

  if (!endpoint) {
    renderInstagram(mockInstagram);
    return;
  }

  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const posts = Array.isArray(data) ? data : data.posts;
    if (!Array.isArray(posts) || !posts.length) throw new Error("Sem posts");

    renderInstagram(posts);
    if (status) status.textContent = "Feed do Instagram carregado da integração configurada.";
  } catch (error) {
    renderInstagram(mockInstagram);
    if (status) status.textContent = "Falha na integração do Instagram. Exibindo conteúdo mock.";
    console.warn("Erro ao carregar Instagram:", error);
  }
}

function renderFacebook(items) {
  const feed = document.getElementById("facebook-feed");
  if (!feed) return;

  const safeItems = Array.isArray(items) ? items.slice(0, 3) : [];
  feed.innerHTML = safeItems
    .map((post) => {
      const title = escapeHtml(post.title || "Destaque");
      const text = escapeHtml(post.text || "");
      const image = escapeHtml(post.image || "");
      const url = escapeHtml(post.url || "https://www.facebook.com/brambattiodontologia/");
      const date = escapeHtml(post.date || "Atualizado");

      return `
        <a href="${url}" class="facebook-card reveal is-visible" target="_blank" rel="noopener noreferrer">
          <img src="${image}" alt="${title}" loading="lazy">
          <div class="content">
            <h4>${title}</h4>
            <p>${text}</p>
            <time>${date}</time>
          </div>
        </a>
      `;
    })
    .join("");
}

async function loadFacebook() {
  const status = document.getElementById("facebook-status");
  const endpoint = BRAMBATTI_CONFIG.facebookEndpoint?.trim();

  if (!endpoint) {
    renderFacebook(mockFacebook);
    return;
  }

  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const posts = Array.isArray(data) ? data : data.posts;
    if (!Array.isArray(posts) || !posts.length) throw new Error("Sem posts");

    renderFacebook(posts);
    if (status) status.textContent = "Conteúdo do Facebook carregado da integração configurada.";
  } catch (error) {
    renderFacebook(mockFacebook);
    if (status) status.textContent = "Falha na integração do Facebook. Exibindo conteúdo mock.";
    console.warn("Erro ao carregar Facebook:", error);
  }
}

function setFooterYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function init() {
  initMenu();
  initHeaderState();
  initRevealAnimations();
  initHeroParallax();
  setFooterYear();
  loadReviews();
  loadInstagram();
  loadFacebook();
}

document.addEventListener("DOMContentLoaded", init);
