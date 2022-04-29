"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recurrer = void 0;
const _ = require("lodash");
const constants_1 = require("./constants");
// For producing recurring timestamps
class Recurrer {
    getDailyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay) {
        const startDate = new Date(startTimestamp);
        const startHour = startDate.getUTCHours();
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth();
        const startDay = startHour < hourOfDay ? startDate.getUTCDate() : startDate.getUTCDate() + constants_1.ADDITIONAL_UNIT;
        const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
        const milliSecondsInDay = constants_1.HOUR_IN_DAY * constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * milliSecondsInDay;
        });
    }
    getHourlyRecurringTimestamps(startTimestamp, numberRecurring) {
        const secondsInHour = constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        const firstEventTimestamp = startTimestamp - (startTimestamp % secondsInHour) + secondsInHour;
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * secondsInHour;
        });
    }
    findWeekdayStartDate(startWeekday, dayOfWeek, canStartSameDay) {
        const isSameDayOfWeek = startWeekday - dayOfWeek === constants_1.NO_DIFF;
        if (isSameDayOfWeek) {
            if (canStartSameDay) {
                return constants_1.NO_DIFF;
            }
            else {
                return constants_1.DAYS_IN_WEEK;
            }
        }
        else if (startWeekday > dayOfWeek) {
            return constants_1.DAYS_IN_WEEK - (startWeekday - dayOfWeek);
        }
        else {
            return dayOfWeek - startWeekday;
        }
    }
    getWeeklyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay, dayOfWeek) {
        const secondsInWeek = constants_1.DAYS_IN_WEEK * constants_1.HOUR_IN_DAY * constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        const startDate = new Date(startTimestamp);
        const startHour = startDate.getUTCHours();
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth();
        const startWeekday = startDate.getUTCDay();
        const startDay = startDate.getUTCDate() + this.findWeekdayStartDate(startWeekday, dayOfWeek, startHour < hourOfDay);
        const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * secondsInWeek;
        });
    }
    getMonthlyRecurringTimestampsByDate(startTimestamp, numberRecurring, hourOfDay, dateOfMonth) {
        const startDate = new Date(startTimestamp);
        const startYear = startDate.getUTCFullYear();
        const startDay = startDate.getUTCDate();
        const startMonth = startDay < dateOfMonth ? startDate.getUTCMonth() : startDate.getUTCMonth() + constants_1.ADDITIONAL_UNIT;
        return _.times(numberRecurring, (index) => {
            return Date.UTC(startYear, startMonth + index, dateOfMonth, hourOfDay);
        });
    }
    findDayOfWeekInMonthForStartDate(startYear, startMonth, dayOfWeek, weekOfMonth) {
        const secondsInWeek = constants_1.DAYS_IN_WEEK * constants_1.HOUR_IN_DAY * constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        const firstDayOfMonth = new Date(Date.UTC(startYear, startMonth));
        const firstDayOfMonthWeekday = firstDayOfMonth.getDay();
        const dateOfFirstDayOfWeekInMonth = this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + constants_1.ADDITIONAL_UNIT;
        const dateOfMonthTimestamp = Date.UTC(startYear, startMonth, dateOfFirstDayOfWeekInMonth) + secondsInWeek * (weekOfMonth - constants_1.ADDITIONAL_UNIT);
        return new Date(dateOfMonthTimestamp).getDate();
    }
    getMonthlyRecurringTimestampsByWeekday(inputTimestamp, numberRecurring, hourOfDay, dayOfWeek, weekOfMonth) {
        const inputDate = new Date(inputTimestamp);
        const inputYear = inputDate.getUTCFullYear();
        const inputMonth = inputDate.getUTCMonth();
        const inputDay = this.findDayOfWeekInMonthForStartDate(inputYear, inputMonth, dayOfWeek, weekOfMonth);
        const inputMonthEventTimestamp = Date.UTC(inputYear, inputMonth, inputDay, hourOfDay);
        const firstEventMonth = inputMonthEventTimestamp >= inputTimestamp ? inputMonth : inputMonth + constants_1.ADDITIONAL_UNIT;
        return _.times(numberRecurring, (index) => {
            const newMonth = firstEventMonth + index;
            const newDate = this.findDayOfWeekInMonthForStartDate(inputYear, newMonth, dayOfWeek, weekOfMonth);
            return Date.UTC(inputYear, newMonth, newDate, hourOfDay);
        });
    }
}
exports.Recurrer = Recurrer;
//# sourceMappingURL=recurrer.js.map