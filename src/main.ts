import * as core from '@actions/core';
import * as github from '@actions/github';
import {Endpoints, RequestParameters} from '@octokit/types';
import {getInputs, updateTitle, updateBody, isRequestError} from './utils';

async function run() {
  try {
    core.info('Starting...');
    const inputs = getInputs();
    const prTitle: string = github.context.payload.pull_request?.title ?? '';
    const prBody: string = github.context.payload.pull_request?.body ?? '';
    const newPrTitle = updateTitle(inputs, prTitle);
    const newPrBody = updateBody(inputs, prBody);
    const requestEndpoint: keyof Endpoints =
      'PATCH /repos/{owner}/{repo}/pulls/{pull_number}';
    type requestParameters = Endpoints[typeof requestEndpoint]['parameters'] &
      RequestParameters;
    const updateRequest: requestParameters = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request?.number ?? NaN,
    };

    if (newPrTitle) updateRequest.title = newPrTitle;
    if (newPrBody) updateRequest.body = newPrBody;

    core.info(`Request: \n${JSON.stringify(updateRequest)}.`);

    if (!newPrTitle && !newPrBody) {
      core.warning('No changes made to PR title or body. Exiting.');
      return;
    }

    const octokit = github.getOctokit(inputs.token);
    await octokit.request(requestEndpoint, updateRequest);
    core.info('PR updated successfully.');
  } catch (error) {
    if (isRequestError(error)) {
      core.error(error.name);
      core.setFailed(error.name);
    } else {
      core.error('Something went wrong with the request.');
      core.error(JSON.stringify(error));
    }
  }
}

run();
