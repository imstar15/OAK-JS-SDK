import * as _ from 'lodash'

const MS_IN_SEC = 1000
const SEC_IN_MIN = 60
const MIN_IN_HOUR = 60
const HOUR_IN_DAY = 24
const DAYS_IN_WEEK = 7
const ADDITIONAL_UNIT = 1
const NO_DIFF = 0

// For producing recurring timestamps
export class Recurrer {
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
    const startWeekday = startDate.getDay()
    const startDay = startDate.getUTCDate() + this.findWeekdayStartDate(startWeekday, dayOfWeek, startHour >= hourOfDay)
    const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay)
    return _.times(numberRecurring, (index) => {
      return firstEventTimestamp + index * secondsInWeek
    })
  }

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
    const firstDayOfMonthWeekday = firstDayOfMonth.getDay()
    const dateOfFirstDayOfWeekInMonth =
      this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + ADDITIONAL_UNIT
    const dateOfMonthTimestamp =
      Date.UTC(startYear, startMonth, dateOfFirstDayOfWeekInMonth) + secondsInWeek * (weekOfMonth - ADDITIONAL_UNIT)
    return new Date(dateOfMonthTimestamp).getDate()
  }

  getMonthlyRecurringTimestampsByWeekday(
    inputTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dayOfWeek: DayOfWeek,
    weekOfMonth: WeekOfMonth
  ): number[] {
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
