/* global document, window, ResizeObserver, URLSearchParams, requestAnimationFrame */
// Tylko lokalne interakcje makiet. Brak fetch, analityki i zapisu danych.
const root = document.documentElement;
const preference = window.matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let manualTheme = false;

function applyTheme(dark) {
  root.dataset.theme = dark ? "dark" : "light";
  const button = document.querySelector(".theme-toggle");
  if (button) button.setAttribute("aria-pressed", String(dark));
}
applyTheme(preference.matches);
preference.addEventListener("change", (event) => {
  if (!manualTheme) applyTheme(event.matches);
});
document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  manualTheme = true;
  applyTheme(root.dataset.theme !== "dark");
});

for (const menu of document.querySelectorAll(".mobile-menu")) {
  const trigger = menu.querySelector("summary");
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      trigger.focus();
    }
  });
  for (const link of menu.querySelectorAll("a")) {
    link.addEventListener("click", () => {
      menu.open = false;
      trigger.focus();
    });
  }
  document.addEventListener("click", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
}

for (const track of document.querySelectorAll(".carousel-track")) {
  const controls = [
    ...document.querySelectorAll(`[data-carousel="${track.id}"]`),
  ];
  const position = document.querySelector(`[data-position-for="${track.id}"]`);
  const items = [...track.children];
  const groups =
    track.id === "books-track"
      ? [...document.querySelectorAll("[data-book-group]")]
      : [];
  let updatePending = false;
  const update = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    for (const control of controls) {
      const direction = Number(control.dataset.direction);
      control.disabled =
        direction < 0
          ? track.scrollLeft < 2
          : track.scrollLeft >= maxScroll - 2;
    }
    if (position) {
      const gap = parseFloat(window.getComputedStyle(track).columnGap);
      const itemWidth = items[0].getBoundingClientRect().width;
      // WebKit może jeszcze nie mieć geometrii podczas pierwszego odczytu.
      // ResizeObserver ponowi aktualizację, gdy układ będzie gotowy.
      if (!Number.isFinite(gap) || itemWidth <= 0) {
        updatePending = false;
        return;
      }
      const first = Math.max(
        1,
        Math.min(
          items.length,
          Math.round(track.scrollLeft / (itemWidth + gap)) + 1,
        ),
      );
      const visible = Math.max(
        1,
        Math.floor((track.clientWidth + gap) / (itemWidth + gap)),
      );
      const last = Math.min(items.length, first + visible - 1);
      position.textContent = `${first}${last > first ? `–${last}` : ""} z ${items.length}`;
      const topic = items[first - 1].dataset.bookTopic;
      for (const group of groups) {
        if (group.dataset.bookGroup === topic)
          group.setAttribute("aria-current", "true");
        else group.removeAttribute("aria-current");
      }
    }
    updatePending = false;
  };
  for (const group of groups) {
    group.addEventListener("click", (event) => {
      event.preventDefault();
      const item = items.find(
        (candidate) => candidate.dataset.bookTopic === group.dataset.bookGroup,
      );
      track.scrollTo({
        left: item.offsetLeft - items[0].offsetLeft,
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
    });
  }
  const queueUpdate = () => {
    if (!updatePending) {
      updatePending = true;
      requestAnimationFrame(update);
    }
  };
  for (const control of controls) {
    control.addEventListener("click", () => {
      const distance =
        track.clientWidth +
        parseFloat(window.getComputedStyle(track).columnGap);
      track.scrollBy({
        left: distance * Number(control.dataset.direction),
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
    });
  }
  track.addEventListener("keydown", (event) => {
    // Linki w kartach zachowują swoje natywne zachowanie.
    if (event.target !== track) return;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      track.scrollTo({
        left: event.key === "Home" ? 0 : track.scrollWidth,
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
    }
  });
  track.addEventListener("scroll", queueUpdate, { passive: true });
  new ResizeObserver(queueUpdate).observe(track);
  update();
}

for (const form of document.querySelectorAll(".newsletter-form")) {
  const email = form.querySelector('[name="email"]');
  const consent = form.querySelector('[name="consent"]');
  const emailError = form.querySelector("#email-error");
  const consentError = form.querySelector("#consent-error");
  const status = form.querySelector(".form-status");
  function validate(field, error, valid) {
    field.setAttribute("aria-invalid", String(!valid));
    error.hidden = valid;
    return valid;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    const emailValid = validate(
      email,
      emailError,
      email.value.trim() !== "" && email.validity.valid,
    );
    const consentValid = validate(consent, consentError, consent.checked);
    if (!emailValid) {
      email.focus();
      return;
    }
    if (!consentValid) {
      consent.focus();
      return;
    }
    status.textContent =
      "Podgląd: formularz jest poprawny. Nic nie wysłano ani nie zapisano.";
  });
  email.addEventListener("blur", () => {
    if (email.value || email.hasAttribute("aria-invalid")) {
      validate(
        email,
        emailError,
        email.value.trim() !== "" && email.validity.valid,
      );
    }
  });
  consent.addEventListener("change", () => {
    if (consent.hasAttribute("aria-invalid"))
      validate(consent, consentError, consent.checked);
    status.textContent = "";
  });
  email.addEventListener("input", () => {
    status.textContent = "";
  });
  // Bez JS formularz jest wyłączony: nie nastąpi nawet przypadkowy GET z danymi.
  for (const input of form.querySelectorAll("input,button"))
    input.disabled = false;
}

const previewTitle = document.querySelector("#preview-title");
if (previewTitle) {
  const params = new URLSearchParams(window.location.search);
  const pages = {
    "blog-badania": [
      "Wyniki badań: co zabrać na konsultację?",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-regularnosc": [
      "Regularne posiłki, kiedy każdy dzień wygląda inaczej",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-io": [
      "Insulinooporność: od czego zacząć rozmowę o odżywianiu?",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-suplementy": [
      "Suplementy w PCOS: uporządkuj pytania, zanim kupisz",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-notatki": [
      "Dzienniczek posiłków bez presji perfekcji",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-cele": [
      "Co chcesz zmienić? Jak nazwać cel konsultacji",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-zakupy": [
      "Zakupy spożywcze dopasowane do Twojego tygodnia",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-rady": [
      "Sprzeczne rady o PCOS: zapisz to, co chcesz wyjaśnić",
      "Przykładowy wpis kolekcji bloga 3a. Ta makieta pokazuje układ listy; treść artykułu wymaga przygotowania i akceptacji redakcyjnej.",
    ],
    "blog-posilki": [
      "Codzienne posiłki przy PCOS: zacznij od swojego rytmu",
      "Przykładowy powiązany artykuł do oceny makiety. Docelowa treść i adres wymagają przygotowania w CMS.",
    ],
    "blog-pytania": [
      "Jak uporządkować pytania o PCOS przed wizytą?",
      "Przykładowy powiązany artykuł do oceny makiety. Docelowa treść i adres wymagają przygotowania w CMS.",
    ],
    "o-mnie": [
      "O mnie",
      "Tutaj znajdzie się historia Aleksandry, jej podejście do pracy i potwierdzone kwalifikacje.",
    ],
    konsultacje: [
      "Konsultacje online",
      "Tutaj znajdą się zakres konsultacji, przebieg współpracy, ceny i rezerwacja terminu.",
    ],
    prywatnosc: [
      "Polityka prywatności",
      "Treść informacyjna i zgody zostaną przygotowane przed uruchomieniem docelowego formularza.",
    ],
    regulamin: [
      "Regulamin",
      "Regulamin sklepu i usług wymaga ustalenia finalnej oferty.",
    ],
    instagram: [
      "Instagram",
      "Tutaj zostanie podłączony potwierdzony profil Aleksandry na Instagramie.",
    ],
    facebook: [
      "Facebook",
      "Tutaj zostanie podłączony potwierdzony profil Aleksandry na Facebooku.",
    ],
    tiktok: [
      "TikTok",
      "Tutaj zostanie podłączony potwierdzony profil Aleksandry na TikToku.",
    ],
  };
  const books = {
    "pcos-suplementy": [
      "Suplementy w PCOS",
      "Audyt szafki z suplementami, karty decyzji i pytania do specjalisty.",
    ],
    "pcos-badania": [
      "PCOS: badania, które mają sens",
      "Przewodnik po badaniach, terminach i przygotowaniu do wizyty.",
    ],
    "pcos-szczupla": [
      "Szczupła, a jednak PCOS",
      "Praktyczny materiał o odżywianiu przy PCOS bez celu redukcji masy ciała.",
    ],
    "peri-waga": [
      "Waga Cię okłamuje",
      "Ośmiotygodniowa karta obserwacji: energia, siła i codzienne posiłki.",
    ],
    "peri-dziennik": [
      "Czy to już? 12 tygodni zamiast zgadywania",
      "Dziennik objawów i cykli z podsumowaniem na wizytę u lekarza.",
    ],
    "peri-noc": [
      "Noc zaczyna się o osiemnastej",
      "Cztery tygodnie obserwacji kolacji, kofeiny, alkoholu i rytmu dnia.",
    ],
  };
  const detail = books[params.get("produkt")] || pages[params.get("strona")];
  if (detail) {
    previewTitle.textContent = detail[0];
    document.querySelector("#preview-description").textContent = detail[1];
  }
  if (params.has("produkt")) {
    document.querySelector("#preview-detail").textContent =
      "Koncepcja z researchu. Robocza cena: około 100 zł. E-book i zakup nie są jeszcze dostępne w tej makiecie.";
  }
  // Powrót wyłącznie do lokalnej propozycji albo podstrony bloga 3a.
  const match = document.referrer.match(
    /\/(wonderful(?:-cherry)?|botanical(?:-white)?|cherry(?:-white)?|blog-3a(?:-page-2)?)\.html(?:[?#]|$)/,
  );
  if (match)
    document.querySelector("#back-to-design").href = `${match[1]}.html`;
}
