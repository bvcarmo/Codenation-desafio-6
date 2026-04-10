const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const { AsyncQueue } = require('./queue');

const STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};
const MAX_FILES_PER_JOB = 100;

class JobService {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.jobs = new Map();
    this.queue = new AsyncQueue(async (jobId) => {
      await this.processJob(jobId);
    });
  }

  async initialize() {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  enqueue(payload) {
    const jobId = randomUUID();
    const files = this.normalizeFiles(payload);

    const job = {
      id: jobId,
      status: STATUSES.PENDING,
      files,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: null,
      archivePath: null
    };

    this.jobs.set(jobId, job);
    this.queue.add(jobId);

    return this.publicJob(job);
  }

  get(jobId) {
    const job = this.jobs.get(jobId);

    if (!job) {
      return null;
    }

    return this.publicJob(job);
  }

  getArchivePath(jobId) {
    const job = this.jobs.get(jobId);

    if (!job || job.status !== STATUSES.COMPLETED || !job.archivePath) {
      return null;
    }

    return job.archivePath;
  }

  normalizeFiles(payload) {
    if (Array.isArray(payload?.files) && payload.files.length > 0) {
      return payload.files.map((file, index) => ({
        name: this.sanitizeName(file?.name, index),
        content: typeof file?.content === 'string' ? file.content : ''
      }));
    }

    const requestedCount = Number.isInteger(payload?.count) && payload.count > 0 ? payload.count : 3;
    const count = Math.min(requestedCount, MAX_FILES_PER_JOB);
    const prefix = typeof payload?.prefix === 'string' && payload.prefix.trim() ? payload.prefix.trim() : 'arquivo';

    return Array.from({ length: count }, (_, index) => ({
      name: `${prefix}-${index + 1}.txt`,
      content: `Conteúdo gerado para ${prefix}-${index + 1}`
    }));
  }

  sanitizeName(name, index) {
    if (typeof name !== 'string' || !name.trim()) {
      return `arquivo-${index + 1}.txt`;
    }

    const basename = path.basename(name.trim()).replace(/[^a-zA-Z0-9._-]/g, '-');
    return basename || `arquivo-${index + 1}.txt`;
  }

  async processJob(jobId) {
    const job = this.jobs.get(jobId);

    if (!job) {
      return;
    }

    job.status = STATUSES.PROCESSING;
    job.updatedAt = new Date().toISOString();

    try {
      const jobDir = path.join(this.baseDir, job.id);
      const filesDir = path.join(jobDir, 'files');

      await fs.mkdir(filesDir, { recursive: true });

      const filePaths = [];

      for (const file of job.files) {
        const filePath = path.join(filesDir, file.name);
        await fs.writeFile(filePath, file.content, 'utf8');
        filePaths.push(filePath);
      }

      const archivePath = path.join(jobDir, 'archive.zip');
      await this.zipFiles(filePaths, archivePath);

      job.archivePath = archivePath;
      job.status = STATUSES.COMPLETED;
      job.updatedAt = new Date().toISOString();
    } catch (error) {
      job.status = STATUSES.FAILED;
      job.error = error instanceof Error ? error.message : 'Erro desconhecido';
      job.updatedAt = new Date().toISOString();
    }
  }

  zipFiles(filePaths, archivePath) {
    return new Promise((resolve, reject) => {
      const args = ['-j', archivePath, '--', ...filePaths];
      const zip = spawn('zip', args, { stdio: 'ignore' });

      zip.on('error', reject);

      zip.on('close', (code) => {
        if (code === 0 && fsSync.existsSync(archivePath)) {
          resolve();
          return;
        }

        reject(new Error('Falha ao criar o arquivo zip'));
      });
    });
  }

  publicJob(job) {
    return {
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      error: job.error
    };
  }
}

module.exports = {
  JobService,
  STATUSES,
  MAX_FILES_PER_JOB
};
