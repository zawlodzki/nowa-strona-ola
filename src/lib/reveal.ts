const MAX_STAGGER_INDEX = 4;
const STAGGER_MS = 70;

export function revealDelay(indexInGroup: number): number {
  return Math.min(Math.max(indexInGroup, 0), MAX_STAGGER_INDEX) * STAGGER_MS;
}

function groupKey(element: Element): Element {
  return element.closest("section") ?? document.body;
}

export function initReveal(root: ParentNode = document): void {
  const items = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (items.length === 0) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (const item of items) item.classList.add("is-revealed");
    return;
  }

  const groups = new Map<Element, HTMLElement[]>();
  for (const item of items) {
    const key = groupKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    group.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${revealDelay(index)}ms`);
    });
  }

  const hash = window.location.hash;
  if (hash.length > 1) {
    const target = root.querySelector(hash);
    target
      ?.querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((item) => item.classList.add("is-revealed"));
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = entry.target as HTMLElement;
        if (entry.isIntersecting || item.classList.contains("is-revealed")) {
          item.classList.add("is-revealed");
          item.classList.remove("js-reveal");
          observer.unobserve(item);
          continue;
        }
        item.classList.add("js-reveal");
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  for (const item of items) observer.observe(item);
}
