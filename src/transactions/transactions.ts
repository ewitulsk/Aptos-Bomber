import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes, HexString, TransactionBuilder} from "aptos";
import axios from 'axios';

//   { "sender": { "address": "0x54f87920d93bc215c7b70d42a480438cfe01d7b4db259a8184faa8f8e2899be1" }, 
//     "sequence_number": 7 , 
//     "payload": { 
//         "value": { 
//             "module_name": { 
//                 "address": { 
//                     "address": "0xe3bbe438d7ff734ca3d6f246de2190461d627a6b463128eecb263604506a6359" 
//                 }, "name": { "value": "launchpad_nft" } }, 
//                 "function_name": { "value": "mint" }, "ty_args": [], "args": [ "0x100000000000000" ] } }, 
//                 "max_gas_amount": 568 , "gas_unit_price": 100 , "expiration_timestamp_secs": 1666418986 , 
//                 "chain_id": { "value": 1 } 
//             }
  

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
        // Expiration timestamp. Transaction is discarded if it is not executed within 10 seconds from now.
        BigInt(Math.floor(Date.now() / 1000) + 10),
        new ChainId(chainId),
    );

    const signedTxn = AptosClient.generateBCSTransaction(account, rawTxn);
    return signedTxn;
}

export async function getStartTimestamp(){
    const URL = "https://fullnode.mainnet.aptoslabs.com/v1/accounts/0xe3bbe438d7ff734ca3d6f246de2190461d627a6b463128eecb263604506a6359/resource/0xe3bbe438d7ff734ca3d6f246de2190461d627a6b463128eecb263604506a6359::launchpad_nft::CollectionData";
    const data = await axios.get(URL);
    const collectionData = data.data;
    return collectionData.data.start_timestamp;
}