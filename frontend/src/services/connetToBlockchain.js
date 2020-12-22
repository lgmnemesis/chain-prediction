import { ethers, Contract } from 'ethers';
import ChainPrediction from '../contracts/ChainPrediction.json';

const getBlockchain = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const network = ChainPrediction.networks[window.ethereum.networkVersion];
        if (!network) {
          reject('no network to connect');
          return;
        }
        const chainPrediction = new Contract(
          network.address,
          ChainPrediction.abi,
          signer
        );
        
        resolve({signerAddress, chainPrediction});
      }
    })
  });
};

export default getBlockchain;