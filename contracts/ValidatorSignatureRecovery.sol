pragma solidity >=0.4.22 <0.9.0;
//pragma experimental ABIEncoderV2;

import "./libraries/RLP.sol";
import "./libraries/ECVerify.sol";

contract ValidatorSignatureRecovery {
  
  using RLP for RLP.RLPItem;
//  using RLP for RLP.Iterator;
  using RLP for bytes;

  event Bytes32(bytes32, string);
  event Bytes(bytes, string);
  event Bool(bool, string);
  event Uint(uint, string);
  event Address (address, string);

  function verifyValidatorSignatures(bytes memory rlpValidatorSignatures, bytes32 blockHash, bytes memory rlpHeaderEmptySignatureList) public returns (bool){

    require(keccak256(rlpHeaderEmptySignatureList) == blockHash, "Provided block header does not match provided block hash");

    bytes32 signedHash = keccak256(rlpHeaderEmptySignatureList);
    //bytes32 signedHash = blockHash;

    RLP.RLPItem[] memory validatorSignatures = rlpValidatorSignatures.toRLPItem().toList();
    for(uint i=0; i < validatorSignatures.length; i++){
      address signatureAddress = ECVerify.recover(signedHash, validatorSignatures[i].toData());
      emit Address(signatureAddress, "Validator address"); 
    }
    return true;
  }
}

