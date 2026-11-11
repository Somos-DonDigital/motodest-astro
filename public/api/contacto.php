<?php
// Envío del formulario de contacto de motodest.com
// Va en el propio hosting (cPanel). Si el servidor no entrega bien con mail(),
// cambiar a SMTP autenticado de la cuenta contacto@.
declare(strict_types=1);

const DESTINO   = 'contacto@motodest.com';
const REMITENTE = 'web@motodest.com';   // Debe existir o estar autorizado en el SPF del dominio
const GRACIAS   = '/gracias/';
// Logo incrustado en el correo (CID) para que se vea sin tener que aceptar imágenes
const LOGO_PNG  = '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';

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


function mimeCorreo(string $texto, string $html, ?string &$tipo): string {
    $alt = 'alt' . bin2hex(random_bytes(8));
    $rel = 'rel' . bin2hex(random_bytes(8));
    $tipo = 'multipart/related; type="multipart/alternative"; boundary="' . $rel . '"';
    return "--$rel\r\nContent-Type: multipart/alternative; boundary=\"$alt\"\r\n\r\n"
         . "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($texto))
         . "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
         . "--$alt--\r\n"
         . "--$rel\r\nContent-Type: image/png; name=\"motodest.png\"\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <logo-motodest>\r\nContent-Disposition: inline; filename=\"motodest.png\"\r\n\r\n" . chunk_split(LOGO_PNG)
         . "--$rel--";
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
  . '<tr><td style="background:#0b013e;padding:22px 28px"><img src="cid:logo-motodest" width="180" alt="Motodest" style="display:block;border:0"></td></tr>'
  . '<tr><td style="height:5px;background:#f47b29;font-size:0;line-height:0">&nbsp;</td></tr>'
  . '<tr><td style="padding:28px 28px 8px"><p style="margin:0 0 6px;color:#f47b29;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em">' . $etiqueta . '</p>'
  . '<h1 style="margin:0;color:#0b013e;font-size:24px;line-height:1.25">Nueva consulta' . ($moto ? ' sobre la ' . e($moto) : '') . '</h1></td></tr>'
  . '<tr><td style="padding:8px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $filas . '</table></td></tr>'
  . ($mensaje ? '<tr><td style="padding:18px 28px 0"><p style="margin:0 0 6px;color:#6b678a;font-size:13px;text-transform:uppercase;letter-spacing:.06em">Mensaje</p><div style="background:#f7f6fb;border-left:4px solid #f47b29;padding:14px 16px;color:#0b013e;font-size:15px;line-height:1.5">' . nl2br(e($mensaje)) . '</div></td></tr>' : '')
  . '<tr><td style="padding:24px 28px 18px">' . $botones . '</td></tr>'
  . '<tr><td style="padding:16px 28px;background:#f7f6fb;color:#8b88a6;font-size:12px;line-height:1.5">Enviado desde motodest.com' . e($origen) . '<br>' . date('d/m/Y H:i') . ' · IP ' . e($ip) . '</td></tr>'
  . '</table></td></tr></table></body></html>';

$cuerpoMime = mimeCorreo($cuerpo, $html, $tipoMime);

$cabeceras = implode("\r\n", [
    'From: Web Motodest <' . REMITENTE . '>',
    'Reply-To: ' . ($email ? '=?UTF-8?B?' . base64_encode($nombre) . '?= <' . $email . '>' : DESTINO),
    'MIME-Version: 1.0',
    'Content-Type: ' . $tipoMime,
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
      . '<tr><td style="background:#0b013e;padding:22px 28px"><img src="cid:logo-motodest" width="180" alt="Motodest" style="display:block;border:0"></td></tr>'
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
    $mimeCli = mimeCorreo($textoCli, $htmlCli, $tipoCli);
    $cabCli = implode("\r\n", [
        'From: Motodest <' . DESTINO . '>',
        'Reply-To: Motodest <' . DESTINO . '>',
        'MIME-Version: 1.0',
        'Content-Type: ' . $tipoCli,
        'Auto-Submitted: auto-replied',
        'X-Mailer: motodest.com',
    ]);
    @mail($email, '=?UTF-8?B?' . base64_encode('Hemos recibido tu consulta - Motodest') . '?=', $mimeCli, $cabCli, '-f' . DESTINO);
}

volver(GRACIAS);
