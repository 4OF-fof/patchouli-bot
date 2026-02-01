type Task<T> = {
	execute: () => Promise<T>;
	resolve: (value: T) => void;
	reject: (reason: unknown) => void;
};

const queue: Task<unknown>[] = [];
let running = false;

async function processQueue(): Promise<void> {
	if (running) return;
	running = true;

	while (queue.length > 0) {
		const task = queue.shift()!;
		try {
			const result = await task.execute();
			task.resolve(result);
		} catch (error) {
			task.reject(error);
		}
	}

	running = false;
}

export function enqueue<T>(execute: () => Promise<T>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		queue.push({ execute, resolve, reject } as Task<unknown>);
		processQueue();
	});
}
