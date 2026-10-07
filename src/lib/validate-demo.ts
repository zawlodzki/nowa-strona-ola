export type DemoFields = { name: string; email: string };

export function validateDemo(fields: DemoFields) {
  return {
    name: fields.name.trim().length < 2 || fields.name.length > 100,
    email: isInvalidEmail(fields.email),
  };
}

export function isInvalidEmail(value: string) {
  return value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateDemoField(
  input: string,
  value: string,
  required: boolean,
): boolean {
  if (input === "checkbox") {
    return required && value !== "on" && value !== "true";
  }
  const trimmed = value.trim();
  if (required && trimmed.length === 0) return true;
  if (!required && trimmed.length === 0) return false;
  if (input === "email") return isInvalidEmail(value);
  if (input === "text") return trimmed.length < 2 || value.length > 100;
  if (input === "tel") return trimmed.length < 6;
  return false;
}
