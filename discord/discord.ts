import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";
import { Subscription } from "encore.dev/pubsub";
import { SiteAdded } from "../site/site";

export interface NotifyParams {
  text: string; // the slack message to send
}

export const notify = api<NotifyParams>({}, async ({ text }) => {
  const url = webhookURL();
  if (!url) {
    log.info("no discord webhook url defined, skipping discord notification");
    return;
  }

  const resp = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ content: text }),
  });
  if (resp.status >= 400) {
    const body = await resp.text();
    throw new Error(`discord notification failed: ${resp.status}: ${body}`);
  }
});

// DiscordWebhookURL defines the Discord webhook URL to send
// uptime notifications to.
const webhookURL = secret("DiscordWebhookURL");

const _ = new Subscription(SiteAdded, "discord-notification", {
  handler: async (site) => {
    const text = `Added site ${site.url}`;
    await notify({ text });
  },
});
