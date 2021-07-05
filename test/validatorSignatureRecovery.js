const rlp = require('rlp')
const ValidatorSignatureRecovery = artifacts.require("ValidatorSignatureRecovery")

const ibft2MixHash = "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365"

contract('ValidatorSignatureRecovery', async function(accounts) {

  let instance = null
  let blockToUse = null

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
    blockToUse = ibft2Block100656
  })

  it("should be able to verify the validator signatures", async function() {

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

    const txObj = await instance.verifyValidatorSignatures(rlpValidatorSignatures, blockToUse.hash, rlpHeaderArrayEmptySignatures, {gas: 10000000, from: accounts[0]})
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
      decodedExtraData[2], // vote? recipient to vote for (Bytes) + vote type (Byte)?
      //decodedExtraData[3]  // round number?
      //decodedExtraData[4] // seals ?
    ]).toString('hex')

    //emptySealExtraData = bh.extraData.substring(0, 2+72+6+42*(validatorAddressList.length))
    //console.log('emptySealExtraData:', emptySealExtraData)
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
