const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------------------------------------------------------------- theme -- */

const themeToggle = document.querySelector("[data-theme-toggle]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeMeta?.setAttribute("content", theme === "dark" ? "#05070d" : "#f7f8fc");
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
};

applyTheme(root.dataset.theme === "light" ? "light" : "dark");

themeToggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("rencaldas-theme", next);
  } catch {
    /* preferência apenas nesta sessão */
  }
});

/* --------------------------------------------------------------- header -- */

const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-progress]");

let scrollQueued = false;
let scrollRange = 0;

// Measured once instead of per scroll event: reading scrollHeight forces layout,
// and reveals only transform, so the document height does not move.
const measureScrollRange = () => {
  scrollRange = document.documentElement.scrollHeight - window.innerHeight;
};

const updateScroll = () => {
  scrollQueued = false;
  const y = window.scrollY;
  header?.classList.toggle("is-stuck", y > 16);
  progress?.style.setProperty("--progress", scrollRange > 0 ? String(Math.min(y / scrollRange, 1)) : "0");
};

const onScroll = () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateScroll);
};

measureScrollRange();
updateScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  measureScrollRange();
  onScroll();
});

/* ------------------------------------------------------------ navigation -- */

const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const setNav = (open) => {
  nav?.classList.toggle("is-open", open);
  document.body.classList.toggle("is-locked", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  navToggle?.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
};

navToggle?.addEventListener("click", () => setNav(!nav?.classList.contains("is-open")));

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setNav(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    setNav(false);
    navToggle?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!nav?.classList.contains("is-open")) return;
  if (!nav.contains(event.target) && !navToggle?.contains(event.target)) setNav(false);
});

/* --------------------------------------------------------------- reveal -- */

const revealTargets = document.querySelectorAll("[data-reveal]");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------------------------------- active link -- */

const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (sections.length && "IntersectionObserver" in window) {
  const visible = new Set();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      // Above the first section nothing intersects, so no link should look active.
      const current = sections.find((section) => visible.has(section.id))?.id;
      navLinks.forEach((link) =>
        link.classList.toggle("is-active", Boolean(current) && link.getAttribute("href") === `#${current}`)
      );
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ------------------------------------------------------------ spotlight -- */

if (window.matchMedia("(hover: hover)").matches) {
  let spotFrame = 0;
  let spot = null;

  document.addEventListener(
    "pointermove",
    (event) => {
      const panel = event.target.closest?.(".panel-lit");
      if (!panel) return;
      spot = { panel, x: event.clientX, y: event.clientY };
      if (spotFrame) return;
      spotFrame = requestAnimationFrame(() => {
        spotFrame = 0;
        const rect = spot.panel.getBoundingClientRect();
        spot.panel.style.setProperty("--mx", `${spot.x - rect.left}px`);
        spot.panel.style.setProperty("--my", `${spot.y - rect.top}px`);
      });
    },
    { passive: true }
  );
}

/* ------------------------------------------------------------- counters -- */

const counters = document.querySelectorAll("[data-count]");

const runCounter = (el) => {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix ?? "";
  const suffix = el.dataset.suffix ?? "";
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progressRatio = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressRatio, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progressRatio < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (counters.length && !reducedMotion.matches && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));
}

/* ------------------------------------------------------------ gh stars -- */

// The counts rendered in the HTML are the fallback: if the API is unreachable
// or rate-limited, the page still shows a number instead of an empty chip.
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

/* ---------------------------------------------------------- flowing title -- */

// background-clip:text repaints the whole heading each frame, so it only runs
// while the heading is actually on screen.
const flowTitle = document.querySelector(".gradient-flow");

if (flowTitle && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => {
      flowTitle.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    },
    { threshold: 0 }
  ).observe(flowTitle);
}

/* -------------------------------------------------------------- marquee -- */

const marquee = document.querySelector("[data-marquee]");

if (marquee && !reducedMotion.matches) {
  marquee.append(...[...marquee.children].map((child) => child.cloneNode(true)));
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
