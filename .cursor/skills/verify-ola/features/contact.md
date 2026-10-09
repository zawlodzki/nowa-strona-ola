# Kontakt 3a

Kontakt zawiera trzy pola, zdjęcie z profilami społecznościowymi, e-mail, dane firmy i osobny newsletter. Formularze walidują dane lokalnie bez wysyłki.

## Sub-features

Formularz kontaktowy, bezpośredni e-mail, social media, dane firmy i newsletter.

## How to get to it (user POV)

Z menu Kontakt lub Contact; bezpośrednio `/kontakt/` i `/en/contact/`.

## Driving it with verify-ola

Świeży build fixture, launch, browser start i doctor według SKILL.md.

- `browser goto --path /kontakt/`: H1 „Porozmawiajmy.”; trzy pola kontaktu.
- `browser click --role button --name "Sprawdź formularz" --exact`:
  błędny e-mail i temat, fokus na e-mailu.
- `browser fill --role textbox --name "E-mail" --exact --nth 0 --value "ola@example.com"`
- `browser fill --role textbox --name "Temat rozmowy" --exact --value "Pytanie o konsultację"`
- Telefon opcjonalny. „abcdef” ma wyświetlić błąd; „+48 500 600 700” przechodzi.
- Po sprawdzeniu poprawnych danych status zawiera „Dane poprawne. Nic nie wysłano.”
  Status newslettera pozostaje pusty.
- Bezpośredni link: `mailto:ola@aleksandraolesiewicz.com`.
- Pod zdjęciem nazwane linki Instagram, Facebook, TikTok. Dane Wellbiz i NIP widoczne.
- Zbierz ARIA, screenshot z H1 i `browser posts` (ma być `[]`).
- Powtórz `/en/contact/`, także bez JS: przyciski wyłączone, e-mail działa.
- Cleanup tylko własnego VERIFY_RUN_ID.

## Gotchas

Viewporty, CSS zoom, reduced motion, klawiatura i axe: Playwright
`tests/e2e/contact-3a.spec.ts`; CLI skilla nie ustawia viewportu.
