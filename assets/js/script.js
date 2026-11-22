const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasIO = "IntersectionObserver" in window;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

/* ---------------------------------------------------------------- theme -- */

const themeToggle = document.querySelector("[data-theme-toggle]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeMeta?.setAttribute("content", theme === "dark" ? "#0c0c0b" : "#f4f3ef");
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
};

applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

themeToggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  const swap = () => applyTheme(next);

  // Troca de tema com transição circular a partir do botão, onde houver suporte.
  if (document.startViewTransition && !reducedMotion) {
    const rect = themeToggle.getBoundingClientRect();
    root.style.setProperty("--vt-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--vt-y", `${rect.top + rect.height / 2}px`);
    root.classList.add("is-theme-swap");
    document.startViewTransition(swap).finished.finally(() => root.classList.remove("is-theme-swap"));
  } else {
    swap();
  }

  try {
    localStorage.setItem("rencaldas-theme", next);
  } catch {
    /* preferência apenas nesta sessão */
  }
});

/* ---------------------------------------------------------- clock, year -- */

const clocks = document.querySelectorAll("[data-clock]");

if (clocks.length) {
  const format = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  const tick = () => clocks.forEach((el) => (el.textContent = format.format(new Date())));
  tick();
  setInterval(tick, 15000);
}

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));

/* ----------------------------------------------------------- split text -- */

// Quebra o texto em palavras mascaradas para a animação de subida. O título
// mantém o texto original em aria-label, então leitores de tela leem a frase
// inteira em vez de palavra por palavra.
const splitWords = (el) => {
  const label = el.textContent.replace(/\s+/g, " ").trim();
  let index = 0;

  const makeWord = () => {
    const outer = document.createElement("span");
    const inner = document.createElement("span");
    outer.className = "w";
    inner.className = "w-i";
    inner.style.setProperty("--wi", String(index++));
    outer.append(inner);
    return [outer, inner];
  };

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.append(document.createTextNode(" "));
            return;
          }
          const [outer, inner] = makeWord();
          inner.textContent = part;
          fragment.append(outer);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.matches("em, strong")) {
          walk(child);
        } else {
          const [outer, inner] = makeWord();
          child.replaceWith(outer);
          inner.append(child);
        }
      }
    });
  };

  walk(el);
  el.setAttribute("aria-label", label);
  el.querySelectorAll(".w").forEach((word) => word.setAttribute("aria-hidden", "true"));
};

if (!reducedMotion) document.querySelectorAll("[data-split]").forEach(splitWords);

/* ------------------------------------------------------- reveal on view -- */

const revealTargets = document.querySelectorAll("[data-reveal], [data-split], [data-clip]");

const startReveals = () => {
  if (reducedMotion || !hasIO) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((el) => observer.observe(el));
};

/* ---------------------------------------------------------------- intro -- */

const intro = document.querySelector("[data-intro]");

const finishIntro = () => {
  try {
    sessionStorage.setItem("rencaldas-intro", "1");
  } catch {
    /* sem storage: a intro volta a aparecer, sem prejuízo */
  }
  document.body.classList.remove("is-locked");
  startReveals();
};

if (intro && root.classList.contains("has-intro")) {
  const counter = intro.querySelector("[data-intro-count]");
  const duration = 1300;
  const start = performance.now();
  document.body.classList.add("is-locked");

  const step = (now) => {
    const t = clamp((now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    if (counter) counter.textContent = String(Math.round(eased * 100));

    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }

    intro.classList.add("is-leaving");
    // As palavras do herói começam a subir enquanto a cortina sai.
    setTimeout(finishIntro, 280);
    intro.addEventListener("transitionend", () => intro.remove(), { once: true });
    setTimeout(() => intro.remove(), 1600);
  };

  requestAnimationFrame(step);
} else {
  intro?.remove();
  startReveals();
}

/* --------------------------------------------------------------- header -- */

const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-progress]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-nav-toggle]");

let lastY = window.scrollY;
let scrollRange = 0;

const measureScrollRange = () => {
  scrollRange = document.documentElement.scrollHeight - window.innerHeight;
};

const updateHeader = (y) => {
  header?.classList.toggle("is-stuck", y > 24);
  const goingDown = y > lastY + 4;
  const goingUp = y < lastY - 4;
  const menuOpen = menu?.classList.contains("is-open");
  if (goingDown && y > 320 && !menuOpen) header?.classList.add("is-hidden");
  else if (goingUp || y < 320) header?.classList.remove("is-hidden");
  if (goingDown || goingUp) lastY = y;
  progress?.style.setProperty("--progress", scrollRange > 0 ? String(clamp(y / scrollRange)) : "0");
};

// Abrir um link do menu ou focar o header pelo teclado sempre o mostra.
header?.addEventListener("focusin", () => header.classList.remove("is-hidden"));

/* ----------------------------------------------------------- mobile menu -- */

const setMenu = (open) => {
  menu?.classList.toggle("is-open", open);
  document.body.classList.toggle("is-locked", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  if (open) {
    header?.classList.remove("is-hidden");
    setTimeout(() => menu?.querySelector("a")?.focus({ preventScroll: true }), 350);
  }
};

menuToggle?.addEventListener("click", () => setMenu(!menu?.classList.contains("is-open")));

menu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("is-open")) {
    setMenu(false);
    menuToggle?.focus();
  }
});

