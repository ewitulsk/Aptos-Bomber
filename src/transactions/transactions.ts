import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes, HexString, TransactionBuilder} from "aptos";
import axios from 'axios'; 

const {
    AccountAddress,
    TypeTagStruct,
    EntryFunction,
    StructTag,
    TransactionPayloadEntryFunction,
    RawTransaction,
    ChainId,
  } = TxnBuilderTypes;

export async function createMintTransaction(client: AptosClient, account: AptosAccount, maxGas: bigint = BigInt(2000), gasPrice: bigint = BigInt(1)) {
    const entryFunctionPayload = new TransactionPayloadEntryFunction(
        EntryFunction.natural(
          // Fully qualified module name, `AccountAddress::ModuleName`
          "0xe3bbe438d7ff734ca3d6f246de2190461d627a6b463128eecb263604506a6359::launchpad_nft",
          // Module function
          "mint",
          // ty_args
          [],
          // Arguments for function `transfer`: receiver account address and amount to transfer
          [BCS.bcsSerializeUint64(1)], //<-- This line is sketchy
        ),
    );
    
    const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
        client.getAccount(account.address()),
        client.getChainId(),
    ]);

    const rawTxn = new RawTransaction(
        // Transaction sender account address
        AccountAddress.fromHex(account.address()),
        BigInt(sequenceNumber),
        entryFunctionPayload,
        // Max gas unit to spend
        maxGas,
        // Gas price per unit
        gasPrice,
        // Expiration timestamp. Transaction is discarded if it is not executed within 10 years from now (lmao)
        BigInt(Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 52 * 10) ),
        new ChainId(chainId),
    );

    const signedTxn = AptosClient.generateBCSTransaction(account, rawTxn);
    return signedTxn;
}

export async function getStartTimestamp(){
    const URL = "https://fullnode.mainnet.aptoslabs.com/v1/accounts/0xe3bbe438d7ff734ca3d6f246de2190461d627a6b463128eecb263604506a6359/resource/0xe3bbe438d7ff734ca3d6f246de2190461d627a6b463128eecb263604506a6359::launchpad_nft::CollectionData";
    let data;
    try{
        data = await axios.get(URL);
    }
    catch(e){
        console.log("Axios Failed")
        data = {data: {start_timestamp: 1666454400}}
    }
    const collectionData = data.data;
    return Number(collectionData.data.start_timestamp);
}