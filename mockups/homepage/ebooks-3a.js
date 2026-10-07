/* global document, window, URL */
// Natywne radio + CSS filtrują również bez JS. JS dodaje adres i komunikat.
const categoryInputs = Array.from(
  document.querySelectorAll('input[name="category"]'),
);
const filterStatus = document.querySelector("#filter-status");
const categoryMessages = {
  all: "Wyświetlono wszystkie 6 e-booków.",
  pcos: "Wyświetlono 3 e-booki z kategorii PCOS.",
  perimenopause: "Wyświetlono 3 e-booki z kategorii Perimenopauza.",
};
function readCategoryFromUrl() {
  const value =
    new URL(window.location.href).searchParams.get("kategoria") || "all";
  const selected =
    categoryInputs.find((input) => input.value === value) || categoryInputs[0];
  if (selected) selected.checked = true;
  if (filterStatus && selected)
    filterStatus.textContent = categoryMessages[selected.value];
}
for (const input of categoryInputs) {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    const url = new URL(window.location.href);
    if (input.value === "all") url.searchParams.delete("kategoria");
    else url.searchParams.set("kategoria", input.value);
    window.history.pushState(null, "", url);
    if (filterStatus) filterStatus.textContent = categoryMessages[input.value];
  });
}
readCategoryFromUrl();
window.addEventListener("popstate", readCategoryFromUrl);
