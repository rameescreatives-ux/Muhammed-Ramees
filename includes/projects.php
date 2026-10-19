<?php
/* ============================================================================
   SHADOWX STUDIOS — PROJECT STORAGE
   ----------------------------------------------------------------------------
   Projects live in data/projects.json. No database needed, which means you can
   back the whole site up by copying the folder, and you can read or hand-edit
   the file in VS Code if you ever want to.

   Every write is atomic (write to a temp file, then rename) and takes a lock,
   so two simultaneous saves can never corrupt the file.
   ========================================================================== */

require_once __DIR__ . '/config.php';

/* ---------------------------------------------------------------- load ---- */
function sx_load_projects(): array
{
    if (!is_file(SX_PROJECTS_FILE)) {
        return [];
    }
    $raw = file_get_contents(SX_PROJECTS_FILE);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }
    // keep them in the order the admin set
    usort($data, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));
    return $data;
}

/* Only the ones that should appear on the public site. */
function sx_published_projects(): array
{
    return array_values(array_filter(
        sx_load_projects(),
        fn($p) => !empty($p['published'])
    ));
}

function sx_find_project(string $id): ?array
{
    foreach (sx_load_projects() as $p) {
        if (($p['id'] ?? '') === $id) {
            return $p;
        }
    }
    return null;
}

/* ---------------------------------------------------------------- save ---- */
function sx_save_projects(array $projects): bool
{
    if (!is_dir(SX_DATA)) {
        @mkdir(SX_DATA, 0755, true);
    }

    // renumber so order is always 1..n with no gaps
    $i = 1;
    foreach ($projects as &$p) {
        $p['order'] = $i++;
    }
    unset($p);

    $json = json_encode(
        array_values($projects),
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    if ($json === false) {
        return false;
    }

    // atomic write: temp file in the same directory, then rename over the top
    $tmp = SX_PROJECTS_FILE . '.' . bin2hex(random_bytes(6)) . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false) {
        @unlink($tmp);
        return false;
    }
    if (!rename($tmp, SX_PROJECTS_FILE)) {
        @unlink($tmp);
        return false;
    }
    @chmod(SX_PROJECTS_FILE, 0644);
    return true;
}

/* ------------------------------------------------------------- helpers ---- */
function sx_new_id(): string
{
    return bin2hex(random_bytes(8));
}

/** Turn a title into a safe url-ish slug (used for image filenames). */
function sx_slug(string $s): string
{
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-') ?: 'project';
}

/**
 * Normalise whatever the admin form sent into the shape we store.
 * Everything is treated as untrusted text; escaping happens at render time.
 */
function sx_normalise_project(array $in, ?array $existing = null): array
{
    $lines = function ($v): array {
        if (is_array($v)) { $v = implode("\n", $v); }
        $out = preg_split('/\r\n|\r|\n/', (string)$v) ?: [];
        $out = array_map('trim', $out);
        return array_values(array_filter($out, fn($x) => $x !== ''));
    };
    $csv = function ($v): array {
        if (is_array($v)) { return array_values(array_filter(array_map('trim', $v))); }
        $out = array_map('trim', explode(',', (string)$v));
        return array_values(array_filter($out, fn($x) => $x !== ''));
    };

    $images = [];
    if (!empty($in['images']) && is_array($in['images'])) {
        foreach ($in['images'] as $img) {
            $src = trim((string)($img['src'] ?? ''));
            if ($src === '') { continue; }
            $images[] = [
                'src' => $src,
                'alt' => trim((string)($img['alt'] ?? '')),
            ];
        }
    }

    return [
        'id'          => $existing['id'] ?? sx_new_id(),
        'order'       => (int)($in['order'] ?? $existing['order'] ?? 999),
        'published'   => !empty($in['published']),

        // English
        'title'       => trim((string)($in['title'] ?? '')),
        'subtitle'    => trim((string)($in['subtitle'] ?? '')),
        'tags'        => $csv($in['tags'] ?? ''),
        'body'        => $lines($in['body'] ?? ''),
        'deliverables'=> $csv($in['deliverables'] ?? ''),

        // Arabic (optional — falls back to English when blank)
        'title_ar'       => trim((string)($in['title_ar'] ?? '')),
        'subtitle_ar'    => trim((string)($in['subtitle_ar'] ?? '')),
        'tags_ar'        => $csv($in['tags_ar'] ?? ''),
        'body_ar'        => $lines($in['body_ar'] ?? ''),
        'deliverables_ar'=> $csv($in['deliverables_ar'] ?? ''),

        'images'      => $images,
        'updated_at'  => gmdate('c'),
        'created_at'  => $existing['created_at'] ?? gmdate('c'),
    ];
}

/* --------------------------------------------------------- public render -- */
/**
 * Render the <article class="case"> blocks for the public site.
 * $lang is 'en' or 'ar'; Arabic falls back to English field by field.
 */
function sx_render_cases(array $projects, string $lang = 'en', string $base = ''): string
{
    $e   = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $ar  = $lang === 'ar';
    $pick = function (array $p, string $key) use ($ar) {
        if ($ar) {
            $v = $p[$key . '_ar'] ?? '';
            if (is_array($v) ? count($v) : trim((string)$v) !== '') { return $v; }
        }
        return $p[$key] ?? '';
    };

    $html = '';
    foreach ($projects as $p) {
        $tags   = (array)$pick($p, 'tags');
        $body   = (array)$pick($p, 'body');
        $did    = (array)$pick($p, 'deliverables');
        $images = array_slice($p['images'] ?? [], 0, 2);

        $html .= "\n    <article class=\"case rv\">\n";
        $html .= "      <div class=\"case-top\">\n        <div>\n";

        if ($tags) {
            $html .= "          <div class=\"case-meta\">\n";
            foreach ($tags as $i => $t) {
                $cls = $i === 0 ? 'tag live' : 'tag';
                $html .= "            <span class=\"{$cls}\">" . $e($t) . "</span>\n";
            }
            $html .= "          </div>\n";
        }

        $html .= "          <h3>" . $e($pick($p, 'title')) . "</h3>\n";
        if (trim((string)$pick($p, 'subtitle')) !== '') {
            $html .= "          <p class=\"yr\">" . $e($pick($p, 'subtitle')) . "</p>\n";
        }
        $html .= "        </div>\n        <div class=\"case-body\">\n";

        foreach ($body as $para) {
            $html .= "          <p>" . $e($para) . "</p>\n";
        }
        if ($did) {
            $html .= "          <div class=\"did\">";
            foreach ($did as $d) {
                $html .= "<span>" . $e($d) . "</span>";
            }
            $html .= "</div>\n";
        }
        $html .= "        </div>\n      </div>\n";

        if ($images) {
            $html .= "      <div class=\"case-shots\">\n";
            foreach ($images as $img) {
                $src = $img['src'];
                // stored paths are root-relative ("work/x.webp" or "uploads/x.jpg")
                $html .= "        <figure class=\"shot\"><img src=\"" . $e($base . $src) . "\""
                       . " alt=\"" . $e($img['alt'] ?? '') . "\""
                       . " width=\"900\" height=\"675\" loading=\"lazy\"></figure>\n";
            }
            $html .= "      </div>\n";
        }

        $html .= "    </article>\n";
    }
    return $html;
}
