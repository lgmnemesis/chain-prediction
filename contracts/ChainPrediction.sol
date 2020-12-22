// SPDX-License-Identifier: MIT

/** 
    Cardano going to #1
    Github: https://github.com/lgmnemesis
    Email: lgm@nemesis.co.il
*/

pragma solidity ^0.7.3;

contract ChainPrediction {
    address public oracle;
    bool public pollEnded;
    enum Chains {Cardano, Ethereum, Polkadot, Algorand, Avalanche, Holochain}
    uint256[] public winners;
    uint256 numOfChains = 6;
    uint256 public losersBets;

    mapping(uint256 => uint256) public bets;
    mapping(address => mapping(uint256 => uint256)) public betsPerVoter;
    mapping(uint256 => uint256) public votesPerChain;
    mapping(address => bool) public isVoted;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function placePrediction(Chains _chain) external payable {
        require(pollEnded == false, "Poll Ended");
        uint256 _chainInt = uint256(_chain);
        require(isVoted[msg.sender] == false, "Already cast your vote");
        isVoted[msg.sender] = true;
        bets[_chainInt] += msg.value;
        betsPerVoter[msg.sender][_chainInt] += msg.value;
        votesPerChain[_chainInt]++;
    }

    function withdrawGain() external {
        require(pollEnded == true, "Poll is still running");
        uint256 voterBets = _getVoterWinningBets();
        require(voterBets > 0, "You did not win the bet");
        uint256 winnersBets = _getWinningBets();
        uint256 _losersBets = _getLosersBets();
        uint256 gain = voterBets + ((_losersBets * voterBets) / winnersBets);
        _resetBetsPerVoter();
        msg.sender.transfer(gain);
    }

    function reportResults() external {
        require(oracle == msg.sender, "Not an oracle");
        require(pollEnded == false, "Poll Ended");
        _andTheWinnersAre();
        pollEnded = true;
    }

    function _getWinningBets() internal view returns (uint256) {
        uint256 winningBets = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            winningBets += bets[winners[i]];
        }
        return winningBets;
    }

    function _getVoterWinningBets() internal view returns (uint256) {
        uint256 winningBets = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            winningBets += betsPerVoter[msg.sender][winners[i]];
        }
        return winningBets;
    }

    function _andTheWinnersAre() internal {
        uint256 votes = 0;
        uint256 winnerIndex;
        for (uint256 i = 0; i < numOfChains; i++) {
            if (votesPerChain[i] > votes) {
                votes = votesPerChain[i];
                winnerIndex = i;
            } else if (votesPerChain[i] == votes && votes > 0) {
                winners.push(i);
            }
        }
        winners.push(winnerIndex);
    }

    function _resetBetsPerVoter() internal {
        for (uint256 i = 0; i < numOfChains; i++) {
            betsPerVoter[msg.sender][i] = 0;
        }
    }

    function _getLosersBets() internal returns (uint256) {
        if (losersBets > 0) {
            return losersBets;
        }
        uint256 _losersBets = 0;
        bool itsAWinner = false;
        for (uint256 i = 0; i < numOfChains; i++) {
            for (uint256 _winner = 0; _winner < winners.length; _winner++) {
                if (i == winners[_winner]) {
                    itsAWinner = true;
                    break;
                }
            }
            if (itsAWinner == false) {
                _losersBets += bets[i];
            }
            itsAWinner = false;
        }
        losersBets = _losersBets;
        return _losersBets;
    }

    fallback() external payable {}

    receive() external payable {}
}
