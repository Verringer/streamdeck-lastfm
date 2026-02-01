interface PollingTask {
  id: string;
  interval: number;
  lastRun: number;
  isRunning: boolean;
  callback: () => Promise<void>;
  onError?: (error: Error) => void;
}

class PollingService {
  private static instance: PollingService;
  private tasks: Map<string, PollingTask> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): PollingService {
    if (!PollingService.instance) {
      PollingService.instance = new PollingService();
    }
    return PollingService.instance;
  }

  createTask(
    id: string,
    callback: () => Promise<void>,
    intervalMs: number,
    options: {
      immediate?: boolean;
      onError?: (error: Error) => void;
    } = {}
  ): void {
    // Remove existing task if it exists
    this.removeTask(id);

    const task: PollingTask = {
      id,
      interval: intervalMs,
      lastRun: 0,
      isRunning: false,
      callback,
      onError: options.onError
    };

    this.tasks.set(id, task);

    if (options.immediate) {
      this.executeTask(id);
    } else {
      this.scheduleNextRun(id);
    }
  }

  private async executeTask(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task || task.isRunning) {
      return;
    }

    task.isRunning = true;
    task.lastRun = Date.now();

    try {
      await task.callback();
    } catch (error) {
      console.error(`Polling task ${id} failed:`, error);
      if (task.onError) {
        task.onError(error as Error);
      }
    } finally {
      task.isRunning = false;
      this.scheduleNextRun(id);
    }
  }

  private scheduleNextRun(id: string): void {
    const task = this.tasks.get(id);
    if (!task) {
      return;
    }

    // Clear existing timeout
    const existingTimeout = this.timeouts.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const nextRun = Math.max(0, task.lastRun + task.interval - Date.now());
    
    const timeout = setTimeout(() => {
      this.executeTask(id);
    }, nextRun);

    this.timeouts.set(id, timeout);
  }

  removeTask(id: string): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    this.tasks.delete(id);
  }

  updateInterval(id: string, newIntervalMs: number): void {
    const task = this.tasks.get(id);
    if (!task) {
      return;
    }

    task.interval = newIntervalMs;
    this.scheduleNextRun(id);
  }

  pauseTask(id: string): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    const task = this.tasks.get(id);
    if (task) {
      task.isRunning = false;
    }
  }

  resumeTask(id: string): void {
    const task = this.tasks.get(id);
    if (task && !task.isRunning) {
      this.scheduleNextRun(id);
    }
  }

  getTaskStatus(id: string): {
    exists: boolean;
    isRunning: boolean;
    interval: number;
    lastRun: number;
    nextRun: number;
  } | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    return {
      exists: true,
      isRunning: task.isRunning,
      interval: task.interval,
      lastRun: task.lastRun,
      nextRun: task.lastRun + task.interval
    };
  }

  getAllTasks(): Array<{
    id: string;
    isRunning: boolean;
    interval: number;
    lastRun: number;
    nextRun: number;
  }> {
    return Array.from(this.tasks.entries()).map(([id, task]) => ({
      id,
      isRunning: task.isRunning,
      interval: task.interval,
      lastRun: task.lastRun,
      nextRun: task.lastRun + task.interval
    }));
  }

  stopAll(): void {
    // Clear all timeouts
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    this.timeouts.clear();

    // Clear all tasks
    this.tasks.clear();
  }

  getStats(): {
    totalTasks: number;
    runningTasks: number;
    pausedTasks: number;
  } {
    const tasks = Array.from(this.tasks.values());
    return {
      totalTasks: tasks.length,
      runningTasks: tasks.filter(t => t.isRunning).length,
      pausedTasks: tasks.filter(t => !t.isRunning).length
    };
  }
}

export default PollingService;
