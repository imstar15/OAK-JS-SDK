"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
// For producing recurring timestamps 
class Recurrer {
    getDailyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const startDate = new Date(startTimestamp);
            const startHour = startDate.getUTCHours();
            const startYear = startDate.getUTCFullYear();
            const startMonth = startDate.getUTCMonth();
            const startDay = (startHour < hourOfDay) ? startDate.getUTCDate() : startDate.getUTCDate() + 1;
            const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
            const secondsInDay = 24 * 60 * 60;
            return lodash_1.default.times(numberRecurring, index => firstEventTimestamp + (index * secondsInDay));
        });
    }
    getHourlyRecurringTimestamps(startTimestamp, numberRecurring) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const secondsInHour = 60 * 60;
            const firstEventTimestamp = startTimestamp - (startTimestamp % secondsInHour) + secondsInHour;
            return lodash_1.default.times(numberRecurring, index => firstEventTimestamp + (index * secondsInHour));
        });
    }
    findWeekdayStartDate(startWeekday, dayOfWeek, canStartSameDay) {
        const isSameDayOfWeek = startWeekday - dayOfWeek === 0;
        if (isSameDayOfWeek) {
            if (canStartSameDay) {
                return 0;
            }
            else {
                return 7;
            }
        }
        else if (startWeekday > dayOfWeek) {
            return 7 - (startWeekday - dayOfWeek);
        }
        else {
            return dayOfWeek - startWeekday;
        }
    }
    getWeeklyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay, dayOfWeek) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const secondsInWeek = 7 * 24 * 60 * 60;
            const startDate = new Date(startTimestamp);
            const startHour = startDate.getUTCHours();
            const startYear = startDate.getUTCFullYear();
            const startMonth = startDate.getUTCMonth();
            const startWeekday = startDate.getDay();
            const startDay = startDate.getUTCDate() + this.findWeekdayStartDate(startWeekday, dayOfWeek, startHour >= hourOfDay);
            const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
            return lodash_1.default.times(numberRecurring, index => firstEventTimestamp + (index * secondsInWeek));
        });
    }
    getMonthlyRecurringTimestampsByDate(startTimestamp, numberRecurring, hourOfDay, dateOfMonth) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const startDate = new Date(startTimestamp);
            const startYear = startDate.getUTCFullYear();
            const startDay = startDate.getUTCDate();
            const startMonth = (startDay < dateOfMonth) ? startDate.getUTCMonth() : startDate.getUTCMonth() + 1;
            return lodash_1.default.times(numberRecurring, index => {
                return Date.UTC(startYear, startMonth + index, startDay, hourOfDay);
            });
        });
    }
    findDayOfWeekInMonthForStartDate(startYear, startMonth, dayOfWeek, weekOfMonth) {
        const secondsInWeek = 7 * 24 * 60 * 60;
        const firstDayOfMonth = new Date(Date.UTC(startYear, startMonth));
        const firstDayOfMonthWeekday = firstDayOfMonth.getDay();
        const dateOfFirstDayOfWeekInMonth = this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + 1;
        const dateOfMonth = dateOfFirstDayOfWeekInMonth + (secondsInWeek * (weekOfMonth - 1));
        return dateOfMonth;
    }
    getMonthlyRecurringTimestampsByWeekday(inputTimestamp, numberRecurring, hourOfDay, dayOfWeek, weekOfMonth) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const inputDate = new Date(inputTimestamp);
            const inputYear = inputDate.getUTCFullYear();
            const inputMonth = inputDate.getUTCMonth();
            const inputDay = this.findDayOfWeekInMonthForStartDate(inputYear, inputMonth, dayOfWeek, weekOfMonth);
            const inputMonthEventTimestamp = Date.UTC(inputYear, inputMonth, inputDay, hourOfDay);
            const firstEventMonth = (inputMonthEventTimestamp >= inputTimestamp) ? inputMonth : inputMonth + 1;
            return lodash_1.default.times(numberRecurring, index => {
                const newMonth = firstEventMonth + index;
                const newDate = this.findDayOfWeekInMonthForStartDate(inputYear, newMonth, dayOfWeek, weekOfMonth);
                return Date.UTC(inputYear, newMonth, newDate, hourOfDay);
            });
        });
    }
}
exports.default = Recurrer;
//# sourceMappingURL=recurrer.js.map