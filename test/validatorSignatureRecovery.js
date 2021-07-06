const rlp = require('rlp')
const ValidatorSignatureRecovery = artifacts.require("ValidatorSignatureRecovery")

const ibft2MixHash = "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365"
const rinkebyMixHash = "0x0000000000000000000000000000000000000000000000000000000000000000" // Need a better way to identify rinkeby blocks

contract('ValidatorSignatureRecovery', async function(accounts) {

  let instance = null
  let blockToUse = null

  const rinkebyBlock4753195 = {
    difficulty: 1,
    extraData: '0xd883010900846765746888676f312e31322e34856c696e7578000000000000009e4d991ca30e6ff6782058da4b958eb180e54f3af99f00afa9d42ea01c08b1134664c21f408d79c87d93a6ce83354a68d8f0d3fea99bc796029875563acceef801',
    gasLimit: 7968880,
    gasUsed: 357704,
    hash: '0xdfd0a441a76d0f54bea2b61963871a61bca5eb4adf76f15d60e2d3c7b19cf191',
    logsBloom: '0x08000000000000000000000000000000000000004000000000000004000000000000000000000000000000000000000000000000000000000000004000000100060000000008000000000002000000000400000000002000000000008000000000000000000000000000000000000008000000100000000000000000000000000800000000000000000000000000000000002001000000000000000400000000200000000000000000000002080000000400000000000000000020200800000000000000000800000000001000000000000000000000000000000000000080000000000000000000000000000000000000002000000000400040000402000000',
    miner: '0x0000000000000000000000000000000000000000',
    mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    nonce: '0x0000000000000000',
    number: 4753195,
    parentHash: '0x1c363542cde9bf375d022bd5ee9a3cd39cb0c3cd5f8358218050528b903feb0f',
    receiptsRoot: '0xf3e2521f7f2744fcc1d50f012c92e19f140b2d4bdc3580131cf40e4849ed4a9d',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: 2761,
    stateRoot: '0x237e07d6c9d93e0ac9ff6d6342c14edf70e3ed65b0c99f614ddc7dc044c27293',
    timestamp: 1563427778,
    totalDifficulty: 8708626,
    transactions: [
      '0xeb9ba0177ea60392d36f77756ba9d79128c7f882acbf2215fa18f3ca5ccf853b',
      '0x7738d239660b29af956ebdb78365ca4ee69fd73880782af2484069e75f4b8efd',
      '0x201882ac27c8adc496811d583bfa6c4e9477a66b415a03edaf4d273ab817cd15',
      '0x9267002d69bf400778b28e677c92011402b7a9d7a84a3224a74ebd246a17378c',
      '0x9a26d1faa5221c1cfde715deb3609d98b1b2edd4505da40233b07b9a97e0ef35',
      '0x492646677d322b3066004157a9ca8c300cb3f1b2570c9865788b4538b9d3b39d',
      '0xbe6ca092ee531c8d9519c29530cda4eda2be3271bf8844cc6c5ea49d887bd88a'
    ],
    transactionsRoot: '0x07929a817d5e3f63e419392add0d0a8814c43c4fb391e083164f4ff23b75efd8',
    uncles: []
  }

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

  before(async function(){
    instance = await ValidatorSignatureRecovery.deployed()
  })

  it("should be able to verify the Rinkeby validator signatures", async function() {

    blockToUse = rinkebyBlock4753195

    const {headerArray, validatorAddressList, validatorSignatureList, rlpEmptySealExtraData } = formatHeaderToArray(blockToUse) 

    if(blockToUse.mixHash === rinkebyMixHash){
      headerArray[12] = rlpEmptySealExtraData
    }
    const rlpHeaderArrayEmptySignatures = rlp.encode(headerArray)

    console.log('blockToUse.hash:', blockToUse.hash)

    // Rinkeby/Clique has a single signer
    const signerSignature = validatorSignatureList[0]

    const txObj = await instance.verifyRinkebyValidatorSignatures(signerSignature, blockToUse.hash, rlpHeaderArrayEmptySignatures, {gas: 10000000, from: accounts[0]})
    console.log('gasUsed:', txObj.receipt.gasUsed)

    console.log('logs:')
    for(let log of txObj.receipt.logs){
      if(log.event === 'Uint'){
        console.log(log.args[1]+': '+log.args[0].toNumber())
      } else if(log.event === 'Bool'){
        console.log(log.args[1]+': '+log.args[0])
      } else if(log.event === 'Bytes'){
        console.log(log.args[1]+': '+log.args[0])
      } else if(log.event === 'Bytes32'){
        console.log(log.args[1]+': '+log.args[0])
      } else if(log.event === 'String'){
        console.log(log.args[0])
      } else if(log.event === 'Address'){
        console.log(log.args[1]+': '+log.args[0])
      } else {
        console.log("unhandled log")
        console.log({log})
      }
    }

    assert.equal(txObj.receipt.status, true)
    assert.equal(txObj.receipt.logs[txObj.receipt.logs.length-1].args[0], '0x7ffC57839B00206D1ad20c69A1981b489f772031')

  })

  it("should be able to verify the IBFT2 validator signatures", async function() {

    blockToUse = ibft2Block100656

    const {headerArray, validatorAddressList, validatorSignatureList, rlpEmptySealExtraData } = formatHeaderToArray(blockToUse) 
    console.log({validatorAddressList})
    console.log('validatorSignatureList:')
    for(let vs of validatorSignatureList){
      console.log('0x'+vs.toString('hex'))
    }
    const rlpValidatorSignatures = '0x' + rlp.encode(validatorSignatureList).toString('hex')
    console.log({rlpValidatorSignatures})

    if(blockToUse.mixHash === ibft2MixHash){
      headerArray[12] = rlpEmptySealExtraData
    }
    const rlpHeaderArrayEmptySignatures = rlp.encode(headerArray)

    console.log('blockToUse.hash:', blockToUse.hash)

    const txObj = await instance.verifyIBFT2ValidatorSignatures(rlpValidatorSignatures, blockToUse.hash, rlpHeaderArrayEmptySignatures, {gas: 10000000, from: accounts[0]})
    console.log('gasUsed:', txObj.receipt.gasUsed)

    console.log('logs:')
    for(let log of txObj.receipt.logs){
      if(log.event === 'Uint'){
        console.log(log.args[1]+': '+log.args[0].toNumber())
      } else if(log.event === 'Bool'){
        console.log(log.args[1]+': '+log.args[0])
      } else if(log.event === 'Bytes'){
        console.log(log.args[1]+': '+log.args[0])
      } else if(log.event === 'Bytes32'){
        console.log(log.args[1]+': '+log.args[0])
      } else if(log.event === 'String'){
        console.log(log.args[0])
      } else if(log.event === 'Address'){
        console.log(log.args[1]+': '+log.args[0])
      } else {
        console.log("unhandled log")
        console.log({log})
      }
    }

    assert.equal(txObj.receipt.status, true)

  })
})

