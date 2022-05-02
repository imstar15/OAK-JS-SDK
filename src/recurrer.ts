import * as _ from 'lodash'
import { ADDITIONAL_UNIT, DAYS_IN_WEEK, HOUR_IN_DAY, MIN_IN_HOUR, MS_IN_SEC, NO_DIFF, SEC_IN_MIN } from './constants'

// For producing recurring timestamps
export class Recurrer {
  /**
   * Input starting timestamp in milliseconds along with desired hour of day.
   * Output up to 24 daily recurring timestamps in milliseconds
   * @param startTimestamp 
   * @param numberRecurring 
   * @param hourOfDay 
   * @returns daily recurring timestamps
   */
  getDailyRecurringTimestamps(startTimestamp: number, numberRecurring: number, hourOfDay: HourOfDay): number[] {
    const startDate = new Date(startTimestamp)
    const startHour = startDate.getUTCHours()
    const startYear = startDate.getUTCFullYear()
    const startMonth = startDate.getUTCMonth()
    const startDay = startHour < hourOfDay ? startDate.getUTCDate() : startDate.getUTCDate() + ADDITIONAL_UNIT
    const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay)
    const milliSecondsInDay = HOUR_IN_DAY * MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC
    return _.times(numberRecurring, (index) => {
      return firstEventTimestamp + index * milliSecondsInDay
    })
  }

  /**
   * Input starting timestamp in milliseconds.
   * Output up to 24 hourly recurring timestamps in milliseconds
   * @param startTimestamp 
   * @param numberRecurring 
   * @returns hourly recurring timestamps
   */
  getHourlyRecurringTimestamps(startTimestamp: number, numberRecurring: number): number[] {
    const secondsInHour = MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC
    const firstEventTimestamp = startTimestamp - (startTimestamp % secondsInHour) + secondsInHour
    return _.times(numberRecurring, (index) => {
      return firstEventTimestamp + index * secondsInHour
    })
  }

  private findWeekdayStartDate(startWeekday: number, dayOfWeek: DayOfWeek, canStartSameDay: boolean): number {
    const isSameDayOfWeek = startWeekday - dayOfWeek === NO_DIFF
    if (isSameDayOfWeek) {
      if (canStartSameDay) {
        return NO_DIFF
      } else {
        return DAYS_IN_WEEK
      }
    } else if (startWeekday > dayOfWeek) {
      return DAYS_IN_WEEK - (startWeekday - dayOfWeek)
    } else {
      return dayOfWeek - startWeekday
    }
  }

  /**
   * Input starting timestamp in milliseconds along with desired day of week and hour of day.
   * Output up to 24 weekly recurring timestamps in milliseconds
   * @param startTimestamp 
   * @param numberRecurring 
   * @param hourOfDay 
   * @param dayOfWeek 
   * @returns weekly recurring timestamps
   */
  getWeeklyRecurringTimestamps(
    startTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dayOfWeek: DayOfWeek
  ): number[] {
    const secondsInWeek = DAYS_IN_WEEK * HOUR_IN_DAY * MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC
    const startDate = new Date(startTimestamp)
    const startHour = startDate.getUTCHours()
    const startYear = startDate.getUTCFullYear()
    const startMonth = startDate.getUTCMonth()
    const startWeekday = startDate.getUTCDay()
    const startDay = startDate.getUTCDate() + this.findWeekdayStartDate(startWeekday, dayOfWeek, startHour < hourOfDay)
    const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay)
    return _.times(numberRecurring, (index) => {
      return firstEventTimestamp + index * secondsInWeek
    })
  }

  /**
   * Input starting timestamp in milliseconds along with desired date of month and hour of day.
   * Output up to 6 monthly recurring timestamps in milliseconds
   * @param startTimestamp 
   * @param numberRecurring 
   * @param hourOfDay 
   * @param dateOfMonth 
   * @returns monthly recurring timestamps
   */
  getMonthlyRecurringTimestampsByDate(
    startTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dateOfMonth: DateOfMonth
  ): number[] {
    const startDate = new Date(startTimestamp)
    const startYear = startDate.getUTCFullYear()
    const startDay = startDate.getUTCDate()
    const startMonth = startDay < dateOfMonth ? startDate.getUTCMonth() : startDate.getUTCMonth() + ADDITIONAL_UNIT
    return _.times(numberRecurring, (index) => {
      return Date.UTC(startYear, startMonth + index, dateOfMonth, hourOfDay)
    })
  }

  private findDayOfWeekInMonthForStartDate(
    startYear: number,
    startMonth: number,
    dayOfWeek: DayOfWeek,
    weekOfMonth: WeekOfMonth
  ): number {
    const secondsInWeek = DAYS_IN_WEEK * HOUR_IN_DAY * MIN_IN_HOUR * SEC_IN_MIN * MS_IN_SEC
    const firstDayOfMonth = new Date(Date.UTC(startYear, startMonth))
    const firstDayOfMonthWeekday = firstDayOfMonth.getUTCDay()
    const dateOfFirstDayOfWeekInMonth =
      this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + ADDITIONAL_UNIT
    const dateOfMonthTimestamp =
      Date.UTC(startYear, startMonth, dateOfFirstDayOfWeekInMonth) + secondsInWeek * (weekOfMonth - ADDITIONAL_UNIT)
    return new Date(dateOfMonthTimestamp).getUTCDate()
  }

  /**
   * Input starting timestamp in milliseconds along with desired week of month, day of week and hour of day.
   * Output up to 6 monthly recurring timestamps in milliseconds
   * @param inputTimestamp 
   * @param numberRecurring 
   * @param hourOfDay 
   * @param dayOfWeek 
   * @param weekOfMonth 
   * @returns monthly recurring timestamps
   */
  getMonthlyRecurringTimestampsByWeekday(
    inputTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dayOfWeek: DayOfWeek,
    weekOfMonth: WeekOfMonth
  ): number[] {
    if (weekOfMonth > 4) {
      throw new Error('Can only schedule monthly recurring tasks based on week for the first 4 weeks of a month')
    }
    const inputDate = new Date(inputTimestamp)
    const inputYear = inputDate.getUTCFullYear()
    const inputMonth = inputDate.getUTCMonth()
    const inputDay = this.findDayOfWeekInMonthForStartDate(inputYear, inputMonth, dayOfWeek, weekOfMonth)
    const inputMonthEventTimestamp = Date.UTC(inputYear, inputMonth, inputDay, hourOfDay)
    const firstEventMonth = inputMonthEventTimestamp >= inputTimestamp ? inputMonth : inputMonth + ADDITIONAL_UNIT
    return _.times(numberRecurring, (index) => {
      const newMonth = firstEventMonth + index
      const newDate = this.findDayOfWeekInMonthForStartDate(inputYear, newMonth, dayOfWeek, weekOfMonth)
      return Date.UTC(inputYear, newMonth, newDate, hourOfDay)
    })
  }
}
