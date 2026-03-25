import { EventEmitter } from 'events';
import logger from '~/config/logger';

export type JobStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface Job<T = unknown, R = unknown> {
	id: string;
	type: string;
	data: T;
	status: JobStatus;
	result?: R;
	error?: string;
	attempts: number;
	maxRetries: number;
	createdAt: Date;
	startedAt?: Date;
	completedAt?: Date;
}

export interface QueueOptions {
	concurrency?: number;
	defaultRetries?: number;
	retryDelayMs?: number;
	jobTimeoutMs?: number;
}

type JobHandler<T = unknown, R = unknown> = (data: T) => Promise<R>;

const DEFAULT_OPTIONS: Required<QueueOptions> = {
	concurrency: 3,
	defaultRetries: 2,
	retryDelayMs: 2000,
	jobTimeoutMs: 120_000
};

class JobQueue extends EventEmitter {
	private queue: Job[] = [];
	private active = 0;
	private handlers = new Map<string, JobHandler>();
	private jobs = new Map<string, Job>();
	private opts: Required<QueueOptions>;
	private jobCounter = 0;
	private processing = false;

	constructor(options?: QueueOptions) {
		super();
		this.opts = { ...DEFAULT_OPTIONS, ...options };
	}

	register<T, R>(type: string, handler: JobHandler<T, R>): void {
		this.handlers.set(type, handler as JobHandler);
	}

	add<T>(type: string, data: T, options?: { maxRetries?: number }): Job<T> {
		const id = `job_${Date.now()}_${++this.jobCounter}`;
		const job: Job<T> = {
			id,
			type,
			data,
			status: 'pending',
			attempts: 0,
			maxRetries: options?.maxRetries ?? this.opts.defaultRetries,
			createdAt: new Date()
		};

		this.jobs.set(id, job as Job);
		this.queue.push(job as Job);
		this.emit('job:added', job);
		logger.info(`[Queue] Job added: ${id} (type=${type})`);

		this.drain();
		return job;
	}

	getJob(id: string): Job | undefined {
		return this.jobs.get(id);
	}

	getStats() {
		let pending = 0;
		let activeCnt = 0;
		let completed = 0;
		let failed = 0;

		for (const job of this.jobs.values()) {
			switch (job.status) {
				case 'pending': pending++; break;
				case 'active': activeCnt++; break;
				case 'completed': completed++; break;
				case 'failed': failed++; break;
			}
		}

		return { pending, active: activeCnt, completed, failed, total: this.jobs.size };
	}

	private drain(): void {
		if (this.processing) return;
		this.processing = true;

		while (this.queue.length > 0 && this.active < this.opts.concurrency) {
			const job = this.queue.shift();
			if (!job) break;
			this.active++;
			this.runJob(job);
		}

		this.processing = false;
	}

	private async runJob(job: Job): Promise<void> {
		const handler = this.handlers.get(job.type);
		if (!handler) {
			job.status = 'failed';
			job.error = `No handler registered for job type: ${job.type}`;
			this.active--;
			logger.error(`[Queue] ${job.error}`);
			this.emit('job:failed', job);
			this.drain();
			return;
		}

		job.status = 'active';
		job.startedAt = new Date();
		job.attempts++;
		this.emit('job:active', job);
		logger.info(`[Queue] Job started: ${job.id} (attempt ${job.attempts}/${job.maxRetries + 1})`);

		try {
			const result = await Promise.race([
				handler(job.data),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Job timed out')), this.opts.jobTimeoutMs)
				)
			]);

			job.status = 'completed';
			job.result = result;
			job.completedAt = new Date();
			const durationMs = job.completedAt.getTime() - job.startedAt!.getTime();
			logger.info(`[Queue] Job completed: ${job.id} (${durationMs}ms)`);
			this.emit('job:completed', job);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : String(err);

			if (job.attempts <= job.maxRetries) {
				logger.warn(`[Queue] Job ${job.id} failed (attempt ${job.attempts}), retrying in ${this.opts.retryDelayMs}ms: ${errMsg}`);
				job.status = 'pending';
				setTimeout(() => {
					this.queue.push(job);
					this.drain();
				}, this.opts.retryDelayMs);
			} else {
				job.status = 'failed';
				job.error = errMsg;
				job.completedAt = new Date();
				logger.error(`[Queue] Job failed permanently: ${job.id} — ${errMsg}`);
				this.emit('job:failed', job);
			}
		} finally {
			this.active--;
			this.drain();
		}
	}

	purgeCompleted(): number {
		let count = 0;
		for (const [id, job] of this.jobs) {
			if (job.status === 'completed' || job.status === 'failed') {
				this.jobs.delete(id);
				count++;
			}
		}
		return count;
	}
}

const queue = new JobQueue({
	concurrency: 3,
	defaultRetries: 2,
	retryDelayMs: 3000,
	jobTimeoutMs: 120_000
});

export default queue;
