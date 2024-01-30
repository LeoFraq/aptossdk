// // src/index.ts
function greet(name: string): string {
    return `Hello, ${name}!`;
}

const result = greet("World");
console.log(result);


import { Account, AccountAddress, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

const ALICE_INITIAL_BALANCE = 100_000_000;
const BOB_INITIAL_BALANCE = 0;
const TRANSFER_AMOUNT = 1_000_000;


const main = async () => {
    // Setup the client
    const APTOS_NETWORK: Network = Network.CUSTOM;
    const config = new AptosConfig({ network: APTOS_NETWORK });
    const aptos = new Aptos(config);
    const ledgerInfo = await aptos.getLedgerInfo();
    console.log("Ledger Info:")
    console.log(ledgerInfo)

}
main()