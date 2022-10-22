import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes } from "aptos";
import path from "path";
import fs from "fs"
import {program} from "commander";
import { genAccounts, readAccounts } from "./accounts/accounts";

async function main(){
    program
        .option('-g, --gen [num]', 'account generation')
        .parse();

    const opts = program.opts();
    if(opts.gen){
        genAccounts(opts.gen as number)
    }

    // readAccounts(0, 20);

    // Generates key pair for Alice
    // const alice = new AptosAccount();
    // Creates Alice's account and mint 5000 test coins

    // let resources = await client.getAccountResources(alice.address());
    // let accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
    // console.log(`Alice coins: ${(accountResource?.data as any).coin.value}. Should be 5000!`);

    // Generates key pair for Bob
    // const bob = new AptosAccount();
    // Creates Bob's account and mint 0 test coins

    // resources = await client.getAccountResources(bob.address());
    // accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
    // console.log(`Bob coins: ${(accountResource?.data as any).coin.value}. Should be 100!`);
}

main();