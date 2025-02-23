const { ethers } = require("ethers");

// Connect to your Geth node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

async function listAccounts() {
    try {
        const accounts = await provider.listAccounts();
        console.log("Accounts:", accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
    }
}

listAccounts();