function toHex(item){
  if(item === 0){
    return '0x'
  } else {
    return web3.utils.toHex(item)
  }
}

// bh: JSON block header
function formatHeaderToArray(bh){

  const validatorAddressList = []
  const validatorSignatureList = []
  let rlpEmptySealExtraData
  if(bh.mixHash === ibft2MixHash){
    //First get rid of the IstanbulExtra's Seal and ComittedSeal since they need to be empty arrays when calculating the blockhash
    const decodedExtraData = rlp.decode(bh.extraData)
    const extraVanity = decodedExtraData[0].toString('hex') 
    const validatorAddressListBuffer = decodedExtraData[1]
    for(let v of validatorAddressListBuffer){
      validatorAddressList.push(v.toString('hex'))
    }

    const validatorSignatureListBuffer = decodedExtraData[4]
    for(let vs of validatorSignatureListBuffer){
      validatorSignatureList.push(vs)
    }
    rlpEmptySealExtraData = '0x' + rlp.encode([
      decodedExtraData[0], // extra data vanity
      decodedExtraData[1], // list of validators
      //decodedExtraData[2], // vote? recipient to vote for (Bytes) + vote type (Byte)?
      //decodedExtraData[3]  // ??
      //decodedExtraData[4] // seals ?
    ]).toString('hex')
    console.log('rlpEmptySealExtraData:', rlpEmptySealExtraData)
    console.log('bh.extraData:', bh.extraData)
    rlpEmptySealExtraData = '0xa00000000000000000000000000000000000000000000000000000000000000000d594ca31306798b41bc81c43094a1e0462890ce7a673'// bh.extraData.substring(0, 128)//2+64+42*(validatorAddressList.length))
    console.log('rlpEmptySealExtraData:', rlpEmptySealExtraData)
    //rlpEmptySealExtraData = '0xf882a00000000000000000000000000000000000000000000000000000000000'
  } else if (bh.mixHash === rinkebyMixHash){
    console.log('bh.extraData:', bh.extraData)
    rlpEmptySealExtraData = bh.extraData.substring(0, 64+2)
    console.log({rlpEmptySealExtraData})
    // Rinkeby/Clique has a single signer
    validatorSignatureList.push('0x'+bh.extraData.substring(64+2))
  }

  // hash block header components to calculate the block hash
  const gasLimit = toHex(bh.gasLimit)
  const gasUsed = toHex(bh.gasUsed)
  const time = toHex(bh.timestamp)
  const difficulty = toHex(bh.difficulty)
  const number = toHex(bh.number)

  const headerArray = [
    bh.parentHash,
    bh.sha3Uncles,
    bh.miner,
    bh.stateRoot,
    bh.transactionsRoot,
    bh.receiptsRoot,
    bh.logsBloom,
    difficulty,
    number,
    gasLimit,
    gasUsed,
    time,
    bh.extraData,
    bh.mixHash,
    bh.nonce
  ]

  return {headerArray, validatorAddressList, validatorSignatureList, rlpEmptySealExtraData}
}
