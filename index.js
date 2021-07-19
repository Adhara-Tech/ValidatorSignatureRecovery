const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/94c7d48789e7449dad8384dfb7c95d21')
const eju = require("ethereumjs-utils");

async function main(){
  const blk = await web3.eth.getBlock(4753195)

  let header = [
    eju.toBuffer(blk.parentHash),
    eju.toBuffer(blk.sha3Uncles),
    eju.toBuffer(blk.miner),
    eju.toBuffer(blk.stateRoot),
    eju.toBuffer(blk.transactionsRoot),
    eju.toBuffer(blk.receiptsRoot),
    eju.toBuffer(blk.logsBloom),
    parseInt(blk.difficulty),
    parseInt(blk.number),
    parseInt(blk.gasLimit),
    parseInt(blk.gasUsed),
    parseInt(blk.timestamp),
    eju.toBuffer(blk.extraData.slice(0, blk.extraData.length - 130)),
    eju.toBuffer(blk.mixHash),
    eju.toBuffer(blk.nonce)
  ];

  let msg = eju.rlp.encode(header);
  let msghash = eju.keccak256(msg)
  let sig = blk.extraData.slice(-130);
  let r = "0x" + sig.slice(0, 64);
  let s = '0x' + sig.slice(64, 128);
  let v = '0x' + sig.slice(128, 130);
  v = parseInt(v) + 27;
  let pub = eju.ecrecover(msghash, v, r, s);
  let addr = eju.pubToAddress(pub);
  addr = eju.bufferToHex(addr);
  console.log('recovered address', addr);
  console.log('expected address', '0x7ffc57839b00206d1ad20c69a1981b489f772031');
}

main()
