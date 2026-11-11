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

// ---- Plantilla HTML del aviso ----
function e(string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); }
$telLimpio = preg_replace('/[^0-9+]/', '', $telefono);
$waNum = ltrim($telLimpio, '+'); if (strlen($waNum) === 9) $waNum = '34' . $waNum;
$fila = fn(string $k, string $v) => '<tr><td style="padding:10px 0;border-bottom:1px solid #ecebf3;color:#6b678a;font-size:13px;text-transform:uppercase;letter-spacing:.06em;width:150px;vertical-align:top">' . $k . '</td><td style="padding:10px 0;border-bottom:1px solid #ecebf3;color:#0b013e;font-size:16px;font-weight:600">' . $v . '</td></tr>';
$filas = $fila('Nombre', e($nombre))
       . $fila('Teléfono', '<a href="tel:' . e($telLimpio) . '" style="color:#0b013e;text-decoration:none">' . e($telefono) . '</a>')
       . $fila('Email', $email ? '<a href="mailto:' . e($email) . '" style="color:#0b013e">' . e($email) . '</a>' : '—')
       . $fila('Moto', e($moto ?: '—'))
       . $fila('Ofertas', $comercial ? 'Acepta recibir ofertas' : 'No acepta ofertas');
$botones = '<a href="tel:' . e($telLimpio) . '" style="display:inline-block;background:#f47b29;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:14px;padding:14px 22px;text-decoration:none;margin:0 8px 8px 0">Llamar</a>'
         . '<a href="https://wa.me/' . e($waNum) . '" style="display:inline-block;background:#0b013e;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:14px;padding:14px 22px;text-decoration:none;margin:0 8px 8px 0">WhatsApp</a>'
         . ($email ? '<a href="mailto:' . e($email) . '?subject=' . rawurlencode('Re: ' . $asunto) . '" style="display:inline-block;border:2px solid #0b013e;color:#0b013e;font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:14px;padding:12px 20px;text-decoration:none;margin:0 8px 8px 0">Responder</a>' : '');
$etiqueta = $canal === 'asistente' ? 'Chat de la web' : 'Formulario de la web';
$html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>'
  . '<body style="margin:0;background:#f2f1f7;font-family:Arial,Helvetica,sans-serif">'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1f7;padding:24px 12px"><tr><td align="center">'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff">'
  . '<tr><td style="background:#0b013e;padding:22px 28px"><img src="https://motodest.com/logo-motodest.png" width="180" alt="Motodest" style="display:block;border:0"></td></tr>'
  . '<tr><td style="height:5px;background:#f47b29;font-size:0;line-height:0">&nbsp;</td></tr>'
  . '<tr><td style="padding:28px 28px 8px"><p style="margin:0 0 6px;color:#f47b29;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em">' . $etiqueta . '</p>'
  . '<h1 style="margin:0;color:#0b013e;font-size:24px;line-height:1.25">Nueva consulta' . ($moto ? ' sobre la ' . e($moto) : '') . '</h1></td></tr>'
  . '<tr><td style="padding:8px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $filas . '</table></td></tr>'
  . ($mensaje ? '<tr><td style="padding:18px 28px 0"><p style="margin:0 0 6px;color:#6b678a;font-size:13px;text-transform:uppercase;letter-spacing:.06em">Mensaje</p><div style="background:#f7f6fb;border-left:4px solid #f47b29;padding:14px 16px;color:#0b013e;font-size:15px;line-height:1.5">' . nl2br(e($mensaje)) . '</div></td></tr>' : '')
  . '<tr><td style="padding:24px 28px 18px">' . $botones . '</td></tr>'
  . '<tr><td style="padding:16px 28px;background:#f7f6fb;color:#8b88a6;font-size:12px;line-height:1.5">Enviado desde motodest.com' . e($origen) . '<br>' . date('d/m/Y H:i') . ' · IP ' . e($ip) . '</td></tr>'
  . '</table></td></tr></table></body></html>';

$limite = 'md' . bin2hex(random_bytes(8));
$cuerpoMime = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($cuerpo))
            . "--$limite\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
            . "--$limite--";

$cabeceras = implode("\r\n", [
    'From: Web Motodest <' . REMITENTE . '>',
    'Reply-To: ' . ($email ? '=?UTF-8?B?' . base64_encode($nombre) . '?= <' . $email . '>' : DESTINO),
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $limite . '"',
    'X-Mailer: motodest.com',
]);

$ok = mail(DESTINO, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpoMime, $cabeceras, '-f' . REMITENTE);
if (!$ok) fallo(500, 'No se ha podido enviar. Llámanos al 630 55 34 94.');

