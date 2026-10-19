# ShadowX Studios — website + admin dashboard

Bilingual (English / Arabic) site for ShadowX Studios, Abu Dhabi, with a
password-protected admin area for managing the projects shown in the Work
section and the client logos in the Clients strip.

Built for **Hostinger shared hosting** — PHP 8, no database, no build step.
Open the folder in VS Code and edit.

---

## 1. Upload to Hostinger

1. Log in to Hostinger → **hPanel → File Manager** (or use FTP / SFTP).
2. Open `public_html`.
3. Upload **everything inside this folder** (not the folder itself) so that
   `index.php` sits directly in `public_html`.
4. Set folder permissions — in File Manager, right-click → Permissions:

   | Folder | Permission | Why |
   |---|---|---|
   | `data/` | **755** | PHP writes `projects.json` here |
   | `uploads/` | **755** | PHP writes uploaded images here |
   | `includes/` | 755 | only needs to be readable |

   If saving ever fails with *"Could not write data/projects.json"*, this is
   almost always the cause.

5. Make sure PHP is **8.0 or newer**: hPanel → Advanced → PHP Configuration.
6. Visit `https://yourdomain.com/admin/` and sign in.

> **Vercel note:** Vercel does not run PHP, so the admin will not work there.
> Hostinger (or any normal PHP host) is the home for this version.

---

## 2. Signing in

```
URL:       https://yourdomain.com/admin/
Username:  admin
Password:  (the one you were given)
```

**Change the password as soon as you're in** — *Change password* in the top
bar. The one you have now was sent over chat, so treat it as temporary.

The password is never stored as plain text. `includes/config.php` holds only a
bcrypt hash, so even someone who downloads that file cannot sign in with it.

Forgot it? Run this on your own machine and paste the result into
`ADMIN_HASH` in `includes/config.php`:

```bash
php -r 'echo password_hash("your new password", PASSWORD_BCRYPT, ["cost"=>12]);'
```

---

## 3. Using the dashboard

| What you want to do | How |
|---|---|
| Add a project | **+ Add project**, fill in the English tab, save |
| Edit one | **Edit** on its row |
| Reorder | Drag the **⠿** handle — the website follows this order |
| Take one off the site | Click **Live** → it becomes **Hidden** (nothing is deleted) |
| Delete permanently | **Delete** — also removes its uploaded images |
| Add Arabic | The **العربية** tab. Anything blank falls back to English |
| Add images | **Images** tab — drag and drop, or choose files |

Notes that matter:

- **The first two images** are the ones shown on the site, side by side. Extra
  images are stored but not displayed.
- **Each line in the Description** becomes its own paragraph.
- **Tags and deliverables** are comma-separated. The first tag is highlighted
  orange.
- **Alt text** on images is worth filling in — Google reads it, and it is what
  a screen-reader user hears.
- Changes are live the moment you hit save. No publish step, no cache to clear.

---

## 4. Where everything lives

```
public_html/
├── index.php              English home page  (Work section is generated)
├── ar/index.php           Arabic home page   (Work section is generated)
├── admin/                 the dashboard
│   ├── index.php          project list + editor
│   ├── clients.php        client logo list + editor
│   ├── login.php          sign in
│   ├── logout.php
│   ├── api.php            all save/delete/upload actions
│   ├── admin.css
│   ├── admin.js
│   └── clients.js
├── includes/
│   ├── config.php         ← admin username + password hash, upload limits
│   ├── auth.php           sessions, CSRF, login throttling
│   ├── projects.php       reads/writes projects.json, renders the Work section
│   ├── clients.php        reads/writes clients.json, renders the Clients strip
│   └── upload.php         image validation and resizing
├── data/
│   ├── projects.json      ← every project. Back this file up.
│   └── clients.json       ← every client logo. Back this file up.
├── uploads/               images and logos added through the dashboard
├── assets/clients/        the 13 client logos that ship with the site
├── work/                  the three original project images
├── blog/                  six articles (plain HTML)
├── assets/css|js|img/     site styles, scripts, logos
├── .htaccess              security headers, clean URLs, caching
├── robots.txt, sitemap.xml
└── supabase/              lead-capture schema (separate from the admin)
```

### Things you'll most likely want to change

