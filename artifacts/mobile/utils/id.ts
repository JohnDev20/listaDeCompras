// Do not use the 'uuid' package — it requires crypto.getRandomValues()
// which crashes on iOS/Android in this environment.
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}
