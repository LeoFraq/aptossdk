/* eslint-disable no-console */

/**
 * This example shows how to use the Aptos client to create accounts, fund them, and transfer between them.
 */

import { Account, AccountAddress, Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const COIN_STORE = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";
const ALICE_INITIAL_BALANCE = 100_000_000;
const BOB_INITIAL_BALANCE = 100;
const TRANSFER_AMOUNT = 100;

let counter = 10;


const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.DEVNET;

/**
 * Prints the balance of an account
 * @param aptos
 * @param name
 * @param address
 * @returns {Promise<*>}
 *
 */
const balance = async (aptos: Aptos, name: string, address: AccountAddress) => {
    type Coin = { coin: { value: string } };
    const resource = await aptos.getAccountResource<Coin>({
        accountAddress: address,
        resourceType: COIN_STORE,
    });
    const amount = Number(resource.coin.value);

    console.log(`${name}'s balance is: ${amount}`);
    return amount;
};

const example = async () => {
    console.log("This example will create two accounts (Alice and Bob), fund them, and transfer between them.");

    // Setup the client
    const config = new AptosConfig({ network: APTOS_NETWORK });
    const aptos = new Aptos(config);

    // Create two accounts
    const alice = AccountAddress.fromString("0xc1d94f458bb4f66e85012bb30acd59f073121157803d1eafc35728957d001196");
    const bob = Account.generate();

    console.log("=== Addresses ===\n");
    console.log(`Alice's address is: ${alice}`);
    console.log(`Bob's address is: ${bob.accountAddress}`);

    // Fund the accounts
    console.log("\n=== Funding accounts ===\n");

    // const aliceFundTxn = await aptos.faucet.fundAccount({
    //     accountAddress: alice.accountAddress,
    //     amount: ALICE_INITIAL_BALANCE,
    // });
    // console.log("Alice's fund transaction: ", aliceFundTxn);

    // const bobFundTxn = await aptos.faucet.fundAccount({
    //     accountAddress: bob.accountAddress,
    //     amount: BOB_INITIAL_BALANCE,
    // });
    // console.log("Bob's fund transaction: ", bobFundTxn);

    // Show the balances
    console.log("\n=== Balances ===\n");
    const aliceBalance = await balance(aptos, "Alice", alice.accountAddress);
    const bobBalance = await balance(aptos, "Bob", bob.accountAddress);

    if (aliceBalance !== ALICE_INITIAL_BALANCE) throw new Error("Alice's balance is incorrect");
    if (bobBalance !== BOB_INITIAL_BALANCE) throw new Error("Bob's balance is incorrect");

    // Transfer between users
    for (let index = 0; index < counter; index++) {
        const txn = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: "0x1::coin::transfer",
                typeArguments: [APTOS_COIN],
                functionArguments: [bob.accountAddress, TRANSFER_AMOUNT],
            },
        });

        console.log("\n=== Transfer transaction ===\n");
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: alice, transaction: txn });

        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        console.log(`Committed transaction: ${committedTxn.hash}`);


    }

    console.log("\n=== Balances after transfer ===\n");
    const newAliceBalance = await balance(aptos, "Alice", alice.accountAddress);
    const newBobBalance = await balance(aptos, "Bob", bob.accountAddress);

    // Bob should have the transfer amount
    // if (newBobBalance !== TRANSFER_AMOUNT + BOB_INITIAL_BALANCE)
    //     throw new Error("Bob's balance after transfer is incorrect");

    // // Alice should have the remainder minus gas
    // if (newAliceBalance >= ALICE_INITIAL_BALANCE - TRANSFER_AMOUNT)
    //     throw new Error("Alice's balance after transfer is incorrect");
    let block = await aptos.getBlockByHeight({
        blockHeight: 1, options: {
            withTransactions: true
        }
    })

    console.log("Block", block)
};

example();