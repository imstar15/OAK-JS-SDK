import * as _ from 'lodash';
import { ADDITIONAL_UNIT, DAYS_IN_WEEK, HOUR_IN_DAY, MIN_IN_HOUR, MS_IN_SEC, NO_DIFF, SEC_IN_MIN } from './constants';
// For producing recurring timestamps
export class Recurrer {
    getDailyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay) {
        const startDate = new Date(startTimestamp);
        const startHour = startDate.getUTCHours();
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth();
        const startDay = startHour < hourOfDay ? startDate.getUTCDate() : startDate.getUTCDate() + ADDITIONAL_UNIT;
        const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
        const milliSecondsInDay = HOUR_IN_DAY * MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC;
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * milliSecondsInDay;
        });
    }
    getHourlyRecurringTimestamps(startTimestamp, numberRecurring) {
        const secondsInHour = MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC;
        const firstEventTimestamp = startTimestamp - (startTimestamp % secondsInHour) + secondsInHour;
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * secondsInHour;
        });
    }
    findWeekdayStartDate(startWeekday, dayOfWeek, canStartSameDay) {
        const isSameDayOfWeek = startWeekday - dayOfWeek === NO_DIFF;
        if (isSameDayOfWeek) {
            if (canStartSameDay) {
                return NO_DIFF;
            }
            else {
                return DAYS_IN_WEEK;
            }
        }
        else if (startWeekday > dayOfWeek) {
            return DAYS_IN_WEEK - (startWeekday - dayOfWeek);
        }
        else {
            return dayOfWeek - startWeekday;
        }
    }
    getWeeklyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay, dayOfWeek) {
        const secondsInWeek = DAYS_IN_WEEK * HOUR_IN_DAY * MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC;
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
        const startMonth = startDay < dateOfMonth ? startDate.getUTCMonth() : startDate.getUTCMonth() + ADDITIONAL_UNIT;
        return _.times(numberRecurring, (index) => {
            return Date.UTC(startYear, startMonth + index, dateOfMonth, hourOfDay);
        });
    }
    findDayOfWeekInMonthForStartDate(startYear, startMonth, dayOfWeek, weekOfMonth) {
        const secondsInWeek = DAYS_IN_WEEK * HOUR_IN_DAY * MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC;
        const firstDayOfMonth = new Date(Date.UTC(startYear, startMonth));
        const firstDayOfMonthWeekday = firstDayOfMonth.getUTCDay();
        const dateOfFirstDayOfWeekInMonth = this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + ADDITIONAL_UNIT;
        const dateOfMonthTimestamp = Date.UTC(startYear, startMonth, dateOfFirstDayOfWeekInMonth) + secondsInWeek * (weekOfMonth - ADDITIONAL_UNIT);
        return new Date(dateOfMonthTimestamp).getUTCDate();
    }
    getMonthlyRecurringTimestampsByWeekday(inputTimestamp, numberRecurring, hourOfDay, dayOfWeek, weekOfMonth) {
        if (weekOfMonth > 4) {
            throw new Error('Can only schedule monthly recurring tasks based on week for the first 4 weeks of a month');
        }
        const inputDate = new Date(inputTimestamp);
        console.log('input date: ', inputDate);
        const inputYear = inputDate.getUTCFullYear();
        const inputMonth = inputDate.getUTCMonth();
        const inputDay = this.findDayOfWeekInMonthForStartDate(inputYear, inputMonth, dayOfWeek, weekOfMonth);
        const inputMonthEventTimestamp = Date.UTC(inputYear, inputMonth, inputDay, hourOfDay);
        console.log(new Date(inputMonthEventTimestamp));
        const firstEventMonth = inputMonthEventTimestamp >= inputTimestamp ? inputMonth : inputMonth + ADDITIONAL_UNIT;
        console.log(firstEventMonth);
        return _.times(numberRecurring, (index) => {
            const newMonth = firstEventMonth + index;
            const newDate = this.findDayOfWeekInMonthForStartDate(inputYear, newMonth, dayOfWeek, weekOfMonth);
            return Date.UTC(inputYear, newMonth, newDate, hourOfDay);
        });
    }
}
//# sourceMappingURL=recurrer.js.map