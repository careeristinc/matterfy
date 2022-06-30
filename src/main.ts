import * as core from '@actions/core';
import {Mattermost} from './mattermost';
import {Status, getStatus} from './utils';

async function run() {
  try {
    const type: string = core.getInput('type', {required: true});
    const msgRaw: string[] = core.getMultilineInput('msg') || 'Default message';
    const show_ref: boolean = core.getBooleanInput('show_ref') || false;
    const username: string = core.getInput('username') || 'Github Actions';
    const icon_emoji: string = core.getInput('icon_emoji') || 'octocat';
    const channelsRaw: string = core.getInput('channels', {required: true});
    const url: string = core.getInput('url') || process.env.SLACK_WEBHOOK || '';

    if (url === '') {
      throw new Error(`
        ERROR: Missing Slack Incoming Webhooks URL.
        Please configure "SLACK_WEBHOOK" as environment variable or
        specify the key called "url" in "with" section.
      `);
    }

    const status: Status = getStatus(type);
    const mm = new Mattermost(url, username, icon_emoji, show_ref);
    const msg = msgRaw.join('\n');
    core.debug(`Custom message: ${msg}`);
    const channels: string[] = JSON.parse(channelsRaw);

    const result = await mm.notify(status, msg, channels, username, icon_emoji);
    core.debug(`Response from Slack: ${JSON.stringify(result)}`);
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      core.setFailed(err.message);
    } else {
      core.setFailed('Action Matterfy failed');
    }
  }
}

run();
