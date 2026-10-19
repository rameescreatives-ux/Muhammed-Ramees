/**
 * Emit the catalogue as JSON on stdout.
 *
 * The content lives in TypeScript modules that Node cannot import
 * directly. Rather than add a transpile step for one small read, the
 * fields the preview needs are parsed out of the source text. Narrow by
 * design: if the shape of products.ts changes, this fails loudly at build
 * time instead of silently emitting an empty catalogue.
 */

import fs from "node:fs";

const src = fs.readFileSync("src/content/products.ts", "utf8");

/** Pull the value of a key from an object literal body. */
const field = (body, key) => {
  const m = body.match(new RegExp(`${key}:\\s*\\{[^}]*en:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"') : "";
};

function parseBlock(startMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`dump-content: "${startMarker}" not found`);
  // Start at the array literal, not at the "[]" in the type annotation
  // ("export const ranges: Range[] = [" has two).
  const eq = src.indexOf("=", start);
  let i = src.indexOf("[", eq);
  let depth = 0;
  let end = i;
  for (; end < src.length; end++) {
    if (src[end] === "[") depth++;
    else if (src[end] === "]") {
      depth--;
      if (depth === 0) break;
    }
  }
  return src.slice(i + 1, end);
}

function entries(block) {
  // Split on top-level "{ ... }" objects.
  const out = [];
  let depth = 0, start = -1;
  for (let i = 0; i < block.length; i++) {
    if (block[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (block[i] === "}") {
      depth--;
      if (depth === 0 && start > -1) { out.push(block.slice(start, i + 1)); start = -1; }
    }
  }
  return out;
}

const slugOf = (b) => (b.match(/slug:\s*"([^"]+)"/) || [, ""])[1];

const ranges = entries(parseBlock("export const ranges")).map((b) => ({
  slug: slugOf(b),
  name: field(b, "name"),
  description: field(b, "description") || field(b, "tagline"),
}));

const subRanges = entries(parseBlock("export const subRanges")).map((b) => ({
  slug: slugOf(b),
  range: (b.match(/range:\s*"([^"]+)"/) || [, ""])[1],
  name: field(b, "name"),
}));

if (!ranges.length || !subRanges.length) {
  throw new Error("dump-content: parsed an empty catalogue — check products.ts");
}

process.stdout.write(JSON.stringify({ ranges, subRanges }));
