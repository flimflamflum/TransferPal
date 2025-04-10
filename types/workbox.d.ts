interface WorkboxEvent {
  type: string
  target: any
  wasWaitingBeforeRegister?: boolean
}

interface Workbox {
  addEventListener(event: string, callback: (event: WorkboxEvent) => void): void
  register(): void
  messageSkipWaiting(): void
}

declare global {
  interface Window {
    workbox: Workbox
  }
}

export {}

