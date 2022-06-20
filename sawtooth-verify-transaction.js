
'use strict'


const {createContext, CryptoFactory} = require('sawtooth-sdk/signing')
const {Secp256k1PublicKey} = require('sawtooth-sdk/signing/secp256k1')

const Secp256k1Context = createContext('secp256k1')
const  {FAMILY_NAME, HANDLER_VERSION} = require ('./env.js')
const {hash} = require('./src/helpers')
const {protobuf} = require('sawtooth-sdk')

// you can get the transaction details from the rest api of the validator
var transaction_id = "b81f535b2e0badb935da8883f15fb77a2b029f5e7662004b8e36f2c7dee6330f2f7c7bbc7f73146393ba7fae90d9767b652580a15e850af6aa89db12b060aa5a";

//=======================
// public key object construction
//=============================
var public_key_hex = "03541a271f20f15a00234dffb67833c1b6cd8d33f235576a58bb4af59dc942c310";

var publicKeyObject = Secp256k1PublicKey.fromHex(public_key_hex);

//=======================
// calculation of hash of the transaction payload
//=====================

// this is the payload that is stored on sawtooth blockchain
var payload_base64 = "eyJ1dWlkIjoiNjQ2NTY0NscwMmVlNfEzMDsiY2ViYjRmYzIxYWEyYTNlZWZjYWViMjhjYzExZWI3MTg3Nzc4NTA0NDgzMjk1MyIsImRhdGFUb1N0b3JlT25CbG9ja2NoYWluIjp7InR5cGUiOiJuZXdfZG9jdW1lbnQiLCJvd25lciI6IjAzNTQxYTI3MWYyMGYxNWEwMDIzNGRmZmI2NzgzM2MxYjZjZDhkMzNmMjM1NDc2YTU4YmI0YWY1OWRjOTQyYzMxMCIsImZpbGVfbmFtZV93aGVuX3N0b3JlZCI6Im15X2V4YW02LnBkZiIsImhhc2hfcGxhaW5fY29udGVudCI6ImM0ZTMyY2U0N2E4MTIyYzI4M2FkZWZlMWRjOGFlZjAyYmFjNmU2ODI0MjBiMDMwMTY2YzE1ZGQ1YjVjYmU1Mzg2OTJkOGViYmI3MzZiN2E4OGFjNjA0ZmUzZDNlOWQyMDM4MTkyZDRhZWExNmI2MTM0ZGViYmNiY2U2NTU3ZDUzIiwiY2lkX2lwZnMiOiJRbWVvbWZmVU5mbVF5NzZDUUd5OU5kbXFFbm5IVTlzb0NleEJuR1UzZXpQSFZIIn19";

// the payload string (it can be a json string or anyhting else)
var payloadString = Buffer.from(payload_base64, "base64").toString("utf8");

// effective hash caulculation
var hashOfPayload= hash(payloadString);

console.log(hashOfPayload);


//==================
// signature
//================

// in this example is hardcoded but you should het it
// from the property 'header_signature' of the transaction stored in sawtoot
var signature = "b81f535b2e0badb935da8883f15fb77a2b029f5e7662003b8e36f2c7dee6330f2f7c7bbc7f73146393ba7fae90d9767b652580a15e850af6aa89db12b060aa5a";

//==============================
// reconstruct the transaction header bytes
//================================
// we reconstruct it in order to have the same bytes
var address = "";
const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: FAMILY_NAME,
    familyVersion: HANDLER_VERSION,
    //this are state that you read
    inputs: [address],
    //this are states that you modify
    outputs: [address],
    signerPublicKey: public_key_hex,
    batcherPublicKey: public_key_hex,
    dependencies: [],
    payloadSha512: hashOfPayload
}).finish();


//===================
// verify signature with publicKey
//==============================
console.log("is verified?");
console.log(Secp256k1Context.verify(signature, transactionHeaderBytes, publicKeyObject));
