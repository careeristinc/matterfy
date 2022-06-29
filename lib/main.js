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
const core = __importStar(require("@actions/core"));
const mattermost_1 = require("./mattermost");
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const type = core.getInput('type', { required: true });
            const msg = core.getInput('msg') || 'Default message';
            const username = core.getInput('username') || 'Github Actions';
            const icon_emoji = core.getInput('icon_emoji') || 'octocat';
            const channelsRaw = core.getInput('channels');
            const url = core.getInput('url') || process.env.SLACK_WEBHOOK || '';
            if (url === '') {
                throw new Error(`
        ERROR: Missing Slack Incoming Webhooks URL.
        Please configure "SLACK_WEBHOOK" as environment variable or
        specify the key called "url" in "with" section.
      `);
            }
            const status = utils_1.getStatus(type);
            const mm = new mattermost_1.Mattermost(url, username, icon_emoji);
            const channels = JSON.parse(channelsRaw);
            const result = yield mm.notify(status, msg, channels, username, icon_emoji);
            core.debug(`Response from Slack: ${JSON.stringify(result)}`);
        }
        catch (err) {
            console.log(err);
            if (err instanceof Error) {
                core.setFailed(err.message);
            }
            else {
                core.setFailed('Action Matterfy failed');
            }
        }
    });
}
run();
