export function metricFrame(progress: number, target: number): number {
  const t = Math.min(Math.max(progress, 0), 1);
  const eased = 1 - (1 - t) ** 5;
  return Math.round(target * eased);
}

export function animateMetric(
  element: HTMLElement,
  target: number,
  duration = 1000,
): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = String(target);
    return;
  }

  const start = performance.now();
  const tick = (now: number) => {
    const progress = (now - start) / duration;
    element.textContent = String(metricFrame(progress, target));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initMetrics(root: ParentNode = document): void {
  const nodes = [...root.querySelectorAll<HTMLElement>("[data-metric]")];
  if (nodes.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const target = Number(element.dataset.metric);
        if (Number.isFinite(target)) animateMetric(element, target);
        observer.unobserve(element);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  for (const node of nodes) observer.observe(node);
}
