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

  function verifyRinkebyValidatorSignatures(bytes memory signerSignature, bytes32 blockHash, bytes memory rlpHeaderEmptySignature) public returns (bool){

    bytes32 onChainCalculatedBlockHash = keccak256(rlpHeaderEmptySignature);
    emit Bytes32(onChainCalculatedBlockHash, "onChainCalculatedBlockHash");
    emit Bytes32(blockHash, "blockHash");

    bytes32 signedHash = onChainCalculatedBlockHash;

    address signatureAddress = recover(signedHash, signerSignature);
    emit Address(signatureAddress, "Validator address"); // The test assumes this is emitted last!

    return true;
  }

  function verifyIBFT2ValidatorSignatures(bytes memory rlpValidatorSignatures, bytes32 blockHash, bytes memory rlpHeaderEmptySignatureList) public returns (bool){

    //require(keccak256(rlpHeaderEmptySignatureList) == blockHash, "Provided block header does not match provided block hash");
    bytes32 onChainCalculatedBlockHash = keccak256(rlpHeaderEmptySignatureList);
    emit Bytes32(onChainCalculatedBlockHash, "onChainCalculatedBlockHash");
    emit Bytes32(blockHash, "blockHash");

    bytes32 signedHash = onChainCalculatedBlockHash;

    RLP.RLPItem[] memory validatorSignatures = rlpValidatorSignatures.toRLPItem().toList();
    for(uint i=0; i < validatorSignatures.length; i++){
      address signatureAddress = recover(signedHash, validatorSignatures[i].toData());
      emit Address(signatureAddress, "Validator address"); 
    }
    return true;
  }

  function recover(bytes32 hash, bytes memory signature) internal returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    // Check the signature length
    if (signature.length != 65) {
      return (address(0));
    }

    // Divide the signature in r, s and v variables with inline assembly.
    assembly {
      r := mload(add(signature, 0x20))
      s := mload(add(signature, 0x40))
      v := byte(0, mload(add(signature, 0x60)))
    }

    // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (v < 27) {
      v += 27;
    }

    emit Bytes32(r, "r");
    emit Bytes32(s, "s");
    emit Uint(v, "v");

    // If the version is correct return the signer address
    if (v != 27 && v != 28) {
      return (address(0));
    } else {
      // solium-disable-next-line arg-overflow
      return ecrecover(hash, v, r, s);
    }
  }
}

