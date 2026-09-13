export type DemoFields = { name: string; email: string };
export function validateDemo(fields: DemoFields) {
  return {
    name: fields.name.trim().length < 2 || fields.name.length > 100,
    email:
      fields.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()),
  };
}
