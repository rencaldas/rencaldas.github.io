const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeThumb = document.querySelector(".theme-toggle-thumb");
const themeSun = document.querySelector(".theme-icon-sun");
const themeMoon = document.querySelector(".theme-icon-moon");
let themeAnimationTimer;

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Alternar para tema claro" : "Alternar para tema escuro");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", isDark ? "#0b1220" : "#f7f5ef");
};

applyTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");

const animateThemeToggle = (fromTheme, toTheme) => {
  if (!themeThumb || typeof themeThumb.animate !== "function") return;

  const travel = Number.parseFloat(getComputedStyle(themeThumb).getPropertyValue("--theme-thumb-travel")) || 30;
  const fromPosition = fromTheme === "dark" ? travel : 0;
  const toPosition = toTheme === "dark" ? travel : 0;
  const overshoot = toTheme === "dark" ? 4 : -4;

  themeThumb.getAnimations().forEach((animation) => animation.cancel());
  themeThumb.animate(
    [
      { transform: `translateX(${fromPosition}px) scale(1)` },
      { offset: 0.68, transform: `translateX(${toPosition + overshoot}px) scale(1.06)` },
      { transform: `translateX(${toPosition}px) scale(1)` },
    ],
    { duration: 580, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
  );

  const sunOpacity = { dark: 0.42, light: 1 };
  const moonOpacity = { dark: 1, light: 0.44 };
  [
    [themeSun, sunOpacity],
    [themeMoon, moonOpacity],
  ].forEach(([icon, opacity]) => {
    if (!icon || typeof icon.animate !== "function") return;
    icon.getAnimations().forEach((animation) => animation.cancel());
    icon.animate([{ opacity: opacity[fromTheme] }, { opacity: opacity[toTheme] }], {
      duration: 360,
      easing: "ease-out",
    });
  });
};

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const theme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(theme);
  animateThemeToggle(currentTheme, theme);
  themeToggle.classList.remove("is-switching");
  void themeToggle.offsetWidth;
  themeToggle.classList.add("is-switching");
  clearTimeout(themeAnimationTimer);
  themeAnimationTimer = window.setTimeout(() => themeToggle.classList.remove("is-switching"), 560);
  try {
    localStorage.setItem("rencaldas-theme", theme);
  } catch {
    // A interface continua funcional mesmo se o navegador bloquear o armazenamento local.
  }
});

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});
