import applePay from "@/assets/payments/apple-pay.svg?url";
import googlePay from "@/assets/payments/google-pay.svg?url";
import blik from "@/assets/payments/blik.svg?url";
import visa from "@/assets/payments/visa.svg?url";
import mastercard from "@/assets/payments/mastercard.svg?url";
import revolutPay from "@/assets/payments/revolut-pay.svg?url";
import klarna from "@/assets/payments/klarna.svg?url";

export const ebookPaymentMethods = [
  { name: "Apple Pay", src: applePay, dark: false },
  { name: "Google Pay", src: googlePay, dark: false },
  { name: "BLIK", src: blik, dark: false },
  { name: "Visa", src: visa, dark: false },
  { name: "Mastercard", src: mastercard, dark: false },
  { name: "Revolut Pay", src: revolutPay, dark: true },
  { name: "Klarna", src: klarna, dark: false },
] as const;

export const ebookPaymentTrustCopy = {
  pl: {
    delivery: "E-book na Twój e-mail po opłaceniu zamówienia.",
    payment: "Bezpieczna płatność przez Stripe",
    methods: "Metody płatności",
    availability: "Dostępność metod zależy od urządzenia i transakcji.",
  },
  en: {
    delivery: "Your e-book by email after payment.",
    payment: "Secure payment through Stripe",
    methods: "Payment methods",
    availability: "Available methods depend on your device and transaction.",
  },
} as const;
