const http = require('http');
const createHandler = require('github-webhook-handler');
const octokit = require('@octokit/rest')({ debug: false });
const handler = createHandler({
  path: '/webhook',
  secret: process.env.WEBHOOK_SECRET,
});

octokit.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_DEPLOY_SECRET,
});

const PORT = process.env.PORT || 8000;
http
  .createServer((req, res) => {
    handler(req, res, err => {
      res.statusCode = 404;
      res.end('no such location');
    });
  })
  .listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
  });

handler.on('error', err => {
  console.error('Error:', err.message);
});

handler.on('release', event => {
  if (event.payload.release.draft || event.payload.release.prerelease) {
    console.log('Aborted release on account of it being a draft or prerelease');
    return;
  }

  console.log('Deploying to production');
  octokit.repos
    .createDeployment({
      owner: event.payload.repository.owner.login,
      ref: event.payload.release.tag_name,
      repo: event.payload.repository.name,
      environment: 'production',
      auto_merge: false,
    })
    .then(() => {
      console.log('Deployment Completed');
    })
    .catch(err => {
      console.error('Deployment Failed', err);
    });
});
