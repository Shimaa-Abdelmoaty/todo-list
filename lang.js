let currentLang = localStorage.getItem("lang") || "en";

async function loadLang(lang) {
  const response = await fetch(`lang-${lang}.json`);
  const translations = await response.json();

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });

  localStorage.setItem("lang", lang);
}

function setLang(lang) {
  loadLang(lang);
}

window.addEventListener("DOMContentLoaded", () => {
  loadLang(currentLang);
});
