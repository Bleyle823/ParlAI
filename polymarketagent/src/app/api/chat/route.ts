import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText } from "ai";
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { polymarket } from "@goat-sdk/plugin-polymarket";
import { viem } from "@goat-sdk/wallet-viem";

// Validate and format private key
function validatePrivateKey(key: string | undefined): `0x${string}` {
  if (!key) {
    throw new Error("WALLET_PRIVATE_KEY environment variable is not set");
  }
  
  // Remove any whitespace and newlines
  const cleanKey = key.trim().replace(/\s/g, '');
  
  console.log('Debug - Raw key length:', key.length);
  console.log('Debug - Clean key length:', cleanKey.length);
  console.log('Debug - Clean key starts with 0x:', cleanKey.startsWith("0x"));
  
  // Add 0x prefix if missing
  const formattedKey = cleanKey.startsWith("0x") ? cleanKey : `0x${cleanKey}`;
  
  console.log('Debug - Formatted key length:', formattedKey.length);
  console.log('Debug - Formatted key (first 10 chars):', formattedKey.substring(0, 10));
  
  // Validate hex format and length (64 characters + 2 for 0x = 66 total)
  if (!/^0x[a-fA-F0-9]{64}$/.test(formattedKey)) {
    throw new Error(`Invalid private key format. Expected 64-character hex string with or without 0x prefix. Got length: ${formattedKey.length}, format check failed.`);
  }
  
  return formattedKey as `0x${string}`;
}

// Create wallet client
const privateKey = validatePrivateKey(process.env.WALLET_PRIVATE_KEY);
const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chain: polygon,
});

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    // Get onchain tools
    const tools = await getOnChainTools({
      wallet: viem(walletClient),
      plugins: [
        polymarket({
          credentials: {
            key: process.env.POLYMARKET_API_KEY as string,
            secret: process.env.POLYMARKET_SECRET as string,
            passphrase: process.env.POLYMARKET_PASSPHRASE as string,
          },
        }),
      ],
    });

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      tools: tools,
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}