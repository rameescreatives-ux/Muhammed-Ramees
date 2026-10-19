<?php
require_once __DIR__ . '/../includes/auth.php';
sx_logout();
header('Location: login.php');
exit;
