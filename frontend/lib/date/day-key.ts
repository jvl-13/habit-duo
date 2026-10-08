export function getDayKey(date: Date = new Date()) {
    return date.toISOString().slice(0, 10);
}

export function isHabitAvailableOnDay(
    startDay: string,
    daykey: string
) {
    return startDay.slice(0, 10) <= daykey;
}