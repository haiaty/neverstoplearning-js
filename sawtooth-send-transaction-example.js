/*
npm install axios
npm install sawtooth-sdk

*/


const axios = require("axios").default;



/**
 * Create the signer key - can be for application level or user level
 */
const {createContext, CryptoFactory} = require('sawtooth-sdk/signing')
const {createHash} = require('crypto')
const {protobuf} = require('sawtooth-sdk')

const  {TP_FAMILY, TP_NAMESPACE, TP_VERSION, hash} = require('./env');

const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey)

let signature;

const dataModelExample = {
    data1: "value",
	data2: 2
};

/**
 * Create payload buffer
 */
const payload = {
    uuid : "SOMEUID",
    dataToStoreOnBlockchain: dataModelExample
}

// we will send this as a bytes stream to the sawtooth api
const payloadBytes = Buffer.from(JSON.stringify(payload));


/**
 * Wrap payload buffer into a transaction
 */

 



const address = TP_NAMESPACE + hash(payload.uuid).substr(0,64);

console.log(address);

const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: TP_FAMILY,
    familyVersion: TP_VERSION,
    //this are state that you read
    inputs: [address],
    //this are states that you modify
    outputs: [address],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
}).finish()

//next step: sign the transaction
 signature = signer.sign(transactionHeaderBytes)

const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signature,
    payload: payloadBytes
})

/**
 * Array of transactions
 */
const transactions = [transaction]

/** create batch header */
const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
}).finish()


/**
 * create the batch
 */

signature = signer.sign(batchHeaderBytes)

const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactions
})

/**
 * Encode batch
 * 
 * In order to submit Batches to the validator, 
 * they must be collected into a BatchList. 
 * Multiple batches can be submitted in one BatchList, though the Batches themselves don’t necessarily need to depend on each other. Unlike Batches, a BatchList is not atomic. Batches from other clients may be interleaved with yours.
 */

const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
}).finish()


/** Submit the batch list to the sawtooth rest api  */
console.log("doing the request", batchListBytes);


axios.post(
    'http://rest-api:8008/batches', 
    batchListBytes, 
    {
    headers: {'Content-Type': 'application/octet-stream'}
    }
).then(response => {
    console.log(response.data);
}).catch(error => {
    console.log(error.response.data);
}).finally(function() {
    console.log("ook");
});

const fs = require('fs')

const fileStream = fs.createWriteStream('some.batches')
fileStream.write(batchListBytes)
fileStream.end()
/*
curl --verbose --request POST \
    --header "Content-Type: application/octet-stream" \
    --data-binary @some.batches \
    "http://rest-api:8008/batches"

    */
