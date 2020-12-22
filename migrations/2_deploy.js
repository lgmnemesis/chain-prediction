const ChainPrediction = artifacts.require("ChainPrediction");

module.exports = function (deployer, _network, addresses) {
  const [admin, oracle] = addresses;
  deployer.deploy(ChainPrediction, oracle);
};