| What | Where |
|---|---|
| Phone, email, Supabase keys | `assets/js/config.js` |
| Brand colours, fonts, spacing | `assets/css/main.css` → `:root` at the top |
| Prices | `index.php`, `ar/index.php`, and `assets/js/config.js` |
| Admin password | the dashboard, or `includes/config.php` |
| Everything else on the page | directly in `index.php` / `ar/index.php` |

Each section of the page starts with an HTML comment naming it — search for
`======= PRICING =======` and so on.

---

## 5. Backups

Everything that changes lives in two places:

- `data/projects.json` — the project content
- `uploads/` — the images you added

Copy those two and you have a complete backup. `projects.json` is plain,
readable JSON, so you can also open it in VS Code and edit it by hand.

---

## 6. Running it locally

You need PHP installed (`php -v` to check).

```bash
cd /path/to/this/folder
php -S localhost:8000
```

Then open <http://localhost:8000> and <http://localhost:8000/admin/>.

Opening `index.php` directly as a file will **not** work — PHP has to run it.

---

## 7. Security that's already in place

- Password stored as a bcrypt hash, never in plain text
- Sessions are HTTP-only, SameSite=Lax, and expire after 2 hours idle
- Session ID regenerated on login (blocks session fixation)
- CSRF token required on every action that changes data
- 6 failed logins → locked out for 15 minutes
- Uploads are checked by reading the file's actual bytes, not its name
- `uploads/` has PHP execution switched off, so a disguised script cannot run
- Filenames are generated by the server; nothing from the browser is trusted
- `data/`, `includes/` and `projects.json` are blocked from direct web access
- `/admin/` is marked `noindex` and blocked in `robots.txt`
- Writes to `projects.json` are atomic and locked, so a save can't corrupt it

Worth doing yourself:

1. Change the password (above).
2. Turn on free SSL in hPanel → SSL. The `.htaccess` already forces HTTPS.
3. Keep PHP on a supported version.

---

© 2026 ShadowX Studios · Abu Dhabi, UAE

---

## 8. Client logos (the scrolling strip on the home page)

Sign in and open **Clients** in the top bar.

- **Add client** — upload the logo, type the name, optionally add the Arabic
  name and a website link, then Save. It appears in the strip immediately.
- **Edit** — change the name, swap the logo, add or remove the link.
- **Live / Hidden** — hide a logo without deleting it.
- **Drag the ⠿ handle** — sets the order the logos scroll in.
- **Delete** — removes it. A logo you uploaded is deleted with it; the 13
  logos that ship in `assets/clients/` are never deleted.

**Logo tips:** PNG with a transparent or white background works best. The
strip shows them at about 60 px tall in greyscale and they turn full colour
when a visitor hovers, so a logo with thin light strokes can look faint.
Anything up to 6 MB is fine — the server resizes it.

The strip is paused automatically for visitors who have "reduce motion"
turned on; they get a strip they can scroll by hand instead.

---

## 9. Light / dark theme

The site ships in dark mode. The sun/moon button in the nav bar switches to
light, and the choice is remembered in that visitor's browser.

A first-time visitor gets whatever their device is set to — a phone on light
mode sees the light site. Once they press the button, their choice wins and
the site stops following the device.

### Changing the light colours

Everything lives in `assets/css/main.css`:

- **Section 1 (`:root`)** — the dark theme. This is the default.
- **Section 23 (`:root[data-theme="light"]`)** — the light theme, which only
  redefines the tokens that differ.

The light theme follows the brand rule: **white background, orange for titles
and highlights, black for everything else.** Section headings (`h1`, `h2`) are
orange; body copy is near-black. The orange is `#e2571a` rather than the dark
theme's `#f26b26` — the brighter orange does not hold enough contrast on white.

To change a colour, edit the token, not the rule that uses it. For example,
making the light background warmer is one line:

```css
:root[data-theme="light"]{ --black: #fdfcfa; }
```

### The two logo files

Each page carries both logo variants and CSS shows the right one:

- `shadowx-wordmark-light.png` / `shadowx-logo-light.png` — white ink, dark theme
- `shadowx-wordmark-dark.png` / `shadowx-logo-dark.png` — black ink, light theme

If you replace a logo, replace **both** variants or one theme will show the
wrong one.

### The no-flash script

Every page has a small inline `<script>` in `<head>`, just above the stylesheet
link. It sets the theme before the browser paints. **Keep it inline and keep it
in the head** — moving it into a `.js` file brings back the white flash on load
for dark-mode visitors.
