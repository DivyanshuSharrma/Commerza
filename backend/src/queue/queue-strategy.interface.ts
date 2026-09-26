export interface QueueStrategy {
  enqueue(jobName: string, data: any): Promise<void>;
}
