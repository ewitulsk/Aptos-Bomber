import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes, HexString} from "aptos";
import path from "path";
import fs from "fs";
const accountsPath = path.join(__dirname, "../");

export function genAccounts(numAccounts: number){


    const fpath = path.join(
        accountsPath,
        `accounts.json`
    );

    if(!fs.existsSync(fpath)){
        fs.writeFileSync(fpath, "[]")
    }

    let data: Array<{id: number, address: string, pubKeyBytes: Uint8Array, privKeyBytes: Uint8Array, pubKeyBytesArr: number[], privKeyBytesArr: number[], pubHex: string, privHex: string}> 
        = JSON.parse(fs.readFileSync(fpath).toString());

    const idStart = data.length;
    for(let i=0; i<numAccounts; i++){
        const account = new AptosAccount()

        const privKeyObj = account.toPrivateKeyObject();
        if(privKeyObj.address && privKeyObj.publicKeyHex && privKeyObj.privateKeyHex && account.signingKey.publicKey && account.signingKey.secretKey){

            const pubKeyBytes = account.signingKey.publicKey
            const privKeyBytes = account.signingKey.secretKey

            const pubKeyBytesArr: number[] = []
            pubKeyBytes.forEach((b) => pubKeyBytesArr.push(b));

            const privKeyBytesArr: number[] = []
            privKeyBytes.forEach((b) => privKeyBytesArr.push(b));

            const accountObj = {
                id: idStart+i,
                address: privKeyObj.address,
                pubKeyBytes: account.signingKey.publicKey,
                privKeyBytes: account.signingKey.secretKey,
                pubKeyBytesArr: pubKeyBytesArr,
                privKeyBytesArr: privKeyBytesArr,
                pubHex: privKeyObj.publicKeyHex,
                privHex: privKeyObj.privateKeyHex
            }
            data.push(accountObj)

        }
    }
    fs.writeFileSync(fpath, JSON.stringify(data));
}

export function readAccounts(from: number, to: number){
    const accounts = [];

    const fpath = path.join(
        accountsPath,
        `accounts.json`
    );

    if(!fs.existsSync(fpath)){
        throw new Error("accounts.json does not exist");
    }

    let data: Array<{id: number, address: string, pubKeyBytes: Uint8Array, privKeyBytes: Uint8Array, pubKeyBytesArr: number[], privKeyBytesArr: number[], pubHex: string, privHex: string}> 
        = JSON.parse(fs.readFileSync(fpath).toString());

    for(const accountObj of data){
        if(accountObj.id < from || accountObj.id > to){
            continue;
        }

        const uint8PrivKey = new Uint8Array(accountObj.privKeyBytesArr);

        const account = new AptosAccount(uint8PrivKey, accountObj.address)
        accounts.push(account);
    }
    return accounts;
}   