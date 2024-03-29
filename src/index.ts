// // src/index.ts
function greet(name: string): string {
    return `Hello, ${name}!`;
}

const result = greet("World");
console.log(result);

// curl --request GET \
//  --url http://10.1.2.4:8080/v1/accounts/$ACC \
//  --header 'Accept: application/json'

// curl--request GET \
// --url http://10.1.2.4:8080/v1/ \
// --header 'Accept: application/json'




import { Aptos, AptosConfig, Network, Account, AccountAddress, PrivateKey, Ed25519PrivateKey, Hex, Secp256k1PrivateKey } from "@aptos-labs/ts-sdk";
// import * as apt from "@aptos-labs/ts-sdk"
const COIN_STORE = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";

const ALICE_INITIAL_BALANCE = 100_000_000;
const BOB_INITIAL_BALANCE = 0;
const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const TRANSFER_AMOUNT = 1_000_000;

const fullnodeIP = "http://10.1.2.4:8080/v1"
const faucetIP = "http://127.0.0.1:8080"

const main = async () => {
    // Setup the client
    const APTOS_NETWORK: Network = Network.DEVNET;
    const config = new AptosConfig({
        network: APTOS_NETWORK,
        fullnode: fullnodeIP
    });
    const aptos = new Aptos(config);
    const ledgerInfo = await aptos.getLedgerInfo();
    console.log("Ledger Info:")
    console.log(ledgerInfo)


    console.log("This example will create two accounts (Alice and Bob), fund them, and transfer between them.");


    // Create two accounts
    const addrStr = "75e527d81ebd983aa1075127ac21c80886fe495dc215120de7ee081862f03ff8";
    const alice = AccountAddress.fromString(addrStr);
    const pkStr = "0x7e860a7149bd261c3c5697171e32e908f56f91672e9e6b182e1b5805d305acd1"
    // const Hx = Hex.fromString(pkStr)
    const Edkey = new Ed25519PrivateKey(pkStr)
    const Secp = new Secp256k1PrivateKey(pkStr)

    const aliceAcc = Account.fromPrivateKey({ privateKey: Edkey })
    // const edp = Ed25519PrivateKey.fromDerivationPath(pkStr)
    const bob = Account.generate();

    console.log("=== Addresses ===\n");
    console.log(`Alice's address is: ${alice}`);
    console.log(`Bob's address is: ${bob.accountAddress}`);


    // Show the balances
    console.log("\n=== Balances ===\n");
    const amount = await aptos.getAccountAPTAmount({
        accountAddress: alice,
    });
    console.log(`alice's balance is: ${amount}`);
    const aliceBalance = await balance(aptos, "Alice", alice);
    // const bobBalance = await balance(aptos, "Bob", bob.accountAddress);

    // if (aliceBalance !== ALICE_INITIAL_BALANCE) throw new Error("Alice's balance is incorrect");
    // if (bobBalance !== BOB_INITIAL_BALANCE) throw new Error("Bob's balance is incorrect");

    // Transfer between users
    const txn = await aptos.transaction.build.simple({
        sender: alice,
        data: {
            function: "0x1::coin::transfer",
            typeArguments: [APTOS_COIN],
            functionArguments: [alice, TRANSFER_AMOUNT],
        },
    });

    console.log("\n=== Transfer transaction ===\n");
    const committedTxn = await aptos.signAndSubmitTransaction({ signer: aliceAcc, transaction: txn });

    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    console.log(`Committed transaction: ${committedTxn.hash}`);

    // console.log("\n=== Balances after transfer ===\n");
    // const newAliceBalance = await balance(aptos, "Alice", alice.accountAddress);
    // const newBobBalance = await balance(aptos, "Bob", bob.accountAddress);

    // // Bob should have the transfer amount
    // if (newBobBalance !== TRANSFER_AMOUNT + BOB_INITIAL_BALANCE)
    //     throw new Error("Bob's balance after transfer is incorrect");

    // // Alice should have the remainder minus gas
    // if (newAliceBalance >= ALICE_INITIAL_BALANCE - TRANSFER_AMOUNT)
    //     throw new Error("Alice's balance after transfer is incorrect");
};



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

main()