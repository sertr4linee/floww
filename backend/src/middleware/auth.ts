import { createMiddleware } from "hono/factory";
import { recoverMessageAddress } from "viem";
import { HTTPException } from "hono/http-exception";

type AuthEnv = {
  Variables: {
    walletAddress: string;
  };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const message = c.req.header("X-Message");

  if (!authHeader || !message) {
    throw new HTTPException(401, { message: "Missing auth headers" });
  }

  const [scheme, signature] = authHeader.split(" ");
  if (scheme !== "Signature" || !signature) {
    throw new HTTPException(401, { message: "Invalid auth scheme" });
  }

  try {
    const address = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });

    c.set("walletAddress", address.toLowerCase());
    await next();
  } catch {
    throw new HTTPException(401, { message: "Invalid signature" });
  }
});
