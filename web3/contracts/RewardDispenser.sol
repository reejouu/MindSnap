// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RewardDispenser {
    address public owner = 0xCd14338ab62d86D17756807E536A607675D1D246;

    event RewardClaimed(address indexed user, uint256 amount);

    constructor() {
        require(msg.sender == owner, "Deploy from the authorized wallet");
    }

    receive() external payable {
        require(msg.sender == owner, "Only owner can fund the contract");
    }

    function claimReward() external {
        require(address(this).balance >= 0.009 ether, "Contract has insufficient funds");

        uint256 random = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, block.prevrandao)
            )
        );

        uint256 amount = 0.0007 ether + ((random % 10) * 0.00025 ether);
        payable(msg.sender).transfer(amount);

        emit RewardClaimed(msg.sender, amount); 
    }

    function withdrawAll() external {
        require(msg.sender == owner, "Not authorized");
        payable(owner).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
