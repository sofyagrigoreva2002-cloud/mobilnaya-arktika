const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector("#mobile-nav");
const demoForm = document.querySelector("[data-demo-form]");
const pageProgress = document.querySelector("[data-page-progress]");

const updatePageState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (pageProgress) pageProgress.style.width = `${Math.min(progress, 100)}%`;
};

updatePageState();
window.addEventListener("scroll", updatePageState, { passive: true });
window.addEventListener("resize", updatePageState, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileNav.hidden = isOpen;
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton?.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
  document.body.classList.remove("menu-open");
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 55}ms`;
  revealObserver.observe(element);
});

const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
const navSections = [...document.querySelectorAll("[data-nav-section]")];
if (navSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${current.target.id}`));
  }, { rootMargin: "-30% 0px -55%", threshold: [0, .2, .5] });
  navSections.forEach((section) => navObserver.observe(section));
}

const systemContent = {
  living: { number: "01", title: "Жильё и быт", copy: "Место, где команда может жить, отдыхать и решать бытовые вопросы во время работы на удалённой площадке." },
  work: { number: "02", title: "Рабочие помещения", copy: "Модули под конкретную задачу: для оборудования, хранения, ремонта, исследований или обработки данных." },
  energy: { number: "03", title: "Энергия и связь", copy: "Электроснабжение и каналы связи, необходимые людям и оборудованию вдали от постоянной инфраструктуры." },
  transport: { number: "04", title: "Вездеходная платформа", copy: "Доставляет людей, грузы и модули туда, где нет дорог, а затем помогает перевезти базу на новую площадку." }
};

const systemTabs = [...document.querySelectorAll("[data-system-tab]")];
systemTabs.forEach((tab) => tab.addEventListener("click", () => {
  const item = systemContent[tab.dataset.systemTab];
  if (!item) return;
  systemTabs.forEach((button) => {
    const active = button === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  const number = document.querySelector("[data-system-number]");
  const title = document.querySelector("[data-system-title]");
  const copy = document.querySelector("[data-system-copy]");
  if (number) number.textContent = item.number;
  if (title) title.textContent = item.title;
  if (copy) copy.textContent = item.copy;
}));

const slider = document.querySelector("[data-news-slider]");
const track = slider?.querySelector("[data-news-track]");
const slides = track ? [...track.querySelectorAll(".news-slide")] : [];
const currentLabel = slider?.querySelector("[data-news-current]");
const totalLabel = slider?.querySelector("[data-news-total]");
const sliderProgress = slider?.querySelector("[data-news-progress]");

const currentSlide = () => {
  if (!track || !slides.length) return 0;
  return slides.reduce((closest, slide, index) => Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[closest].offsetLeft - track.scrollLeft) ? index : closest, 0);
};

const updateSlider = () => {
  const index = currentSlide();
  if (currentLabel) currentLabel.textContent = String(index + 1).padStart(2, "0");
  if (totalLabel) totalLabel.textContent = String(slides.length).padStart(2, "0");
  if (sliderProgress) sliderProgress.style.width = `${((index + 1) / slides.length) * 100}%`;
};

const goToSlide = (index) => {
  if (!track || !slides.length) return;
  const wrapped = (index + slides.length) % slides.length;
  track.scrollTo({ left: slides[wrapped].offsetLeft, behavior: "smooth" });
};

slider?.querySelector("[data-news-prev]")?.addEventListener("click", () => goToSlide(currentSlide() - 1));
slider?.querySelector("[data-news-next]")?.addEventListener("click", () => goToSlide(currentSlide() + 1));
slider?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") { event.preventDefault(); goToSlide(currentSlide() - 1); }
  if (event.key === "ArrowRight") { event.preventDefault(); goToSlide(currentSlide() + 1); }
});

let scrollTimer;
track?.addEventListener("scroll", () => {
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(updateSlider, 80);
}, { passive: true });

let dragging = false;
let dragMoved = false;
let dragStart = 0;
let scrollStart = 0;
track?.addEventListener("pointerdown", (event) => {
  dragging = true;
  dragMoved = false;
  dragStart = event.clientX;
  scrollStart = track.scrollLeft;
  track.classList.add("is-dragging");
  track.setPointerCapture(event.pointerId);
});
track?.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  if (Math.abs(event.clientX - dragStart) > 6) dragMoved = true;
  track.scrollLeft = scrollStart - (event.clientX - dragStart);
});
const finishDrag = () => { dragging = false; track?.classList.remove("is-dragging"); window.setTimeout(() => { dragMoved = false; }, 0); };
track?.addEventListener("pointerup", finishDrag);
track?.addEventListener("pointercancel", finishDrag);
track?.addEventListener("click", (event) => { if (dragMoved) event.preventDefault(); }, true);
updateSlider();

demoForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const success = demoForm.querySelector(".form-success");
  if (success) success.hidden = false;
});
