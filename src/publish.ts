import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes } from "aptos";
import { ModuleBundle } from "aptos/dist/transaction_builder/aptos_types";
import * as dotenv from 'dotenv';
import { TextEncoder } from "util";

async function main(){
    dotenv.config();
    const encoder = new TextEncoder();
    // devnet is used here for testing
    const NODE_URL = process.env.NODE_URL as string;
    const FAUCET_URL = process.env.FAUCET_URL as string;

    const client = new AptosClient(NODE_URL);
    const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

    // Generates key pair for Alice
    const account = new AptosAccount(BCS.bcsSerializeStr(process.env.PRIV_KEY as string), process.env.ACCOUNT);
    // Creates Alice's account and mint 5000 test coins
    await faucetClient.fundAccount(account.address(), 5000);

    let resources = await client.getAccountResources(account.address());

    let accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
    console.log(`${account.address()}: coins: ${(accountResource?.data as any).coin.value}. Should be 5000!`);

    const modulePayload = new TxnBuilderTypes.TransactionPayloadModuleBundle(
        new ModuleBundle(
            BCS.Seq
        )
    )
}

main();