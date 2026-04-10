class AsyncQueue {
  constructor(worker) {
    this.worker = worker;
    this.pending = [];
    this.processing = false;
  }

  add(item) {
    this.pending.push(item);
    this.processNext();
  }

  async processNext() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    const nextItem = this.pending.shift();

    if (!nextItem) {
      this.processing = false;
      return;
    }

    try {
      await this.worker(nextItem);
    } finally {
      this.processing = false;
      this.processNext();
    }
  }
}

module.exports = { AsyncQueue };
