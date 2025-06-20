// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RewardDispenser {
    address public owner = 0xCd14338ab62d86D17756807E536A607675D1D246; // Replace with your testnet wallet address

    constructor() {
        require(msg.sender == owner, "Deploy from the authorized wallet");
    }

    // Accept ETH only from owner
    receive() external payable {
        require(msg.sender == owner, "Only owner can fund the contract");
    }

    // Public function to claim a random ETH reward (0.0007 - 0.003 ETH)
    function claimReward() external {
        require(address(this).balance >= 0.003 ether, "Contract has insufficient funds");

        uint256 random = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, block.prevrandao)
            )
        );

        // Generates a reward between 0.0007 and 0.003 ETH in 10 steps
        uint256 amount = 0.0007 ether + ((random % 10) * 0.00025 ether);

        payable(msg.sender).transfer(amount);
    }

    // Allow the owner to withdraw all ETH from the contract
    function withdrawAll() external {
        require(msg.sender == owner, "Not authorized");
        payable(owner).transfer(address(this).balance);
    }

    // View function to check contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
