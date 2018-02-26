/* eslint-disable no-console */
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const tryToMakeTag = async (maxTries = 10) => {
  for (let tries = 0; tries < maxTries; tries += 1) {
    try {
      const tagName = `release-${new Date().toISOString().slice(0, 10)}${
        tries > 0 ? `v${tries + 1}` : ''
      }`;
      // eslint-disable-next-line no-await-in-loop
      await exec(`git tag ${tagName}`);

      return tagName;
    } catch (err) {
      // do nothing
    }
  }

  throw new Error('Exceeded maximum tag name creation tries');
};

const run = async () => {
  const { stdout: branchName } = await exec('git rev-parse --abbrev-ref HEAD');
  if (branchName.trim() !== 'master') {
    throw new Error('Must be run from master branch');
  }

  const stepCount = 6;
  let stepIndex = 0;
  const getStep = () => {
    stepIndex += 1;
    return `${stepIndex}/${stepCount}`;
  };

  console.log(`${getStep()}: Pulling from master branch`);
  await exec('git pull origin master --ff-only');

  console.log(`${getStep()}: Tagging for release`);
  const tagName = await tryToMakeTag();

  console.log(`${getStep()}: Pushing master branch`);
  await exec('git push origin master');

  console.log(`${getStep()}: Pushing tag: ${tagName}`);
  await exec(`git push --tags origin master`);

  console.log(`${getStep()}: Running standard version`);
  await exec(
    'node_modules/.bin/standard-version --message="chore(release): %s [SKIP CI]"'
  );

  console.log(`${getStep()}: Pushing version tag to master`);
  await exec('git push --follow-tags origin master');
};

run().catch(err => {
  console.error('ERROR:', err.message);
});
