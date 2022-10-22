import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes, CoinClient } from "aptos";
import path from "path";
import fs from "fs"
import {program} from "commander";
import process from "node:process";
import cluster, { Worker } from "node:cluster";
import { dustAccounts, genAccounts, readAccounts } from "./accounts/accounts";
import { createMintTransaction, getStartTimestamp } from "./transactions/transactions";
import { sendMessage, startCluster } from "./concurrency/manager";

export class watcher {
    private MAX_GAS = BigInt(10000);
    private GAS_PRICE = BigInt(15000);
    private client: AptosClient;
    private account: AptosAccount;
    private timestamp: number;
    constructor(client: AptosClient, account: AptosAccount, initTimestamp: number){
        this.client = client;
        this.account = account;
        this.timestamp = initTimestamp;
        process.on("message", (message) => this.handleIncomingMessage(message))
    }

    public async handleIncomingMessage(message: any){
        if(message.sender != "watcher"){

            const timestamp = message.message.timestamp;
            this.timestamp = Number(timestamp);
            await this.start()
        }
    }

    public getTimestamp(){
        return this.timestamp;
    }

    public async start(){
        const mintTxn = await createMintTransaction(this.client, this.account, this.MAX_GAS, this.GAS_PRICE);
        while(true){
            if((Date.now()/1000) >= this.getTimestamp()){
                const transactionRes = await this.client.submitSignedBCSTransaction(mintTxn);
                await this.client.waitForTransaction(transactionRes.hash);
                return;
            }
        }
    }
}

export function reportNewTimestamp(timestamp: number, workers: Worker[]){
    workers.forEach((w) => w.process.send({sender: "timekeeper", message: {timestamp: timestamp}}));
}

export async function timeKeeper(initTimestamp: number, workers: Worker[]){
    let timestamp = initTimestamp;
    while(true){
        const chainTimestamp = await getStartTimestamp();
        const now = Date.now() / 1000

        if(chainTimestamp != timestamp){
            timestamp = chainTimestamp;
            reportNewTimestamp(chainTimestamp, workers);
        }

        if(now > timestamp){
            return;
        }
        await new Promise((r) => setTimeout(r, 1*(1000*60)));
    }
}

async function main(){
    program
        .option('-g, --gen [num]', 'account generation')
        .option('-d, --dust', 'dust accounts')
        .option('-c, --concurrent', 'start concurrency')
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
    if(opts.concurrent){
        await startCluster(client, botAccounts);
    }

    
}

main();