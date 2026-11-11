<?php
// Envío del formulario de contacto de motodest.com
// Va en el propio hosting (cPanel). Si el servidor no entrega bien con mail(),
// cambiar a SMTP autenticado de la cuenta contacto@.
declare(strict_types=1);

const DESTINO   = 'contacto@motodest.com';
const REMITENTE = 'web@motodest.com';   // Debe existir o estar autorizado en el SPF del dominio
const GRACIAS   = '/gracias/';

$json = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
function volver(string $url): never {
    global $json;
    if ($json) { header('Content-Type: application/json'); echo '{"ok":true}'; exit; }
    header('Location: ' . $url, true, 303); exit;
}
function fallo(int $code, string $txt): never {
    global $json;
    http_response_code($code);
    if ($json) { header('Content-Type: application/json'); echo json_encode(['ok' => false, 'error' => $txt]); exit; }
    echo $txt; exit;
}
function limpio(string $k, int $max = 200): string {
    $v = trim((string)($_POST[$k] ?? ''));
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v);
    return mb_substr(strip_tags($v), 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$canal = limpio('canal', 20) === 'asistente' ? 'asistente' : 'formulario';

// Antispam: campo trampa y tiempo mínimo entre envíos por IP
if (!empty($_POST['web'])) volver(GRACIAS);
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$marca = sys_get_temp_dir() . '/motodest_form_' . md5($ip);
if (is_file($marca) && time() - filemtime($marca) < 30) volver(GRACIAS);
@touch($marca);

$nombre   = limpio('nombre', 80);
$telefono = limpio('telefono', 20);
$email    = filter_var(limpio('email', 120), FILTER_VALIDATE_EMAIL) ?: '';
$moto     = limpio('moto', 120) ?: limpio('moto_libre', 120);
$origen   = limpio('origen', 200);
$mensaje  = mb_substr(strip_tags(trim((string)($_POST['mensaje'] ?? ''))), 0, 2000);
$privacidad = !empty($_POST['privacidad']);
$comercial  = !empty($_POST['comercial']);

// En el asistente el email es opcional: basta con nombre y teléfono
if ($nombre === '' || $telefono === '' || ($email === '' && $canal !== 'asistente') || !$privacidad) {
    fallo(400, 'Faltan datos obligatorios. Vuelve atrás y revisa el formulario.');
}

$asunto = ($canal === 'asistente' ? 'Asistente web' : 'Consulta web') . ($moto ? " - $moto" : '') . " - $nombre";
$cuerpo = "Nueva consulta desde motodest.com\n\n"
        . "Canal: $canal\nNombre: $nombre\nTeléfono: $telefono\nEmail: " . ($email ?: '-') . "\n"
        . "Moto: " . ($moto ?: '-') . "\nPágina: $origen\n"
        . "Acepta comunicaciones comerciales: " . ($comercial ? 'Sí' : 'No') . "\n\n"
        . "Mensaje:\n" . ($mensaje ?: '-') . "\n\n"
        . 'Fecha: ' . date('d/m/Y H:i') . "\nIP: $ip\n";

$cabeceras = implode("\r\n", [
    'From: Web Motodest <' . REMITENTE . '>',
    'Reply-To: ' . ($email ? $nombre . ' <' . $email . '>' : DESTINO),
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: motodest.com',
]);

$ok = mail(DESTINO, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $cabeceras, '-f' . REMITENTE);
if (!$ok) fallo(500, 'No se ha podido enviar. Llámanos al 630 55 34 94.');
volver(GRACIAS);
