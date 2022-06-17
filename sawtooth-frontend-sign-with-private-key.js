// STEPS TO DO 

// You must install browserify ---->   npm install -g browserify  (https://browserify.org/ )
// then you must install "secp256k1":"^4.0.3"  --> npm install secp256k1 --save  (https://github.com/cryptocoinjs/secp256k1-node )

// then create a file (in this example I'll call it 'main.js' and put the libraries secp256k1 e Buffer in the window object:
	

// main.js
	var Buffer=require('buffer');
	
	var Crypto=require('crypto')
	
	var secp256k1=require('secp256k1');
	
	window.Buffer=Buffer;
	
	window.secp256k1=secp256k1;
	
	window.Crypto=Crypto;
	

// then generate the bundle with browserify

browserify main.js -o bundle.js


// then add the bundle to the webpage and after the bundle add  the file having your script(in this case i'll call index.js')
<html>

<scriptsrc="bundle.js"></script>
<scriptsrc="index.js"></script>
</html>


// content of 'index.js'

async function index(){

//===========================
//Takethe'Buffer'modulefrombrowserify
//=============================
var Buffer=window.Buffer.Buffer;

//===========================
//Takethe'Crypto'modulefrombrowserify
//=============================
var Crypto=window.Crypto;


//===========================
//Take the'secp256k1'module from browserify
//=============================
var secp256k1=window.secp256k1;


//===================================
//Generate the private Key
//===================================
const privateKeyHex="hexstring"; //for example 75ca15c16f16c582c4d5a032d093fbc98b43c8d4e9bfb24ceee965a319336be6
let privateKeyBuf=Buffer.from(privateKeyHex,'hex')


//===============================
//take the bytes to be signed-
//they may comes from the backend server.You may get then using ajax or websocket
//when you have a stream of bytes from the server you may
//encode them in hex (Buffer.from().toString('hex') and you will get a string like that
//=============================
const transactionBytesInHex="0a423033353431613237316632306631356130303233346466666236373833336331623663643864333366323335343736613538626234616635396463393432633331301a0d6865616c74685f77616c6c65742205312e302e302a003a004a800162313765636435303132613836313131373736663836376330316134643932346163396334363339326433373633393838363935303539333264653265323862346564353739373464663361373137396131396632643432393733643231373237316534323065346534643464666464366539633935656464306534393435625242303335343161323731663230663135613030323334646666623637383333633162366364386433336632333534373661353862623461663539646339343263333130";


//====================
//create the hash of the data
//=============================
//note that we take the bytes by using Buffer.from('hexencodedbytes','hex')
const dataHash=Crypto.createHash('sha256').update(Buffer.from(transactionBytesInHex,'hex')).digest()

//data hash is an Uint8Array(32) so if you want you can encode it in hex
console.log('datahash:',dataHash);

//====================
//sign the hash with the privatekey
//=============================
//Note:we use the bytes of the privatekey
constresult=window.secp256k1.ecdsaSign(dataHash, privateKeyBuf);

//resultis{
//recid:1
//signature:Uint8Array(64)[251,193,18,251,62,215,227,248,211,197,7,27,95,45,118,47,114,43,108,23,209,185,225,56,223,201,37,245,134,103,67,223,18,134,185,88,29,15,56,65,212,98,48,24,187,153,103,70,176,221,166,220,75,86,104,216,192,148,96,157,55,46,48,166,buffer:ArrayBuffer(64),byteLength:64,byteOffset:0,length:64,Symbol(Symbol.toStringTag):'Uint8Array']

//so we take the signature wich is a Uint8Array(64)
console.log(result);
console.log(Buffer.from(result.signature).toString('hex'));

}

index();
