export function createWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