window.matchMedia("(min-width: 1181px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

/* ------------------------------------------------- nav pill + active link -- */

const nav = document.querySelector("[data-nav]");
const pill = document.querySelector("[data-nav-pill]");
const navLinks = [...document.querySelectorAll(".nav-link")];
let activeLink = null;

const movePill = (link) => {
  if (!nav || !pill) return;
  navLinks.forEach((item) => item.classList.toggle("is-pill", item === link));
  if (!link) {
    nav.style.setProperty("--pill-o", "0");
    return;
  }
  nav.style.setProperty("--pill-x", `${link.offsetLeft}px`);
  nav.style.setProperty("--pill-w", `${link.offsetWidth}px`);
  nav.style.setProperty("--pill-o", "1");
};

navLinks.forEach((link) => link.addEventListener("pointerenter", () => movePill(link)));
nav?.addEventListener("pointerleave", () => movePill(activeLink));

const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

if (sections.length && hasIO) {
  const visible = new Set();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      const current = sections.find((section) => visible.has(section.id))?.id;
      activeLink = navLinks.find((link) => link.getAttribute("href") === `#${current}`) ?? null;
      navLinks.forEach((link) => {
        if (link === activeLink) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      if (!nav?.matches(":hover")) movePill(activeLink);
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* --------------------------------------------------------- scroll scenes -- */

// Tudo que depende da posição de rolagem roda num único requestAnimationFrame.

const hero = document.querySelector("[data-hero]");

const highlightBlocks = [...document.querySelectorAll("[data-highlight]")].map((el) => {
  if (reducedMotion) return null;
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", words.join(" "));
  el.textContent = "";
  const spans = words.map((word, i) => {
    const span = document.createElement("span");
    span.className = "hl-w";
    span.setAttribute("aria-hidden", "true");
    span.textContent = word;
    el.append(span);
    if (i < words.length - 1) el.append(" ");
    return span;
  });
  return { el, spans, lit: -1 };
}).filter(Boolean);

const stack = document.querySelector("[data-stack]");
const stackCards = [...document.querySelectorAll("[data-stack-card]")];
const timeline = document.querySelector("[data-timeline]");
const parallaxImgs = [...document.querySelectorAll("[data-parallax-img]")];

// O empilhamento só liga se cada cartão couber inteiro na tela; senão o
// próximo cartão cobriria conteúdo que ainda não foi lido.
const updateStackMode = () => {
  if (!stack || reducedMotion) return;
  stack.classList.remove("is-stacking");
  const wide = window.matchMedia("(min-width: 1181px)").matches;
  const fits = stackCards.every((card) => card.offsetHeight < window.innerHeight - 140);
  stack.classList.toggle("is-stacking", wide && fits);
};

const updateScenes = () => {
  const vh = window.innerHeight;

  if (hero && !reducedMotion) {
    const p = clamp(window.scrollY / (hero.offsetHeight || vh));
    hero.style.setProperty("--hero-p", p.toFixed(3));
  }

  highlightBlocks.forEach((block) => {
    const rect = block.el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const p = clamp((vh * 0.85 - rect.top) / (vh * 0.85 - vh * 0.3 + rect.height * 0.5));
    const lit = Math.round(p * block.spans.length);
    if (lit === block.lit) return;
    block.lit = lit;
    block.spans.forEach((span, i) => span.classList.toggle("is-lit", i < lit));
  });

  if (stack?.classList.contains("is-stacking")) {
    stackCards.forEach((card, i) => {
      const next = stackCards[i + 1];
      if (!next) return;
      const cardRect = card.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      const covered = clamp(1 - (nextRect.top - cardRect.top) / cardRect.height);
      card.style.setProperty("--scale", (1 - covered * 0.06).toFixed(4));
      card.style.setProperty("--dim", (covered * 0.5).toFixed(3));
    });
  }

  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const p = reducedMotion ? 1 : clamp((vh * 0.65 - rect.top) / rect.height);
    timeline.style.setProperty("--line", p.toFixed(3));
  }

  if (!reducedMotion) {
    parallaxImgs.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = (rect.top + rect.height / 2 - vh / 2) / vh;
      img.style.translate = `0 ${(p * -40).toFixed(1)}px`;
    });
  }
};

let frameQueued = false;

const onScroll = () => {
  if (frameQueued) return;
  frameQueued = true;
  requestAnimationFrame(() => {
    frameQueued = false;
    const y = window.scrollY;
    updateHeader(y);
    updateScenes();
  });
};

measureScrollRange();
updateStackMode();
updateHeader(window.scrollY);
updateScenes();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  measureScrollRange();
  updateStackMode();
  movePill(activeLink);
  onScroll();
});
window.addEventListener("load", () => {
  measureScrollRange();
  updateStackMode();
  onScroll();
});

/* --------------------------------------------------------- process steps -- */

const process = document.querySelector("[data-process]");

