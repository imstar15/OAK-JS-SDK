import { Observer } from '../src/observer'

// describe('Observer class', () => {
//   it('getAutomationTimeLastTimeSlot', async () => {
//     const websocket = 'wss://rpc.testnet.oak.tech'
//     const observer = new Observer(websocket)
//     const lastTimeSlot = await observer.getAutomationTimeLastTimeSlot()
//     console.log(lastTimeSlot)
//     expect(lastTimeSlot.length).toBe(2)
//     expect(typeof lastTimeSlot[0]).toBe('number')
//     expect(typeof lastTimeSlot[0]).toBe('number')
//   })
// })


test('getAutomationTimeLastTimeSlot', async () => {
  const websocket = 'wss://rpc.testnet.oak.tech'
  const observer = new Observer(websocket)
  const lastTimeSlot = await observer.getAutomationTimeLastTimeSlot()
  console.log(lastTimeSlot)
  expect(lastTimeSlot.length).toBe(2)
  expect(typeof lastTimeSlot[0]).toBe('number')
  expect(typeof lastTimeSlot[0]).toBe('number')
})