import { PCOS_PRODUCTS } from "@/lib/checkout-products";

const benefits = {
  "ebook-01":
    "Uporządkuj pytania o suplementy, zanim dołożysz kolejny preparat.",
  "ebook-02": "Przygotuj się do rozmowy o badaniach i ich wynikach.",
  "ebook-03":
    "Przyjrzyj się PMOS\u00A0(PCOS) także wtedy, gdy masa ciała mieści się w normie.",
};
export const checkoutProducts = PCOS_PRODUCTS.map((product) => ({
  ...product,
  benefit: benefits[product.code],
}));

export const checkoutCopy = {
  crosssellKicker: "Uzupełnij swoją serię o PMOS\u00A0(PCOS)",
  crosssellTitle: "Dwa kolejne tematy. Jeden komplet dla Ciebie.",
  crosssellLead:
    "Pierwszy krok masz za sobą. Wybrałaś już e-book, który odpowiada na jedno z Twoich pytań. Teraz możesz dołączyć dwa pozostałe i spojrzeć na PMOS\u00A0(PCOS) z szerszej perspektywy.",
  empathy:
    "Sprzeczne porady potrafią utrudnić wybór, nawet gdy poświęcasz czas na szukanie informacji. Nie musisz wiedzieć wszystkiego od razu. Zacznij od tematu, którego potrzebujesz teraz.",
  mechanism:
    "Każdy e-book porządkuje inny temat. Możesz wracać do niego, gdy przygotowujesz pytania na konsultację lub chcesz lepiej zrozumieć zalecenia.",
  bundleTerms:
    "Oferta obejmuje wyłącznie zakup obu pozostałych e-booków razem. Nie można kupić jednego e-booka z tej oferty za 48,50 zł.",
  bundlePrice: "97 zł brutto za oba e-booki",
  bundleReference:
    "Po 48,50 zł za e-book w pakiecie. To 50% mniej od sumy aktualnych cen zakupu osobno: 2 × 97 zł = 194 zł.",
  unavailable:
    "Sprzedaż nie jest jeszcze uruchomiona. Obecnie nie przyjmujemy płatności za e-booki.",
  privacy:
    "Administratorem Twoich danych jest Wellbiz sp. z o.o. Przetwarzamy je, żeby zrealizować zamówienie.",
  submit: "Zamawiam z obowiązkiem zapłaty",
};
