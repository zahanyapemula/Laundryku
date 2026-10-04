<?php
/**
 * Router untuk PHP built-in server ( development ).
 * Jalankan:  php -S 127.0.0.1:5199 api/router.php
 * Dengan begitu /api/index.php?_params akan dieksekusi sebagai PHP.
 */
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if (str_starts_with($uri, '/api/')) {
    $target = __DIR__ . '/' . basename($uri);
    if (is_file($target) && str_ends_with($target, '.php')) {
        require $target;
        return true;
    }
    require __DIR__ . '/index.php';
    return true;
}

return false;