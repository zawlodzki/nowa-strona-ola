# Kontener GTM Oli przed uruchomieniem pomiaru

`ola-container.json` jest ponownym eksportem rzeczywistego workspace 5
`Nowa strona Ola • c15t 2026-10-11` w kontenerze `GTM-PWBRPZ29`.
11.10.2026 wykonano import do osobnego workspace i dodano natywny tag
zdarzenia GA4 przez interfejs GTM. Plik odzwierciedla zapisany stan.
Domyślny workspace 4 oraz opublikowana wersja 3 pozostają bez zmian.
Nie opublikowano nowej wersji kontenera. Pomiar pozostaje wyłączony.

[Workspace migracji w GTM](https://tagmanager.google.com/?hl=pl#/container/accounts/6057592803/containers/197326666/workspaces/5/tags)
zawiera dwa wstrzymane tagi, dwie reguły, trzy zmienne użytkownika i dwie
zmienne wbudowane. Nie zawiera szablonów niestandardowych.
Kopia starego workspace znajduje się poza repo w
`/private/tmp/ola-gtm-backup-workspace4.json`.

## Tagi i warunki uruchomienia

Natywny Google tag `googtag`, ID 51, używa `G-9QW05JYZTL`.
Wyłącza `send_page_view`, Google Signals i personalizację reklam.
Natywny tag zdarzenia GA4 `gaawe`, ID 53, wysyła ręczny `page_view`
do tej samej usługi i wyłącza wysyłkę e-commerce. Oba tagi mają
`paused: true` i dodatkowy wymóg `analytics_storage`.

Google tag otrzymuje syntetyczne `page_location`
`https://aleksandraolesiewicz.com/__measurement/{{AO page code}}`.
Tag zdarzenia otrzymuje
`https://aleksandraolesiewicz.com/m/{{AO page code}}`.
Oba używają wyłącznie kontrolowanego kodu jako `page_title` oraz pustego
`page_referrer`. Nie przekazują rzeczywistego adresu, query ani danych formularza.
Ustawienia tagów nie potwierdzają retencji lub wyłączenia enhanced measurement
w samej usłudze GA4.

Reguły wymagają jednocześnie:

- zdarzenia `consent-update` dla Google tagu albo `ao_page_view` dla tagu GA4;
- hosta `aleksandraolesiewicz.com` bez stagingu;
- wartości `ao_measurement` równej `true`;
- stałej `AO rollout approved` równej `true`, obecnie `false`.

Pusta allowlista klienta oraz `PUBLIC_GTM_ENABLED=false` blokują loader
kontenera także po udzieleniu zgód. Consent Mode posiada klient Astro/c15t.
Nowy workspace nie zawiera `All Pages`, automatycznych zdarzeń, tagów
Consent Mode, zapisu `client_id` do formularzy, Google Ads, Conversion
Linkera, Meta ani Clarity. Stare osiem tagów zastąpiono wyłącznie w workspace
migracji. Nie zmieniono kontenera zawlodzki.pl.

## Warunki odbioru pomiaru

Przed uruchomieniem tagów pozostają do wykonania:

- kontrola usługi i strumienia GA4, retencji dwóch miesięcy, Google Signals,
  personalizacji reklam, braku User-ID i wyłączenia automatycznego pomiaru;
- zatwierdzenie neutralnych treści oraz ich odcisków w allowliście klienta;
- dodanie tych samych kontrolowanych kodów stron jako jawnego warunku reguł GTM;
- test z blokadami sieci lub w izolowanej usłudze pomiarowej, bez wysyłki
  do produkcyjnej usługi GA4;
- kontrola kolejności default, update, loader i pojedynczego `page_view`,
  payloadów, cofnięcia zgody i braku żądań na wykluczonych trasach;
- odbiór w Tag Assistant oraz osobno zlecona publikacja kontenera.

Meta i Clarity wymagają osobnego odbioru projektu, retencji i maskowania.
Nowy workspace nie ma ich tagów. Pełne warunki opisuje
[plan wdrożenia](../../docs/GTM-C15T-DEPLOYMENT-PLAN.md).

## Źródło i zakres weryfikacji

Aktualny plik pochodzi z eksportu workspace 5 po zapisie obu natywnych tagów
w interfejsie GTM. Importer przyjął konfigurację. Utworzenie `gaawe` w GTM
usunęło wcześniejszą lukę, gdy plik miał wyłącznie `googtag` i nieprzypisaną
regułę `ao_page_view`.

Starszy eksport `GTM-P5V3CJ5_v50.json` zawlodzki.pl służył do potwierdzenia
formatu stałej i dodatkowej zgody. Nie przeniesiono z niego ID usług ani tagów.
Pole `paused` opisuje
[schemat Google Tag Manager](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces.tags).
Eksport i zapis konfiguracji nie dowodzą działania pomiaru. Tagów nie
uruchomiono, nie wykonano jeszcze odbioru rzeczywistej usługi GA4.

Obecny runtime przekazuje pusty odcisk do `resolveTrackingPolicy`, a rejestr
zatwierdzonych treści jest pusty. Aktywacja wymaga także przekazania rzeczywistego,
sprawdzonego odcisku treści ze strony. Samo ustawienie flagi i wznowienie tagów
nie stanowi ukończenia pomiaru.
