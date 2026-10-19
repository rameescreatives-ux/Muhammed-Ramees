# Content required from Unikai

Everything on the rebuilt site comes from content Unikai already
publishes. Where the company publishes nothing, the page says so plainly
rather than showing invented data — a wrong certification or allergen
claim on an FMCG site is a liability, not a cosmetic issue.

This is the list of what is missing, in the order it unblocks value.

---

## Blockers — needed before go-live

### 1. Official logo (vector)
`public/brand/unikai-logo.png` is the supplied social avatar, cleaned and
alpha-trimmed. It is adequate for review but not for print-quality
rendering or retina displays.
**Needed:** `.ai`, `.eps` or `.svg`. Drop it in and no other change is
required.

### 2. Brand colour specification
Colours were sampled from the supplied avatar: red `#D23137`, navy
`#09018B`. These are close to Pantone 186 C and Reflex Blue but were read
off a compressed JPEG-era asset and will drift a shade from spec.
**Needed:** the brand guideline PDF or the exact HEX/Pantone values.
Change two tokens in `src/app/globals.css`.

### 3. Certification documents
The Quality page names **no** certification, because unikai.com publishes
none and importers screen suppliers on exactly this. The page structure,
database table and upload path are ready and empty.
**Needed:** which certifications may be displayed (ISO 22000, HACCP,
Halal, FSSC 22000, others) and the certificate PDFs.

### 4. Verified export market list
The export map does not render. The CEO's letter says Unikai is "a
household name in 29 countries", but that is a quote, not a verified
market list, and importers use this page to qualify a supplier.
**Needed:** the confirmed country list. Publishing a guessed map here
would be a material misstatement.

### 5. Product master data
The legacy site exposes images and nothing else — no descriptions, pack
sizes, specifications or nutritionals anywhere. Two product pages exist
in total (`fresh-milk`, `orange-lolly-family-pack`); neither carries
specs.
**Needed, as one spreadsheet:** SKU · product name EN/AR · range ·
sub-range · pack size · case configuration · barcode · shelf life ·
storage conditions · ingredients · nutritional panel · certifications.

Until then every product page shows: *"Detailed specifications have not
yet been published. Pack sizes, case configuration, shelf life,
nutritional information and certification details are provided by the
sales team on request."*

### 6. Department email addresses
All four enquiry routes currently point at `info@unikai.com`.
**Needed:** the correct inbox for export, local distribution, general and
supplier/partnership enquiries. One row each in `routing_rules`.

---

## Fixes — small, high value

### 7. LinkedIn
There is **no LinkedIn link anywhere** on the current site. For a B2B
manufacturer that is the primary professional channel.
**Needed:** the company page URL, or confirmation that none exists.

### 8. Missing pack shot
The *Long-life Flavoured Milk* sub-range renders an empty `<img src>` on
the legacy site — the image was never uploaded.
**Needed:** one pack shot.

### 9. Likely wrong pack shot
*Orange Lolly Family Pack* uses an image filed as
`mango-6-pk-box-small.png`. An orange-flavour product showing a mango
pack is probably an error.
**Needed:** confirmation or the correct image.

---

## Phase two

### 10. Arabic translation
The schema, RTL layout, hreflang and locale routing are complete. Core
navigation, company copy and UI strings are translated. Arabic for the
CEO letter, product descriptions and the IR document titles is machine-
assisted or absent, and falls back to English where missing.
**Needed:** professional FMCG translation, or approval to publish the
current Arabic.

### 11. Photography
Every pack shot dates from February 2016. They are transparent cut-outs,
re-composited onto modern plates and served as AVIF/WebP, which carries
them further than expected — but they are ten years old.
**Needed (cheapest first):** Unikai's internal marketing asset library;
then a product shoot if budget allows.

### 12. News archive
The News section is seeded with five real, dated regulatory disclosures
drawn from the IR filings — genuine published facts, so the section is
not empty. There is no editorial news archive to migrate because the
legacy "In the News" link was broken and pointed nowhere.
**Needed:** any press releases or media coverage worth publishing.

### 13. Legal review
`/privacy` and `/cookies` are templates describing what the site actually
does with data. They require review against UAE PDPL before go-live.

---

## Deliberately omitted

Listed so nobody "fixes" these by inventing content:

- **Factory locations, capacity, employee numbers** — not published.
- **Specific ingredients and allergens** — not published; the chatbot is
  explicitly forbidden from stating them.
- **Prices, MOQs, lead times, stock** — commercial terms, confirmed by
  the sales team, never by a web page or a chatbot.
- **Sustainability claims** — one 2020 report exists and is linked. No
  current ESG narrative is published, so none is written.
