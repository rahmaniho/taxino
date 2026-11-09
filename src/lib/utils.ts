import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** 1840000 → «۱٬۸۴۰٬۰۰۰» */
export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** 1840000 → «۱٬۸۴۰٬۰۰۰» (grouped) */
export function faNumber(value: number): string {
  return toFa(new Intl.NumberFormat("en-US").format(value).replace(/,/g, "٬"));
}

/** Latin digits kept for the pure-English labels (prices are always Persian). */
export function groupEn(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export const TOMAN = "تومان";

/** 1 → «۰۱» (chapter markers) */
export function faIndex(value: number): string {
  return toFa(String(value).padStart(2, "0"));
}
