import { useState, useEffect } from 'react';
import getBlockchain from './services/connetToBlockchain';

const Chains = {
  Cardano: 0, 
  Ethereum: 1, 
  Polkadot: 2, 
  Algorand: 3, 
  Avalanche: 4, 
  Holochain: 5
}

function App() {

  const [chainPrediction, setChainPrediction] = useState();
  const [myBets, setMyBets] = useState();

  const init = async () => {
    console.log('in init');
    const {signerAddress, chainPrediction} = await getBlockchain();

    const myBetsPerVoter = [];
    Object.values(Chains).forEach(chain => {
      myBetsPerVoter.push(chainPrediction.betsPerVoter(signerAddress, chain));
    });
    const myBets = await Promise.all(myBetsPerVoter);
    setChainPrediction(chainPrediction);
    setMyBets(myBets);
  }

  useEffect(() => {
    init();
  }, []);

  if (
    typeof chainPrediction === 'undefined' ||
    typeof myBets === 'undefined') {
    return <div>Loading</div>;
  };

  return (
    <div className='container'>

      <div className='row'>
        <div className='col-sm-12'>
          <h1 className='text-center'>The Chain Prediction</h1>
          <div className='jumbotron'>
            <h1 className='display-4 text-center'>Which is the best chain?</h1>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
