const crypto = require('crypto');
const { processSpec } = require('../ai/orchestrator');
const { log } = require('../utils/logger');

/**
 * Verifies GitHub webhook signature
 */
function verifySignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification in dev if no secret set

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Extracts spec files from a push event
 */
function extractSpecFiles(payload) {
  const specFiles = [];

  const commits = payload.commits || [];
  for (const commit of commits) {
    const allFiles = [
      ...(commit.added || []),
      ...(commit.modified || [])
    ];

    for (const file of allFiles) {
      if (file.endsWith('.spec.md')) {
        specFiles.push(file);
      }
    }
  }

  // Deduplicate
  return [...new Set(specFiles)];
}

/**
 * Main webhook handler
 */
async function handleWebhook(req, res) {
  const event = req.headers['x-github-event'];

  // Only handle push events
  if (event !== 'push') {
    return res.status(200).json({ message: `Event '${event}' ignored.` });
  }

  // Verify signature
  if (!verifySignature(req)) {
    log('error', 'Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Extract repo info
  const repoOwner = payload.repository?.owner?.login;
  const repoName = payload.repository?.name;
  const branch = payload.ref?.replace('refs/heads/', '');
  const defaultBranch = payload.repository?.default_branch;

  if (!repoOwner || !repoName) {
    return res.status(400).json({ error: 'Missing repo info' });
  }

  // Only process pushes to default branch
  if (branch !== defaultBranch) {
    return res.status(200).json({
      message: `Push to '${branch}' ignored. Only watching '${defaultBranch}'.`
    });
  }

  // Find spec files in this push
  const specFiles = extractSpecFiles(payload);

  if (specFiles.length === 0) {
    return res.status(200).json({ message: 'No .spec.md files found in push.' });
  }

  log('info', `Found ${specFiles.length} spec file(s) in ${repoOwner}/${repoName}: ${specFiles.join(', ')}`);

  // Respond immediately — GitHub expects a fast response
  res.status(200).json({
    message: `Slate is processing ${specFiles.length} spec file(s).`,
    specs: specFiles
  });

  // Process specs asynchronously (don’t block the response)
  for (const specFile of specFiles) {
    processSpec({
      repoOwner,
      repoName,
      branch,
      specFile,
      installationId: payload.installation?.id
    }).catch(err => {
      log('error', `Failed to process spec ${specFile}: ${err.message}`);
    });
  }
}

module.exports = { handleWebhook };