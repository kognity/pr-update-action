import * as core from '@actions/core';
import styles from 'ansi-styles';
import {RequestError} from '@octokit/types';

export function getInputs() {
  return {
    token: core.getInput('token', {required: true}),
    title: core.getInput('title'),
    titlePrefix: core.getInput('title-prefix'),
    titleSuffix: core.getInput('title-suffix'),
    body: core.getMultilineInput('body'),
    bodyPrefix: core.getMultilineInput('body-prefix'),
    bodySuffix: core.getMultilineInput('body-suffix'),
    bodyConcatNewLine: core.getBooleanInput('body-concat-new-line'),
  };
}

export function updateTitle(
  inputs: ReturnType<typeof getInputs>,
  prTitle: string
): string | undefined {
  const {title, titlePrefix, titleSuffix} = inputs;
  core.info(
    `${styles.bold.open}Current PR title:${styles.bold.close} ${prTitle}.`
  );

  if (title || titlePrefix || titleSuffix) {
    const newTitle = [titlePrefix, title || prTitle, titleSuffix]
      .filter(Boolean)
      .join(' ');
    core.info(
      `${styles.cyan.open}${styles.bold.open}New title:${styles.bold.close} ${newTitle}${styles.cyan.close}`
    );
    core.setOutput('new-title', newTitle);
    return newTitle;
  }

  core.notice(
    `${styles.blue.open}No updates were made to PR title.${styles.blue.close}`
  );
}

export function updateBody(
  inputs: ReturnType<typeof getInputs>,
  prBody: string
): string | undefined {
  const {
    body: bodyLines,
    bodyPrefix: bodyPrefixLines,
    bodySuffix: bodySuffixLines,
    bodyConcatNewLine,
  } = inputs;
  const body = bodyLines.join('\n').trim();
  const bodyPrefix = bodyPrefixLines.join('\n').trim();
  const bodySuffix = bodySuffixLines.join('\n').trim();
  const concatStrategy = bodyConcatNewLine ? '\n' : ' ';
  core.info(
    `${styles.bold.open}Current PR body:${styles.bold.close} \n${prBody}.`
  );

  if (body || bodyPrefix || bodySuffix) {
    const newBody = [bodyPrefix, body || prBody, bodySuffix]
      .filter(Boolean)
      .join(concatStrategy);
    core.info(
      `${styles.cyan.open}${styles.bold.open}New body:${styles.bold.close} \n${newBody}${styles.cyan.close}`
    );
    core.setOutput('new-body', newBody);
    return newBody;
  }

  core.notice(
    `${styles.blue.open}No updates were made to PR body.${styles.blue.close}`
  );
}

export function isRequestError(error: unknown): error is RequestError {
  return (
    typeof error === 'object' && error !== null && 'documentation_url' in error
  );
}
