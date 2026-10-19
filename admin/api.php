<?php
/* ============================================================================
   SHADOWX STUDIOS — ADMIN API
   ----------------------------------------------------------------------------
   Every action the dashboard performs goes through here. All of them require
   a valid session AND a valid CSRF token.

   Actions:  save | delete | reorder | toggle | upload | detach | password
   ========================================================================== */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/projects.php';
require_once __DIR__ . '/../includes/upload.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function sx_json($data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!sx_is_logged_in()) {
    sx_json(['ok' => false, 'error' => 'Not signed in.', 'relogin' => true], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sx_json(['ok' => false, 'error' => 'POST required.'], 405);
}
sx_require_csrf();

$action = (string)($_POST['action'] ?? '');

switch ($action) {

    /* ------------------------------------------------- create / update ---- */
    case 'save': {
        $payload = json_decode((string)($_POST['project'] ?? ''), true);
        if (!is_array($payload)) {
            sx_json(['ok' => false, 'error' => 'Could not read the form data.'], 400);
        }

        $title = trim((string)($payload['title'] ?? ''));
        if ($title === '') {
            sx_json(['ok' => false, 'error' => 'A project title is required.'], 422);
        }

        $projects = sx_load_projects();
        $id       = trim((string)($payload['id'] ?? ''));
        $existing = null;
        $index    = null;

        if ($id !== '') {
            foreach ($projects as $i => $p) {
                if (($p['id'] ?? '') === $id) { $existing = $p; $index = $i; break; }
            }
            if ($existing === null) {
                sx_json(['ok' => false, 'error' => 'That project no longer exists.'], 404);
            }
        }

        $clean = sx_normalise_project($payload, $existing);

        if ($index !== null) {
            // free any image that was removed from this project
            $old = array_column($existing['images'] ?? [], 'src');
            $new = array_column($clean['images'], 'src');
            foreach (array_diff($old, $new) as $gone) {
                if (!sx_image_in_use($gone, $id)) { sx_delete_upload($gone); }
            }
            $projects[$index] = $clean;
        } else {
            $clean['order'] = count($projects) + 1;
            $projects[] = $clean;
        }

        if (!sx_save_projects($projects)) {
            sx_json(['ok' => false, 'error' => 'Could not write data/projects.json. Check the folder is writable (755).'], 500);
        }
        sx_json(['ok' => true, 'project' => $clean, 'created' => $index === null]);
    }

    /* ------------------------------------------------------------ delete -- */
    case 'delete': {
        $id = (string)($_POST['id'] ?? '');
        $projects = sx_load_projects();
        $kept = [];
        $removed = null;
        foreach ($projects as $p) {
            if (($p['id'] ?? '') === $id) { $removed = $p; continue; }
            $kept[] = $p;
        }
        if ($removed === null) {
            sx_json(['ok' => false, 'error' => 'That project no longer exists.'], 404);
        }
        if (!sx_save_projects($kept)) {
            sx_json(['ok' => false, 'error' => 'Could not save the change.'], 500);
        }
        // tidy up images that nothing else uses
        foreach ($removed['images'] ?? [] as $img) {
            if (!sx_image_in_use($img['src'] ?? '', $id)) {
                sx_delete_upload($img['src'] ?? '');
            }
        }
        sx_json(['ok' => true, 'title' => $removed['title'] ?? '']);
    }

    /* ----------------------------------------------------------- reorder -- */
    case 'reorder': {
        $ids = json_decode((string)($_POST['ids'] ?? ''), true);
        if (!is_array($ids)) {
            sx_json(['ok' => false, 'error' => 'Bad order data.'], 400);
        }
        $byId = [];
        foreach (sx_load_projects() as $p) { $byId[$p['id']] = $p; }

        $ordered = [];
        foreach ($ids as $id) {
            if (isset($byId[$id])) { $ordered[] = $byId[$id]; unset($byId[$id]); }
        }
        foreach ($byId as $leftover) { $ordered[] = $leftover; }  // never lose one

        if (!sx_save_projects($ordered)) {
            sx_json(['ok' => false, 'error' => 'Could not save the new order.'], 500);
        }
        sx_json(['ok' => true]);
    }

    /* ------------------------------------------------ show / hide on site -- */
    case 'toggle': {
        $id = (string)($_POST['id'] ?? '');
        $projects = sx_load_projects();
        $state = null;
        foreach ($projects as &$p) {
            if (($p['id'] ?? '') === $id) {
                $p['published'] = empty($p['published']);
                $p['updated_at'] = gmdate('c');
                $state = $p['published'];
                break;
            }
        }
        unset($p);
        if ($state === null) {
            sx_json(['ok' => false, 'error' => 'That project no longer exists.'], 404);
        }
        if (!sx_save_projects($projects)) {
            sx_json(['ok' => false, 'error' => 'Could not save the change.'], 500);
        }
        sx_json(['ok' => true, 'published' => $state]);
    }

    /* ------------------------------------------------------------ upload -- */
    case 'upload': {
        if (empty($_FILES['image'])) {
            sx_json(['ok' => false, 'error' => 'No image received.'], 400);
        }
        $res = sx_handle_upload($_FILES['image'], (string)($_POST['slug'] ?? 'image'));
        sx_json($res, $res['ok'] ? 200 : 422);
    }

    /* --------------------------- remove an image from the editing form ----- */
    case 'detach': {
        $src = (string)($_POST['src'] ?? '');
        $id  = (string)($_POST['id'] ?? '');
        if (strpos($src, 'uploads/') === 0 && !sx_image_in_use($src, $id)) {
            sx_delete_upload($src);
        }
        sx_json(['ok' => true]);
    }

    /* ---------------------------------------------------------- password -- */
    case 'password': {
        $err = sx_change_password(
            (string)($_POST['current'] ?? ''),
            (string)($_POST['new'] ?? '')
        );
        if ($err !== '') { sx_json(['ok' => false, 'error' => $err], 422); }
        sx_json(['ok' => true]);
    }
}

sx_json(['ok' => false, 'error' => 'Unknown action.'], 400);
