<?php
// Envío del formulario de contacto de motodest.com
// Va en el propio hosting (cPanel). Si el servidor no entrega bien con mail(),
// cambiar a SMTP autenticado de la cuenta contacto@.
declare(strict_types=1);

const DESTINO   = 'contacto@motodest.com';
const REMITENTE = 'web@motodest.com';   // Debe existir o estar autorizado en el SPF del dominio
const GRACIAS   = '/gracias/';

function volver(string $url): never { header('Location: ' . $url, true, 303); exit; }
function limpio(string $k, int $max = 200): string {
    $v = trim((string)($_POST[$k] ?? ''));
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v);
    return mb_substr(strip_tags($v), 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

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

if ($nombre === '' || $telefono === '' || $email === '' || !$privacidad) {
    http_response_code(400);
    echo 'Faltan datos obligatorios. Vuelve atrás y revisa el formulario.';
    exit;
}

$asunto = 'Consulta web' . ($moto ? " - $moto" : '') . " - $nombre";
$cuerpo = "Nueva consulta desde motodest.com\n\n"
        . "Nombre: $nombre\nTeléfono: $telefono\nEmail: $email\n"
        . "Moto: " . ($moto ?: '-') . "\nPágina: $origen\n"
        . "Acepta comunicaciones comerciales: " . ($comercial ? 'Sí' : 'No') . "\n\n"
        . "Mensaje:\n" . ($mensaje ?: '-') . "\n\n"
        . 'Fecha: ' . date('d/m/Y H:i') . "\nIP: $ip\n";

$cabeceras = implode("\r\n", [
    'From: Web Motodest <' . REMITENTE . '>',
    'Reply-To: ' . $nombre . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: motodest.com',
]);

$ok = mail(DESTINO, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $cabeceras, '-f' . REMITENTE);
if (!$ok) { http_response_code(500); echo 'No se ha podido enviar. Llámanos al 630 55 34 94.'; exit; }
volver(GRACIAS);
