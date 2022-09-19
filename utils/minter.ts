/* eslint-disable @typescript-eslint/no-var-requires */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import bs58 from "bs58";

const config = require("../config/config.json");

const devnet = new Connection("https://api.devnet.solana.com");
const feePayer = Keypair.fromSecretKey(bs58.decode(config.minter.toString().trim()));

const metaplex = new Metaplex(devnet).use(keypairIdentity(feePayer));

// tokens to airdrop: wood, stone, iron
const tokens = [
  "HmitieGZtQ7LRmiFBAA66Yd9uv1Wv1B4qkyLWiK2EeJ5",
  "3jczzBwwGB8EMjWLi5DKRatFLtFYCSXBKY46NpqX2fPv",
  "6dZH7pLMqyKPMvgh8zCxPgbrK5kv2EJyqwDFn2tw5i7t",
];
const META_NFTS = [
  "8YWAJWas4ZVTosZzxB89Fm6JVMbT717B8sj1rcaXQdQA"
];
const TOKENS_AMOUNT = 50;

const transferTokens = async (mint: string, recipient: PublicKey) => {
  const lamports = TOKENS_AMOUNT * LAMPORTS_PER_SOL;
  try {
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      devnet,
      feePayer,
      new PublicKey(mint),
      feePayer.publicKey
    );
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      devnet,
      feePayer,
      new PublicKey(mint),
      recipient
    );
    const signature = await transfer(
      devnet,
      feePayer,
      fromTokenAccount.address,
      toTokenAccount.address,
      feePayer.publicKey,
      lamports
    );
    console.log(
      `Airdropping ${lamports / LAMPORTS_PER_SOL} tokens to ${recipient.toBase58()}: ${signature}`
    );
    return signature;
  } catch (e) {
    console.error(e, recipient.toBase58());
  }
};

const transferSol = async (recipient: PublicKey) => {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: feePayer.publicKey,
      toPubkey: new PublicKey(recipient),
      lamports: LAMPORTS_PER_SOL,
    })
  );
  tx.feePayer = feePayer.publicKey;

  const txhash = await devnet.sendTransaction(tx, [feePayer]);
  console.log(`Airdropping 1 SOL to ${recipient.toBase58()}: ${txhash}`);
  return txhash;
}

const mintNFT = async (recipient: PublicKey, mint: string) => {
  const { nft } = await metaplex
    .nfts()
    .printNewEdition({ originalMint: new PublicKey(mint), newOwner: recipient })
    .run();
  console.log('Minted NFT:', nft.mint.address.toBase58());
  return nft.mint.address.toBase58();
};

const sendAirdrop = async (address: string) => {

    const recipient = new PublicKey(address);
    const transactions = [];
    try {
      const tx = await mintNFT(recipient, META_NFTS[0]);
      transactions.push(tx);

      const solTx = await transferSol(recipient);
      transactions.push(solTx);
    } catch (e) {
      console.error(e);
    }
    META_NFTS.push(META_NFTS.shift() || "");

    for (const mint of tokens) {
      const tx = await transferTokens(mint, recipient);
      transactions.push(tx);
    }

    return transactions;
};

export default sendAirdrop;
