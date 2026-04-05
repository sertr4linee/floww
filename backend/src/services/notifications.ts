import { Resend } from "resend";
import { db } from "../db";
import { creators } from "../db/schema";
import { eq } from "drizzle-orm";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Floww <noreply@floww.xyz>";

async function getCreatorEmail(address: string): Promise<string | null> {
  const [creator] = await db
    .select({ email: creators.email })
    .from(creators)
    .where(eq(creators.id, address.toLowerCase()))
    .limit(1);
  return creator?.email ?? null;
}

export async function notifyNewTip(
  creatorAddress: string,
  fromAddress: string,
  amount: string,
  token: string | null,
  message: string
) {
  if (!resend) return;

  const email = await getCreatorEmail(creatorAddress);
  if (!email) return;

  const short = `${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`;
  const symbol = token ? "USDC" : "ETH";

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `New tip: ${amount} ${symbol}`,
    html: `
      <div style="font-family: monospace; background: #080808; color: #e8e8e8; padding: 32px;">
        <h2 style="color: #b8ff35; margin: 0 0 16px;">New tip received</h2>
        <p><strong>${short}</strong> tipped you <strong style="color: #b8ff35;">${amount} ${symbol}</strong></p>
        ${message ? `<p style="color: #888; margin-top: 12px;">"${message}"</p>` : ""}
        <hr style="border-color: #222; margin: 24px 0;" />
        <p style="color: #555; font-size: 12px;">Floww — Creator monetization onchain</p>
      </div>
    `,
  });
}

export async function notifyNewSubscriber(
  creatorAddress: string,
  subscriberAddress: string,
  planId: number
) {
  if (!resend) return;

  const email = await getCreatorEmail(creatorAddress);
  if (!email) return;

  const short = `${subscriberAddress.slice(0, 6)}...${subscriberAddress.slice(-4)}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `New subscriber!`,
    html: `
      <div style="font-family: monospace; background: #080808; color: #e8e8e8; padding: 32px;">
        <h2 style="color: #b8ff35; margin: 0 0 16px;">New subscriber</h2>
        <p><strong>${short}</strong> subscribed to your plan #${planId}</p>
        <hr style="border-color: #222; margin: 24px 0;" />
        <p style="color: #555; font-size: 12px;">Floww — Creator monetization onchain</p>
      </div>
    `,
  });
}

export async function notifyRenewal(
  creatorAddress: string,
  subscriberAddress: string,
  amount: string
) {
  if (!resend) return;

  const email = await getCreatorEmail(creatorAddress);
  if (!email) return;

  const short = `${subscriberAddress.slice(0, 6)}...${subscriberAddress.slice(-4)}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Subscription renewed`,
    html: `
      <div style="font-family: monospace; background: #080808; color: #e8e8e8; padding: 32px;">
        <h2 style="color: #b8ff35; margin: 0 0 16px;">Subscription renewed</h2>
        <p><strong>${short}</strong> renewed — <strong style="color: #b8ff35;">${amount} USDC</strong> received</p>
        <hr style="border-color: #222; margin: 24px 0;" />
        <p style="color: #555; font-size: 12px;">Floww — Creator monetization onchain</p>
      </div>
    `,
  });
}
