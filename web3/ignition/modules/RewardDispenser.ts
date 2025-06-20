import { ethers } from "hardhat";

async function main() {
    // Get the signer (deployer) account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying RewardDispenser contract...");
    console.log("Deployer address:", deployer.address);

    // Deploy the RewardDispenser contract
    const RewardDispenser = await ethers.getContractFactory("RewardDispenser");
    const rewardDispenser = await RewardDispenser.deploy();

    await rewardDispenser.waitForDeployment();

    const contractAddress = await rewardDispenser.getAddress();
    console.log("RewardDispenser contract deployed at:", contractAddress);

}

// Execute the deploy script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });