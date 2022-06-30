"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const webhook_1 = require("@slack/webhook");
class Mattermost extends webhook_1.IncomingWebhook {
    constructor(url, username, icon_emoji, show_ref) {
        super(url, { username, icon_emoji });
        this.show_ref = show_ref;
    }
    /**
     * Generate payload
     */
    generatePayload(status, msg, username, icon_emoji) {
        let text = `${msg}`;
        if (this.show_ref) {
            const tag = this.getTag();
            if (tag) {
                if (text.includes('${tag}')) {
                    text = text.replace('${tag}', tag);
                }
                else {
                    text += ` (release ${tag})`;
                }
            }
            else {
                text += ` (branch ${this.getBranch()})`;
            }
        }
        if (status !== utils_1.Status.Success) {
            text = `(!!!) Failed: ${text}`;
        }
        const payload = {
            text,
            username,
            icon_emoji
        };
        core.debug(`Generated payload for Mattermost: ${JSON.stringify(payload)}`);
        return payload;
    }
    getTag() {
        const ref = github.context.ref;
        if (!ref.startsWith('refs/tags/')) {
            return '';
        }
        return ref.replace(/^refs\/tags\//, '');
    }
    getBranch() {
        const ref = github.context.ref;
        if (!ref.startsWith('refs/heads/')) {
            return '';
        }
        return ref.replace(/^refs\/heads\//, '');
    }
    /**
     * Notify information about github actions to Mattermost
     */
    notify(status, msg, channels, username, icon_emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = this.generatePayload(status, msg, username, icon_emoji);
                core.debug(`Custom message: ${payload.text}`);
                let result = [];
                for (const ch of channels) {
                    result.push(yield this.send(Object.assign({}, payload, { channel: ch })));
                }
                core.debug('Sent message to Mattermost');
                return result;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
// 0: failure, 1: success, 2: cancel
Mattermost.color = ['#cb2431', '#2cbe4e', '#ffc107'];
Mattermost.mark = [':x:', ':white_check_mark:', ':warning:'];
Mattermost.msg = ['Failure', 'Success', 'Cancel'];
exports.Mattermost = Mattermost;
