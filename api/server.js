const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { JobService, STATUSES } = require('./job-service');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('JSON inválido'));
      }
    });

    req.on('error', reject);
  });
}

function createServer(options = {}) {
  const storageDir = options.storageDir || path.resolve(process.cwd(), 'api', 'storage');
  const jobService = options.jobService || new JobService(storageDir);

  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    if (req.method === 'POST' && req.url === '/jobs') {
      try {
        const payload = await parseBody(req);
        const job = jobService.enqueue(payload);

        sendJson(res, 202, {
          message: 'Job enfileirado para processamento',
          job
        });
      } catch (error) {
        sendJson(res, 400, { message: error.message });
      }

      return;
    }

    const jobMatch = req.url && req.url.match(/^\/jobs\/([a-f0-9-]+)$/i);

    if (req.method === 'GET' && jobMatch) {
      const job = jobService.get(jobMatch[1]);

      if (!job) {
        sendJson(res, 404, { message: 'Job não encontrado' });
        return;
      }

      sendJson(res, 200, { job });
      return;
    }

    const downloadMatch = req.url && req.url.match(/^\/jobs\/([a-f0-9-]+)\/download$/i);

    if (req.method === 'GET' && downloadMatch) {
      const job = jobService.get(downloadMatch[1]);

      if (!job) {
        sendJson(res, 404, { message: 'Job não encontrado' });
        return;
      }

      if (job.status !== STATUSES.COMPLETED) {
        sendJson(res, 409, { message: 'Job ainda não foi concluído', status: job.status });
        return;
      }

      const archivePath = jobService.getArchivePath(downloadMatch[1]);

      if (!archivePath) {
        sendJson(res, 404, { message: 'Arquivo zip não encontrado' });
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadMatch[1]}.zip"`);
      fs.createReadStream(archivePath).pipe(res);
      return;
    }

    sendJson(res, 404, { message: 'Rota não encontrada' });
  });

  return { server, jobService };
}

async function startServer(port = process.env.PORT || 3000) {
  const { server, jobService } = createServer();
  await jobService.initialize();

  await new Promise((resolve) => {
    server.listen(port, () => resolve());
  });

  return { server, jobService };
}

if (require.main === module) {
  startServer().then(({ server }) => {
    const address = server.address();
    // eslint-disable-next-line no-console
    console.log(`API de geração de arquivos iniciada na porta ${address.port}`);
  });
}

module.exports = {
  createServer,
  startServer
};
