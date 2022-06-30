import * as github from '@actions/github';
import * as core from '@actions/core';
import {Status} from './utils';
import {
  IncomingWebhook,
  IncomingWebhookSendArguments,
  IncomingWebhookResult
} from '@slack/webhook';

export class Mattermost extends IncomingWebhook {
  // 0: failure, 1: success, 2: cancel
  static readonly color: string[] = ['#cb2431', '#2cbe4e', '#ffc107'];
  static readonly mark: string[] = [':x:', ':white_check_mark:', ':warning:'];
  static readonly msg: string[] = ['Failure', 'Success', 'Cancel'];

  constructor(
    url: string,
    username: string,
    icon_emoji: string,
    private show_ref: boolean
  ) {
    super(url, {username, icon_emoji});
  }

  /**
   * Generate payload
   */
  protected generatePayload(
    status: Status,
    msg: string,
    username: string,
    icon_emoji: string
  ): IncomingWebhookSendArguments {
    let text = `${msg}`;

    if (this.show_ref) {
      const tag = this.getTag();
      if (tag) {
        if (text.includes('${tag}')) {
          text = text.replace('${tag}', tag);
        } else {
          text += ` (release ${tag})`;
        }
      } else {
        text += ` (branch ${this.getBranch()})`;
      }
    }

    if (status !== Status.Success) {
      text = `(!!!) Failed: ${text}`;
    }

    const payload: IncomingWebhookSendArguments = {
      text,
      username,
      icon_emoji
    };

    core.debug(`Generated payload for Mattermost: ${JSON.stringify(payload)}`);

    return payload;
  }

  protected getTag(): string {
    const ref = github.context.ref;

    if (!ref.startsWith('refs/tags/')) {
      return '';
    }

    return ref.replace(/^refs\/tags\//, '');
  }

  protected getBranch(): string {
    const ref = github.context.ref;

    if (!ref.startsWith('refs/heads/')) {
      return '';
    }

    return ref.replace(/^refs\/heads\//, '');
  }

  /**
   * Notify information about github actions to Mattermost
   */
  public async notify(
    status: Status,
    msg: string,
    channels: string[],
    username: string,
    icon_emoji: string
  ): Promise<IncomingWebhookResult[]> {
    try {
      const payload: IncomingWebhookSendArguments = this.generatePayload(
        status,
        msg,
        username,
        icon_emoji
      );
      core.debug(`Custom message: ${payload.text}`);
      let result: IncomingWebhookResult[] = [];
      for (const ch of channels) {
        result.push(
          await this.send({
            ...payload,
            channel: ch
          })
        );
      }

      core.debug('Sent message to Mattermost');

      return result;
    } catch (err) {
      throw err;
    }
  }
}
