import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes, CoinClient } from "aptos";
import path from "path";
import fs from "fs"
import {program} from "commander";
import { dustAccounts, genAccounts, readAccounts } from "./accounts/accounts";
import { createMintTransaction, getStartTimestamp } from "./transactions/transactions";

async function main(){
    
    program
        .option('-g, --gen [num]', 'account generation')
        .option('-d --dust', 'dust accounts')
        .parse();

    const opts = program.opts();

    const NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";
    const client = new AptosClient(NODE_URL);

    const accounts = readAccounts(0, 32);
    
    const whaleAccount = accounts[0];
    const botAccounts = accounts.slice(1);

    if(opts.gen){
        genAccounts(opts.gen as number);
        return;
    }
    if(opts.dust){
        await dustAccounts(client, whaleAccount, botAccounts);
        return;
    }

    let startTime = await getStartTimestamp();


    // const mintTxn = await createMintTransaction(client, testAccount, BigInt(500), BigInt(100));

    // const transactionRes = await client.submitSignedBCSTransaction(mintTxn);

    // await client.waitForTransaction(transactionRes.hash);

    // console.log(transactionRes.hash)
}

main();