export function required(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function toArray(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toImageArray(value: FormDataEntryValue | null) {
  const list = toArray(value);
  return list.length ? list : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1100&q=85"];
}
