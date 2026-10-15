/**
 * Effective headers from a Cloudflare Workers Static Assets `_headers` file.
 * Matching rules combine. A repeated name joins with a comma. `! Name`
 * removes that name, which is how a narrower rule replaces one value.
 */

function compile(pattern) {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === "*") {
      source += "(.*)";
      continue;
    }
    if (char === ":" && /[A-Za-z]/.test(pattern[index + 1] ?? "")) {
      index += 1;
      while (index < pattern.length && /\w/.test(pattern[index])) index += 1;
      index -= 1;
      source += "([^/]+)";
      continue;
    }
    source += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`${source}$`);
}

function applyLine(values, line) {
  if (line.startsWith("! ")) {
    values.delete(line.slice(2).split(":")[0].trim().toLowerCase());
    return;
  }
  const split = line.indexOf(":");
  if (split === -1) return;
  const name = line.slice(0, split).trim().toLowerCase();
  const value = line.slice(split + 1).trim();
  const current = values.get(name);
  values.set(name, current === undefined ? value : `${current}, ${value}`);
}

export function headerValue(headersFile, pathname, headerName) {
  const values = new Map();
  let pattern = null;
  let lines = [];
  const flush = () => {
    if (pattern !== null && compile(pattern).test(pathname)) {
      for (const line of lines) applyLine(values, line);
    }
    pattern = null;
    lines = [];
  };
  for (const raw of headersFile.split("\n")) {
    if (!raw.trim() || raw.trimStart().startsWith("#")) {
      flush();
      continue;
    }
    if (/^\s/.test(raw)) {
      lines.push(raw.trim());
      continue;
    }
    flush();
    pattern = raw.trim();
  }
  flush();
  return values.get(headerName.toLowerCase());
}
