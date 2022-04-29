import * as _ from 'lodash'
import { Recurrer } from '../src/recurrer'

test('getDailyRecurringTimestamps', async () => {
  const numberRecurring = 20
  const hourOfDay = 0
  const currentTime = Date.now()
  const recurrer = new Recurrer()
  const times = recurrer.getDailyRecurringTimestamps(currentTime, numberRecurring, hourOfDay)
  expect(times.length).toBe(numberRecurring)
  _.forEach(times, (time, index) => {
    const currentMonth = (new Date(currentTime)).getUTCMonth()
    const currentYear = (new Date(currentTime)).getUTCFullYear()
    const currentHour = (new Date(currentTime)).getUTCHours()
    const currentDay = currentHour >= hourOfDay ? (new Date(currentTime)).getUTCDate() + 1 : (new Date(currentTime)).getUTCDate()
    const newExpectedDate = (Date.UTC(currentYear, currentMonth, currentDay + index, hourOfDay))
    expect(time).toBe(newExpectedDate)
  })
})

test('getHourlyRecurringTimestamps', async () => {
  const numberRecurring = 20
  const currentTime = Date.now()
  const recurrer = new Recurrer()
  const times = recurrer.getHourlyRecurringTimestamps(currentTime, numberRecurring)
  expect(times.length).toBe(20)
  _.forEach(times, (time, index) => {
    const currentMonth = (new Date(currentTime)).getUTCMonth()
    const currentYear = (new Date(currentTime)).getUTCFullYear()
    const currentDay = (new Date(currentTime)).getUTCDate()
    const currentHour = (new Date(currentTime)).getUTCHours()
    const newExpectedDate = (Date.UTC(currentYear, currentMonth, currentDay, currentHour + index + 1))
    expect(time).toBe(newExpectedDate)
  })
})

test('getMonthlyRecurringTimestampsByDate', async () => {
  const numberRecurring = 20
  const hourOfDay = 23
  const dateOfMonth = 11
  const currentTime = Date.now()
  const recurrer = new Recurrer()
  const times = recurrer.getMonthlyRecurringTimestampsByDate(currentTime, numberRecurring, hourOfDay, dateOfMonth)
  expect(times.length).toBe(20)
  _.forEach(times, (time, index) => {
    const currentMonth = (new Date(currentTime)).getUTCMonth()
    const currentYear = (new Date(currentTime)).getUTCFullYear()
    const newExpectedDate = (Date.UTC(currentYear, currentMonth + index + 1, dateOfMonth, hourOfDay))
    expect(time).toBe(newExpectedDate)
  })
})

test('getMonthlyRecurringTimestampsByWeekday', async () => {
  const numberRecurring = 20
  const hourOfDay = 23
  const dayOfWeek = 5
  const weekOfMonth = 3
  const currentTime = Date.now()
  const recurrer = new Recurrer()
  const times = recurrer.getMonthlyRecurringTimestampsByWeekday(currentTime, numberRecurring, hourOfDay, dayOfWeek, weekOfMonth)
  expect(times.length).toBe(20)
  _.forEach(times, (time, index) => {
    const newTime = new Date(time)
    expect(newTime.getUTCDay()).toBe(dayOfWeek)
    expect(newTime.getUTCMonth()).toBe(((new Date(currentTime)).getUTCMonth() + index + 1) % 12)
  })
})

test('getWeeklyRecurringTimestamps', async () => {
  const numberRecurring = 20
  const hourOfDay = 18
  const dayOfWeek = 5
  const currentTime = Date.now()
  const recurrer = new Recurrer()
  const times = recurrer.getWeeklyRecurringTimestamps(currentTime, numberRecurring, hourOfDay, dayOfWeek)
  const firstExpectedInstance = times[0]
  expect(times.length).toBe(20)
  _.forEach(times, (time, index) => {
    const newTime = new Date(time)
    const weekOfTime = 7 * 24 * 60 * 60
    expect(newTime.getUTCDay()).toBe(dayOfWeek)
    expect(time).toBe(firstExpectedInstance + (weekOfTime * index * 1000))
  })
})