// ---- Acuse de recibo al cliente, con sus datos para que los verifique ----
if ($email !== '') {
    $nombrePila = e(explode(' ', $nombre)[0]);
    $filasCli = $fila('Nombre', e($nombre))
              . $fila('Teléfono', e($telefono))
              . $fila('Email', e($email))
              . $fila('Moto', e($moto ?: '—'))
              . ($mensaje ? $fila('Mensaje', nl2br(e($mensaje))) : '')
              . $fila('Ofertas', $comercial ? 'Sí, quiero recibirlas' : 'No');
    $btn = 'display:inline-block;font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:14px;padding:14px 22px;text-decoration:none;margin:0 8px 8px 0';
    $htmlCli = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>'
      . '<body style="margin:0;background:#f2f1f7;font-family:Arial,Helvetica,sans-serif">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1f7;padding:24px 12px"><tr><td align="center">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff">'
      . '<tr><td style="background:#0b013e;padding:22px 28px"><img src="https://motodest.com/logo-motodest.png" width="180" alt="Motodest" style="display:block;border:0"></td></tr>'
      . '<tr><td style="height:5px;background:#f47b29;font-size:0;line-height:0">&nbsp;</td></tr>'
      . '<tr><td style="padding:28px 28px 6px"><p style="margin:0 0 6px;color:#f47b29;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em">Consulta recibida</p>'
      . '<h1 style="margin:0 0 12px;color:#0b013e;font-size:24px;line-height:1.25">Gracias, ' . $nombrePila . '</h1>'
      . '<p style="margin:0;color:#4a4668;font-size:15px;line-height:1.6">Hemos recibido tu consulta y te llamaremos lo antes posible. Estos son los datos que nos has enviado:</p></td></tr>'
      . '<tr><td style="padding:8px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $filasCli . '</table></td></tr>'
      . '<tr><td style="padding:18px 28px 0"><div style="background:#fff4ec;border-left:4px solid #f47b29;padding:14px 16px;color:#0b013e;font-size:15px;line-height:1.5"><strong>¿Algún dato no es correcto?</strong> Responde a este correo indicándolo o llámanos y lo corregimos.</div></td></tr>'
      . '<tr><td style="padding:22px 28px 18px"><a href="tel:+34630553494" style="' . $btn . ';background:#f47b29;color:#fff">Llamar al 630 55 34 94</a>'
      . '<a href="https://wa.me/34630553494" style="' . $btn . ';background:#0b013e;color:#fff">WhatsApp</a></td></tr>'
      . '<tr><td style="padding:18px 28px;background:#0b013e;color:#cfcce3;font-size:13px;line-height:1.6"><strong style="color:#fff">Motodest</strong> · Concesionario oficial en Barbate<br>Av. de la Mar, 114 · 11160 Barbate (Cádiz)<br>Lunes a viernes 10:00–14:00 y 17:00–20:00 · Sábado 10:00–13:00<br><a href="https://motodest.com" style="color:#f47b29;text-decoration:none">motodest.com</a></td></tr>'
      . '<tr><td style="padding:14px 28px;color:#8b88a6;font-size:11px;line-height:1.5">Recibes este correo porque has enviado una consulta en motodest.com. Si no has sido tú, ignóralo. Responsable: Motodest. Más información en la política de privacidad de la web.</td></tr>'
      . '</table></td></tr></table></body></html>';
    $textoCli = "Gracias, " . explode(' ', $nombre)[0] . ".\n\nHemos recibido tu consulta y te llamaremos lo antes posible. Estos son los datos que nos has enviado:\n\n"
              . "Nombre: $nombre\nTeléfono: $telefono\nEmail: $email\nMoto: " . ($moto ?: '-') . "\n" . ($mensaje ? "Mensaje: $mensaje\n" : '')
              . "Ofertas: " . ($comercial ? 'Sí' : 'No') . "\n\n¿Algún dato no es correcto? Responde a este correo o llámanos al 630 55 34 94.\n\n"
              . "Motodest · Av. de la Mar, 114 · 11160 Barbate (Cádiz) · motodest.com\n";
    $lim2 = 'md' . bin2hex(random_bytes(8));
    $mimeCli = "--$lim2\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($textoCli))
             . "--$lim2\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($htmlCli))
             . "--$lim2--";
    $cabCli = implode("\r\n", [
        'From: Motodest <' . DESTINO . '>',
        'Reply-To: Motodest <' . DESTINO . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $lim2 . '"',
        'Auto-Submitted: auto-replied',
        'X-Mailer: motodest.com',
    ]);
    @mail($email, '=?UTF-8?B?' . base64_encode('Hemos recibido tu consulta - Motodest') . '?=', $mimeCli, $cabCli, '-f' . DESTINO);
}

volver(GRACIAS);
