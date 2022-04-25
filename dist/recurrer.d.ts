export default class Recurrer {
    getDailyRecurringTimestamps(startTimestamp: number, numberRecurring: number, hourOfDay: HourOfDay): Promise<number[]>;
    getHourlyRecurringTimestamps(startTimestamp: number, numberRecurring: number): Promise<number[]>;
    private findWeekdayStartDate;
    getWeeklyRecurringTimestamps(startTimestamp: number, numberRecurring: number, hourOfDay: HourOfDay, dayOfWeek: DayOfWeek): Promise<number[]>;
    getMonthlyRecurringTimestampsByDate(startTimestamp: number, numberRecurring: number, hourOfDay: HourOfDay, dateOfMonth: DateOfMonth): Promise<number[]>;
    private findDayOfWeekInMonthForStartDate;
    getMonthlyRecurringTimestampsByWeekday(inputTimestamp: number, numberRecurring: number, hourOfDay: HourOfDay, dayOfWeek: DayOfWeek, weekOfMonth: WeekOfMonth): Promise<number[]>;
}
