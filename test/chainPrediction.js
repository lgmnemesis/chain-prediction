const ChainPrediction = artifacts.require('ChainPrediction.sol');

contract('ChainPrediction', addresses => {
  const [admin, oracle, voter1, voter2, voter3, voter4] = addresses;

  const Chains = {
    Cardano: 0, 
    Ethereum: 1, 
    Polkadot: 2, 
    Algorand: 3, 
    Avalanche: 4, 
    Holochain: 5
  }

  it('Check Full Cycle', async () => {
    const chainPrediction = await ChainPrediction.new(oracle);

    console.log('Step 1: Placing Predictions orders');
    await chainPrediction.placePrediction(
      Chains.Cardano,
      {from: voter1, value: web3.utils.toWei('1')}
    );

    await chainPrediction.placePrediction(
      Chains.Holochain,
      {from: voter2, value: web3.utils.toWei('3')}
    );

    await chainPrediction.placePrediction(
      Chains.Cardano,
      {from: voter3, value: web3.utils.toWei('2')}
    );

    await chainPrediction.placePrediction(
      Chains.Algorand,
      {from: voter4, value: web3.utils.toWei('1')}
    );

    console.log('Step 2: Oracle is reporting on results.');
    await chainPrediction.reportResults(
      {from: oracle}
    );

    console.log('Step 3: Withdraw Gains, Check balances');
    const balancesBefore = (await Promise.all(
      [voter1, voter2, voter3, voter4].map((voter) => {
        return web3.eth.getBalance(voter);
      })
    )).map((balance) => {
      return web3.utils.toBN(balance);
    })

    await Promise.all(
      [voter1, voter3].map((voter) => {
        return chainPrediction.withdrawGain({from: voter});
      })
    ).catch((error) => console.error(error.message));

    const balancesAfter = (await Promise.all(
      [voter1, voter2, voter3, voter4].map((voter) => {
        return web3.eth.getBalance(voter);
      })
    )).map((balance) => {
      return web3.utils.toBN(balance);
    })

    // voter1 and voter3 are the winners
    assert(balancesAfter[0].sub(balancesBefore[0]).toString().slice(0, 3) === '233');
    assert(balancesAfter[2].sub(balancesBefore[2]).toString().slice(0, 3) === '466');

    console.log('voter1 initial capital:', web3.utils.fromWei(balancesBefore[0], "ether"));
    console.log('voter1 current capital:', web3.utils.fromWei(balancesAfter[0], "ether"));
    console.log('voter1 winning amount:', web3.utils.fromWei(balancesAfter[0].sub(balancesBefore[0]), "ether"));
    console.log('');

    console.log('voter3 initial capital:', web3.utils.fromWei(balancesBefore[2], "ether"));
    console.log('voter3 current capital:', web3.utils.fromWei(balancesAfter[2], "ether"));
    console.log('voter3 winning amount:', web3.utils.fromWei(balancesAfter[2].sub(balancesBefore[2]), "ether"));
    console.log('');

    // voter2 and voter4 are the losers
    assert(balancesAfter[1].sub(balancesBefore[1]).isZero());
    assert(balancesAfter[3].sub(balancesBefore[3]).isZero());
  })
})