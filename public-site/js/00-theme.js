/* Selector de tema claro/oscuro manual. */

   function applyStoredTheme() {
  const saved = localStorage.getItem("save_theme");
  if (saved === "dark" || saved === "light") {
    document.documentElement.setAttribute("data-theme", saved);
  }
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme")
    || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("save_theme", next);
}
applyStoredTheme();
