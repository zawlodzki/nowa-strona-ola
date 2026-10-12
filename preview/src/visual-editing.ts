import "@sanity/visual-editing-standalone/styles.css";
import { enableVisualEditing } from "@sanity/visual-editing-standalone";

enableVisualEditing({
  history: {
    subscribe(navigate) {
      navigate({ type: "replace", url: window.location.href });
      const onPopState = () =>
        navigate({ type: "pop", url: window.location.href });
      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    },
    update(update) {
      const url = new URL(update.url, window.location.href);
      if (url.origin !== window.location.origin) return;
      switch (update.type) {
        case "push":
          window.location.assign(url);
          break;
        case "replace":
          if (url.href !== window.location.href) window.location.replace(url);
          break;
        case "pop":
          window.history.back();
          break;
        default: {
          const unsupported: never = update.type;
          throw new Error(`Unsupported preview navigation: ${unsupported}`);
        }
      }
    },
  },
});
