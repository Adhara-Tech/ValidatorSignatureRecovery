const ValidatorSignatureRecovery = artifacts.require('ValidatorSignatureRecovery');

module.exports = function (deployer) {
  deployer.deploy(ValidatorSignatureRecovery);
};

