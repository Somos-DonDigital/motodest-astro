// Cuota mensual (sistema francés), redondeada al céntimo como la calcula la financiera.
// Una sola fórmula para la ficha, la calculadora y el asistente.
export const centimos = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function cuotaMensual(capital: number, tinAnual: number, meses: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  const r = tinAnual / 100 / 12;
  return centimos(r === 0 ? capital / meses : (capital * r) / (1 - Math.pow(1 + r, -meses)));
}

/** Capital financiado: precio menos entrada, más la comisión de apertura si se financia. */
export const capitalFinanciado = (precio: number, entrada: number, comisionPct: number) =>
  centimos(Math.max(0, precio - entrada) * (1 + comisionPct / 100));
