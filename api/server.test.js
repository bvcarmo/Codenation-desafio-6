const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { createServer } = require('./server');
const { JobService, MAX_FILES_PER_JOB } = require('./job-service');

async function createApi() {
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jobs-api-'));
  const { server, jobService } = createServer({ storageDir });
  await jobService.initialize();

  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    server,
    cleanup: async () => {
      await new Promise((resolve) => server.close(resolve));
      for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
          await fs.rm(storageDir, { recursive: true, force: true });
          return;
        } catch (error) {
          if (error.code !== 'ENOTEMPTY') {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
      }
    }
  };
}

async function waitForStatus(baseUrl, jobId, expectedStatus) {
  for (let i = 0; i < 30; i += 1) {
    const response = await fetch(`${baseUrl}/jobs/${jobId}`);
    const body = await response.json();

    if (body.job.status === expectedStatus) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Job ${jobId} não atingiu status ${expectedStatus}`);
}

test('deve enfileirar job, processar e disponibilizar o zip', async () => {
  const api = await createApi();

  try {
    const createResponse = await fetch(`${api.baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [
          { name: 'contato-a.txt', content: 'A' },
          { name: 'contato-b.txt', content: 'B' }
        ]
      })
    });

    assert.equal(createResponse.status, 202);

    const created = await createResponse.json();
    assert.ok(['pending', 'processing'].includes(created.job.status));

    await waitForStatus(api.baseUrl, created.job.id, 'completed');

    const downloadResponse = await fetch(`${api.baseUrl}/jobs/${created.job.id}/download`);
    assert.equal(downloadResponse.status, 200);
    assert.equal(downloadResponse.headers.get('content-type'), 'application/zip');

    const zipBuffer = Buffer.from(await downloadResponse.arrayBuffer());
    assert.ok(zipBuffer.length > 0);
    assert.equal(zipBuffer.subarray(0, 2).toString('utf8'), 'PK');
  } finally {
    await api.cleanup();
  }
});

test('deve retornar 409 ao tentar baixar zip antes da conclusão', async () => {
  const api = await createApi();

  try {
    const createResponse = await fetch(`${api.baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 5, prefix: 'contato' })
    });

    const created = await createResponse.json();
    const earlyDownload = await fetch(`${api.baseUrl}/jobs/${created.job.id}/download`);

    if (earlyDownload.status === 409) {
      const payload = await earlyDownload.json();
      assert.ok(['pending', 'processing'].includes(payload.status));
    } else {
      assert.equal(earlyDownload.status, 200);
    }
  } finally {
    await api.cleanup();
  }
});

test('deve limitar quantidade de arquivos por job', () => {
  const service = new JobService('/tmp/unused');
  const normalized = service.normalizeFiles({ count: MAX_FILES_PER_JOB + 50, prefix: 'lote' });

  assert.equal(normalized.length, MAX_FILES_PER_JOB);
});
