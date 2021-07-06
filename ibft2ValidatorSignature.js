const ethereumjsUtils = require("ethereumjs-utils");

async function main(){
  const ibft2Block100656 = {
    difficulty: 1,
    extraData: "0xf882a00000000000000000000000000000000000000000000000000000000000000000d594ca31306798b41bc81c43094a1e0462890ce7a673808400000000f843b84141d126be3fad3947774970043207d182e9544925eb873e6a42e359027eeb239f55319d436301cce9dc1c0f580730b90d58a048d38d6c7df928bef7dd813c333700",
    gasLimit: 100000000,
    gasUsed: 0,
    hash: "0x1554b4e9630243666d846dfe5339adb4fadde1c127d7dd52f287a4a0c6d08994",
    logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    miner: "0xca31306798b41bc81c43094a1e0462890ce7a673",
    mixHash: "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
    nonce: "0x0000000000000000",
    number: 100655,
    parentHash: "0x7c3a8fd89f73912f0c76ac485907bf6485aa0114416d7f44ac8564b71492124a",
    receiptsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    size: 645,
    stateRoot: "0xf60a2a5ccd66ff43c0f4bfb9b0b4e67a80de725cdc445b5992607c8033e603d6",
    timestamp: 1625478093,
    totalDifficulty: 100656,
    transactions: [],
    transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
    uncles: []
  }

  const blockToUse = ibft2Block100656

  //First get rid of the IstanbulExtra's seals
  const decodedExtraData = ethereumjsUtils.rlp.decode(blockToUse.extraData)
  const validatorAddressListBuffer = decodedExtraData[1]
  const validatorAddressList = []
  for(let v of validatorAddressListBuffer){
    validatorAddressList.push(v.toString('hex'))
  }

  const validatorSignatureListBuffer = decodedExtraData[4]
  const validatorSignatureList = []
  for(let vs of validatorSignatureListBuffer){
    validatorSignatureList.push(vs.toString('hex'))
  }

  const rlpEmptySealExtraData = '0x' + ethereumjsUtils.rlp.encode([
    decodedExtraData[0], // extra data vanity
    decodedExtraData[1], // list of validators
    decodedExtraData[2], // vote? recipient to vote for (Bytes) + vote type (Byte)?
    //decodedExtraData[3]  // ??
    //decodedExtraData[4] // seals ?
  ]).toString('hex')
  console.log({rlpEmptySealExtraData})

  const header = [
    ethereumjsUtils.toBuffer(blockToUse.parentHash),
    ethereumjsUtils.toBuffer(blockToUse.sha3Uncles),
    ethereumjsUtils.toBuffer(blockToUse.miner),
    ethereumjsUtils.toBuffer(blockToUse.stateRoot),
    ethereumjsUtils.toBuffer(blockToUse.transactionsRoot),
    ethereumjsUtils.toBuffer(blockToUse.receiptsRoot),
    ethereumjsUtils.toBuffer(blockToUse.logsBloom),
    parseInt(blockToUse.difficulty),
    parseInt(blockToUse.number),
    parseInt(blockToUse.gasLimit),
    parseInt(blockToUse.gasUsed),
    parseInt(blockToUse.timestamp),
    ethereumjsUtils.toBuffer(rlpEmptySealExtraData),
    ethereumjsUtils.toBuffer(blockToUse.mixHash),
    ethereumjsUtils.toBuffer(blockToUse.nonce)
  ];

  const msg = ethereumjsUtils.rlp.encode(header)
  const msghash = ethereumjsUtils.keccak256(msg)
  console.log('calculated block hash:', '0x'+msghash.toString('hex'))
  console.log('block hash from block:', blockToUse.hash)
  const recoveredValidatorAdresses = []
  for(let signature of validatorSignatureList){
    const r = "0x" + signature.slice(0, 64)
    const s = '0x' + signature.slice(64, 128)
    let v = '0x' + signature.slice(128, 130)
    v = parseInt(v) + 27
    const pub = ethereumjsUtils.ecrecover(msghash, v, r, s)
    let addr = ethereumjsUtils.pubToAddress(pub)
    addr = ethereumjsUtils.bufferToHex(addr)
    recoveredValidatorAdresses.push(addr)
  }
  console.log('Recovered validator addresses:')
  console.log({recoveredValidatorAdresses})
  console.log('Expected validator addresses:')
  console.log({validatorAddressList})
}

main()
