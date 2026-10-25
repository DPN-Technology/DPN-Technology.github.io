/* DPN v5.3 — lightweight, local-only frontier filters. Static cards remain visible without JS. */
(() => {
  "use strict";
  const root = document.getElementById("frontiers");
  if (!root) return;
  const buttons = [...root.querySelectorAll("[data-frontier-filter]")];
  const cards = [...root.querySelectorAll(".frontier-card[data-kind]")];
  const count = root.querySelector("#frontier-count");
  const apply = (filter) => {
    let visible = 0;
    cards.forEach(card => {
      const categories = (card.dataset.group || "").split(/\s+/);
      const show = filter === "all" || categories.includes(filter);
      card.hidden = !show;
      if (show) visible++;
    });
    buttons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.frontierFilter === filter));
    });
    if (count) count.textContent = visible + " TRACK" + (visible === 1 ? "" : "S") + " SHOWN";
  };
  buttons.forEach(button => button.addEventListener("click", () => apply(button.dataset.frontierFilter)));
  apply("all");
})();
