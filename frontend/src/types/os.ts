export interface Process {
  pid: string
  state: string
  burst: number
  priority?: number
}

export interface SystemState {
  processes: Process[]
  cpuUsage: number
  memoryUsage: number
}
