/* global document, window, navigator, URL, requestAnimationFrame, ResizeObserver */
// Interakcje artykułu: bez SDK społecznościowych, analityki i automatycznej wysyłki.
const shareTrigger = document.querySelector(".share-trigger");
const sharePanel = document.querySelector("#share-options");
const copyAction = document.querySelector('[data-share="copy"]');
const shareStatus = document.querySelector(".share-status");
const shareFallback = document.querySelector(".share-copy-fallback");
const shareInput = document.querySelector("#share-url");
const shareUrl = new URL(window.location.href);
shareUrl.hash = "";
shareUrl.search = "";
const articleTitle = document.querySelector("h1").textContent.trim();
const encodedUrl = encodeURIComponent(shareUrl.href);
document.querySelector('[data-share="email"]').href =
  `mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(`${articleTitle}\n${shareUrl.href}`)}`;
document.querySelector('[data-share="facebook"]').href =
  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
document.querySelector('[data-share="whatsapp"]').href =
  `https://wa.me/?text=${encodeURIComponent(`${articleTitle}\n${shareUrl.href}`)}`;
shareInput.value = shareUrl.href;
shareTrigger.disabled = false;
let closeTimer;
let sharePinned = false;
const shareOpen = () => sharePanel.matches(":popover-open");
function positionShare() {
  if (!shareOpen()) return;
  const rect = shareTrigger.getBoundingClientRect();
  const belowSpace = Math.max(1, window.innerHeight - rect.bottom - 24);
  const aboveSpace = Math.max(1, rect.top - 24);
  const placeBelow =
    sharePanel.scrollHeight <= belowSpace || belowSpace >= aboveSpace;
  // Także po dodaniu fallbacku panel nie może przykrywać swojego triggera.
  sharePanel.style.maxHeight = `${placeBelow ? belowSpace : aboveSpace}px`;
  const panelHeight = sharePanel.getBoundingClientRect().height;
  const panelWidth = sharePanel.getBoundingClientRect().width;
  const left = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - panelWidth - 16),
  );
  const top = placeBelow
    ? rect.bottom + 8
    : Math.max(16, rect.top - panelHeight - 8);
  sharePanel.style.left = `${left}px`;
  sharePanel.style.top = `${top}px`;
}
function openShare() {
  window.clearTimeout(closeTimer);
  if (!shareOpen()) sharePanel.showPopover();
  shareTrigger.setAttribute("aria-expanded", "true");
  positionShare();
}
function closeShare(restoreFocus = false) {
  window.clearTimeout(closeTimer);
  if (shareOpen()) sharePanel.hidePopover();
  sharePinned = false;
  shareTrigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) shareTrigger.focus();
}
function scheduleClose() {
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    if (!sharePinned && !sharePanel.contains(document.activeElement))
      closeShare();
  }, 180);
}
shareTrigger.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") openShare();
});
shareTrigger.addEventListener("pointerleave", scheduleClose);
sharePanel.addEventListener("pointerenter", () =>
  window.clearTimeout(closeTimer),
);
sharePanel.addEventListener("pointerleave", scheduleClose);
shareTrigger.addEventListener("click", (event) => {
  if (shareOpen() && sharePinned) closeShare();
  else {
    sharePinned = true;
    openShare();
    if (event.detail === 0) copyAction.focus();
  }
});
sharePanel.addEventListener("toggle", () => {
  shareTrigger.setAttribute("aria-expanded", String(shareOpen()));
  if (!shareOpen()) sharePinned = false;
});
sharePanel.addEventListener("focusout", (event) => {
  // WebKit może na mousedown przenieść fokus do body przed aktywacją przycisku.
  // Zamykamy dopiero przy przejściu do konkretnego elementu poza panelem.
  if (!event.relatedTarget) return;
  window.setTimeout(() => {
    if (
      !sharePanel.contains(document.activeElement) &&
      document.activeElement !== shareTrigger
    )
      closeShare();
  }, 0);
});
document
  .querySelector(".share-close")
  .addEventListener("click", () => closeShare(true));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && shareOpen()) {
    event.preventDefault();
    closeShare(
      sharePanel.contains(document.activeElement) ||
        document.activeElement === shareTrigger,
    );
  }
});
copyAction.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.href);
    shareStatus.textContent = "Link skopiowany.";
    shareFallback.hidden = true;
    positionShare();
  } catch {
    shareStatus.textContent =
      "Nie udało się skopiować automatycznie. Zaznaczony adres możesz skopiować ręcznie.";
    shareFallback.hidden = false;
    positionShare();
    shareInput.focus();
    shareInput.select();
  }
});
const recommendations = document.querySelector(".article-recommendations");
const recommendationsTrigger = document.querySelector(
  ".recommendations-trigger",
);
const recommendationsList = document.querySelector("#recommended-articles");
const articleBody = document.querySelector(".article-richtext");
recommendations.hidden = true;
recommendations.dataset.enhanced = "true";
recommendationsTrigger.disabled = false;
recommendationsTrigger.addEventListener("click", () => {
  const expanded =
    recommendationsTrigger.getAttribute("aria-expanded") !== "true";
  recommendationsTrigger.setAttribute("aria-expanded", String(expanded));
  recommendationsList.hidden = !expanded;
});
let scrollPending = false;
function updateReadingProgress() {
  const rect = articleBody.getBoundingClientRect();
  // Środek widoku przekracza 50% rich textu; hero, autor i e-booki nie liczą się.
  const reachedHalf = window.innerHeight / 2 >= rect.top + rect.height / 2;
  // Nie usuwaj panelu zawierającego fokus, gdy czytelnik wraca w górę.
  recommendations.hidden =
    !reachedHalf && !recommendations.contains(document.activeElement);
  positionShare();
  scrollPending = false;
}
function queueReadingProgress() {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(updateReadingProgress);
}
window.addEventListener("scroll", queueReadingProgress, { passive: true });
window.addEventListener("resize", queueReadingProgress);
new ResizeObserver(queueReadingProgress).observe(articleBody);
document.fonts.ready.then(queueReadingProgress);
updateReadingProgress();
