interface AutomationTask {
  ownerId: string
  providedId: `0x${string}`
  time: number
  action: AutomationTaskNotifyAction | AutomationTaskTransferAction
}

interface AutomationTaskNotifyAction {
  notify: {
    message: `0x${string}`
  }
}

interface AutomationTaskTransferAction {
  nativeTransfer: {
    sender: string
    recipient: string
    amount: number
  }
}
