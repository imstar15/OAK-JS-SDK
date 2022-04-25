import _ from 'lodash'

// For producing recurring timestamps
export default class Recurrer {
  async getDailyRecurringTimestamps(
    startTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay
  ): Promise<number[]> {
    const startDate = new Date(startTimestamp)
    const startHour = startDate.getUTCHours()
    const startYear = startDate.getUTCFullYear()
    const startMonth = startDate.getUTCMonth()
    const startDay = startHour < hourOfDay ? startDate.getUTCDate() : startDate.getUTCDate() + 1
    const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay)
    const secondsInDay = 24 * 60 * 60
    return _.times(numberRecurring, (index) => {
      return firstEventTimestamp + index * secondsInDay
    })
  }

  async getHourlyRecurringTimestamps(startTimestamp: number, numberRecurring: number): Promise<number[]> {
    const secondsInHour = 60 * 60
    const firstEventTimestamp = startTimestamp - (startTimestamp % secondsInHour) + secondsInHour
    return _.times(numberRecurring, (index) => {
      return firstEventTimestamp + index * secondsInHour
    })
  }

  private findWeekdayStartDate(startWeekday: number, dayOfWeek: DayOfWeek, canStartSameDay: boolean): number {
    const isSameDayOfWeek = startWeekday - dayOfWeek === 0
    if (isSameDayOfWeek) {
      if (canStartSameDay) {
        return 0
      } else {
        return 7
      }
    } else if (startWeekday > dayOfWeek) {
      return 7 - (startWeekday - dayOfWeek)
    } else {
      return dayOfWeek - startWeekday
    }
  }

  async getWeeklyRecurringTimestamps(
    startTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dayOfWeek: DayOfWeek
  ): Promise<number[]> {
    const secondsInWeek = 7 * 24 * 60 * 60
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

  async getMonthlyRecurringTimestampsByDate(
    startTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dateOfMonth: DateOfMonth
  ): Promise<number[]> {
    const startDate = new Date(startTimestamp)
    const startYear = startDate.getUTCFullYear()
    const startDay = startDate.getUTCDate()
    const startMonth = startDay < dateOfMonth ? startDate.getUTCMonth() : startDate.getUTCMonth() + 1
    return _.times(numberRecurring, (index) => {
      return Date.UTC(startYear, startMonth + index, startDay, hourOfDay)
    })
  }

  private findDayOfWeekInMonthForStartDate(
    startYear: number,
    startMonth: number,
    dayOfWeek: DayOfWeek,
    weekOfMonth: WeekOfMonth
  ): number {
    const secondsInWeek = 7 * 24 * 60 * 60
    const firstDayOfMonth = new Date(Date.UTC(startYear, startMonth))
    const firstDayOfMonthWeekday = firstDayOfMonth.getDay()
    const dateOfFirstDayOfWeekInMonth = this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + 1
    const dateOfMonth = dateOfFirstDayOfWeekInMonth + secondsInWeek * (weekOfMonth - 1)
    return dateOfMonth
  }

  async getMonthlyRecurringTimestampsByWeekday(
    inputTimestamp: number,
    numberRecurring: number,
    hourOfDay: HourOfDay,
    dayOfWeek: DayOfWeek,
    weekOfMonth: WeekOfMonth
  ): Promise<number[]> {
    const inputDate = new Date(inputTimestamp)
    const inputYear = inputDate.getUTCFullYear()
    const inputMonth = inputDate.getUTCMonth()
    const inputDay = this.findDayOfWeekInMonthForStartDate(inputYear, inputMonth, dayOfWeek, weekOfMonth)
    const inputMonthEventTimestamp = Date.UTC(inputYear, inputMonth, inputDay, hourOfDay)
    const firstEventMonth = inputMonthEventTimestamp >= inputTimestamp ? inputMonth : inputMonth + 1
    return _.times(numberRecurring, (index) => {
      const newMonth = firstEventMonth + index
      const newDate = this.findDayOfWeekInMonthForStartDate(inputYear, newMonth, dayOfWeek, weekOfMonth)
      return Date.UTC(inputYear, newMonth, newDate, hourOfDay)
    })
  }
}
