
import { AptosAccount, AptosClient } from "aptos";
import cluster, { Worker } from "node:cluster";
import process from "node:process";
import { timeKeeper, watcher } from "..";
import { getStartTimestamp } from "../transactions/transactions";

export type Message = {
    sender: string;
    message: any;
}

export function sendMessage(sender: string, message: any){
    if(process.send){
        process.send({
            sender: sender,
            message: message,
        })
    }
    else{
        console.log("Not process.send")
    }
}

export async function startCluster(client: AptosClient, botAccounts: AptosAccount[]){
    let startTime = await getStartTimestamp();

    if(cluster.isPrimary){
        const workers: Worker[] = [];
        console.log(`Primary ${process.pid} is running`);

        //Fork workers for express and chain indexer
        botAccounts.forEach((bot, i) => {
            const worker = cluster.fork();
            workers.push(worker);
        })

        //start Time Keeper
        console.log("Starting Time Keeper")
        timeKeeper(startTime, workers);            

    }

    // handle watcher processes
    else if(cluster.isWorker){
        //Watcher
        const workerId = (cluster.worker?.id) as number
        const account = botAccounts[workerId-1]
        if(account){
            console.log(`Starting ID: ${workerId}, Account: ${account.address()}`)
            const w = new watcher(client, account, startTime);
            await w.start();
        }
        else{
            console.log("No Account :( ID: "+workerId)
        }
        
        
    }
}