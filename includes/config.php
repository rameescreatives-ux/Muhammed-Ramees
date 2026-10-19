<?php
/* ============================================================================
   SHADOWX STUDIOS — SITE CONFIGURATION
   ----------------------------------------------------------------------------
   The only file you normally need to edit on the server.
   ========================================================================== */

/* --- Admin login --------------------------------------------------------
   The password is stored as a bcrypt HASH, never as plain text, so that
   anyone who reads this file still cannot log in.

   TO CHANGE THE PASSWORD:
     1. Log in to the admin and use "Change password" (easiest), or
     2. Run this locally:  php -r 'echo password_hash("YOUR NEW PASSWORD",
          PASSWORD_BCRYPT, ["cost"=>12]);'
        and paste the result below.
   ------------------------------------------------------------------------ */
const ADMIN_USER = 'admin';
const ADMIN_HASH = '$2y$12$YPbt.1i2uNqZMyXihPFEkeTFRcbs4cxbGlCkcEfFqnukMrV2s3TiK';

/* --- Paths (leave these alone unless you move folders) ------------------- */
define('SX_ROOT',    dirname(__DIR__));
define('SX_DATA',    SX_ROOT . '/data');
define('SX_UPLOADS', SX_ROOT . '/uploads');
define('SX_PROJECTS_FILE', SX_DATA . '/projects.json');

/* --- Uploads ------------------------------------------------------------- */
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;         // 6 MB per image
const ALLOWED_IMAGE_TYPES = [
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG  => 'png',
    IMAGETYPE_WEBP => 'webp',
    IMAGETYPE_GIF  => 'gif',
];

/* --- Login throttling ---------------------------------------------------- */
const LOGIN_MAX_ATTEMPTS = 6;      // failed attempts…
const LOGIN_LOCKOUT_SECS = 900;    // …then locked out for 15 minutes

/* --- Session ------------------------------------------------------------- */
const SESSION_NAME     = 'sx_admin';
const SESSION_IDLE_MAX = 7200;     // auto sign-out after 2 hours idle
