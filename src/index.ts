// // src/index.ts
function greet(name: string): string {
    return `Hello, ${name}!`;
}

const result = greet("World");
console.log(result);


import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";
// import * as apt from "@aptos-labs/ts-sdk"

const ALICE_INITIAL_BALANCE = 100_000_000;
const BOB_INITIAL_BALANCE = 0;
const TRANSFER_AMOUNT = 1_000_000;

const fullnodeIP = "http://10.1.2.4:8080/v1/"
// const faucetIP = "http://127.0.0.1:8000/"

const main = async () => {
    // Setup the client
    const APTOS_NETWORK: Network = Network.CUSTOM;
    const config = new AptosConfig({
        network: APTOS_NETWORK,
        fullnode: fullnodeIP
        // faucet: faucetIP
    });
    const aptos = new Aptos(config);
    const ledgerInfo = await aptos.getLedgerInfo();
    console.log("Ledger Info:")
    console.log(ledgerInfo)


    // Create two accounts
    const alice = Account.generate();
    const bob = Account.generate();

    console.log("=== Addresses ===\n");
    console.log(`Alice's address is: ${alice.accountAddress}`);
    console.log(`Bob's address is: ${bob.accountAddress}`);
    const tx = await aptos.transaction.build.simple({
        sender: alice.accountAddress,
        data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [bob.accountAddress, 100],
        },
    });

}
main()