if (process && hasIO) {
  const steps = [...process.querySelectorAll("[data-step]")];
  const num = process.querySelector("[data-process-num]");
  const bar = process.querySelector("[data-process-bar]");
  let current = -1;

  const activate = (index) => {
    if (index === current) return;
    current = index;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    bar?.style.setProperty("--step-p", String((index + 1) / steps.length));
    if (num) {
      num.textContent = String(index + 1).padStart(2, "0");
      num.classList.remove("is-swapping");
      void num.offsetWidth;
      num.classList.add("is-swapping");
    }
  };

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activate(steps.indexOf(entry.target));
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  steps.forEach((step) => stepObserver.observe(step));
  activate(0);
}

/* ------------------------------------------------------------ gh stars -- */

// Os números do HTML são o fallback: se a API estiver fora ou limitada, a
// página continua mostrando um valor.
const starChips = document.querySelectorAll("[data-stars]");

if (starChips.length) {
  fetch("https://api.github.com/users/rencaldas/repos?per_page=100")
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((repos) => {
      const counts = new Map(repos.map((repo) => [repo.name, repo.stargazers_count]));
      starChips.forEach((chip) => {
        const count = counts.get(chip.dataset.stars);
        if (count === undefined) return;
        chip.querySelector("b").textContent = String(count);
        chip.hidden = count === 0;
      });
    })
    .catch(() => {
      /* mantém os valores do HTML */
    });
}

/* -------------------------------------------------------------- marquee -- */

const marquee = document.querySelector("[data-marquee]");

if (marquee && !reducedMotion) {
  marquee.append(...[...marquee.children].map((child) => child.cloneNode(true)));
}

/* ------------------------------------------------------------- magnetic -- */

if (finePointer && !reducedMotion) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* ---------------------------------------------------------- copy e-mail -- */

const copyButton = document.querySelector("[data-copy]");

if (copyButton) {
  const copyLabel = copyButton.querySelector("[data-copy-label]");
  const copyStatus = document.querySelector("[data-copy-status]");
  const original = copyLabel?.textContent ?? "";
  let resetTimer = 0;

  copyButton.addEventListener("click", async () => {
    const value = copyButton.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      copyButton.classList.add("is-copied");
      if (copyLabel) copyLabel.textContent = "Copiado!";
      if (copyStatus) copyStatus.textContent = "E-mail copiado para a área de transferência.";
    } catch {
      if (copyLabel) copyLabel.textContent = "Não deu — use o link";
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyButton.classList.remove("is-copied");
      if (copyLabel) copyLabel.textContent = original;
      if (copyStatus) copyStatus.textContent = "";
    }, 2400);
  });
}

/* ----------------------------------------------------------------- form -- */

const form = document.querySelector("[data-form]");

if (form) {
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("[data-submit]");
  const submitMarkup = submit.innerHTML;
  const accessKey = form.querySelector("[data-access-key]").value.trim();

  const rules = {
    name: (value) => (value.trim().length >= 2 ? "" : "Informe seu nome."),
    email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Informe um e-mail válido."),
    message: (value) => (value.trim().length >= 12 ? "" : "Escreva ao menos 12 caracteres."),
  };

  const showError = (field, message) => {
    const slot = form.querySelector(`[data-error-for="${field.name}"]`);
    if (slot) slot.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const validateField = (field) => {
    const rule = rules[field.name];
    if (!rule) return true;
    const message = rule(field.value);
    showError(field, message);
    return !message;
  };

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    field?.addEventListener("blur", () => validateField(field));
    field?.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  const setStatus = (message, kind) => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${kind ? ` is-${kind}` : ""}`;
  };

  const mailtoFallback = (data) => {
    const body = `Nome: ${data.name}\nE-mail: ${data.email}\n\n${data.message}`;
    window.location.href = `mailto:renato.deacaldas@gmail.com?subject=${encodeURIComponent(
      "Contato pelo portfólio"
    )}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Campo-isca: só um bot preenche um input escondido fora da tela.
    if (form.elements.botcheck.value) {
      setStatus("Mensagem enviada. Obrigado!", "ok");
      form.reset();
      return;
    }

    const fields = Object.keys(rules).map((name) => form.elements[name]);
    const invalid = fields.filter((field) => !validateField(field));

    if (invalid.length) {
      setStatus("Revise os campos destacados antes de enviar.", "error");
      invalid[0].focus();
      return;
    }

    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
    };

    if (!accessKey) {
      setStatus("Abrindo seu aplicativo de e-mail com a mensagem preenchida…", "ok");
      mailtoFallback(data);
      return;
    }

    submit.setAttribute("aria-busy", "true");
    submit.textContent = "Enviando…";
    setStatus("");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: form.elements.subject.value,
          from_name: form.elements.from_name.value,
          ...data,
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("Mensagem enviada. Respondo em até dois dias úteis.", "ok");
      form.reset();
      fields.forEach((field) => showError(field, ""));
    } catch {
      setStatus("Não consegui enviar agora. Tente pelo e-mail renato.deacaldas@gmail.com.", "error");
    } finally {
      submit.removeAttribute("aria-busy");
      submit.innerHTML = submitMarkup;
    }
  });
}
