export function getDayKey(date: Date = new Date()) {
    return date.toISOString().slice(0, 10);
}