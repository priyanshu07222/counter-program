import { expect, test } from "bun:test"
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
import { COUNTER_SIZE, CounterAccount, schema } from "./types";
import * as borsh from "borsh"

let counterAccountKaypair: Keypair = new Keypair();
let adminKeypair: Keypair = Keypair.generate();

const programId = new PublicKey("dyx");

const connection = new Connection("http://localhost:8999", "confirmed");


test("Account initialised", () => {
    expect(1).toBe(1);
})

test("counter does increase", async () => {
    const res = await connection.requestAirdrop(adminKeypair.publicKey, 5 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    const createCounterAccountIns = SystemProgram.createAccount({
        fromPubkey: adminKeypair.publicKey,
        lamports,
        newAccountPubkey: counterAccountKaypair.publicKey,
        programId,
        space: COUNTER_SIZE
    })

    const txn = new Transaction().add(createCounterAccountIns);
    const txHash = await connection.sendTransaction(txn, [adminKeypair, counterAccountKaypair]);
    const signature = await connection.confirmTransaction(txHash);

    const counterAccount = await connection.getAccountInfo(counterAccountKaypair.publicKey);
    if (!counterAccount) {
        throw new Error("Counter account not found")
    }

    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount
    console.log(counter.count)

    expect(counter.count).toBe(0);
})

test("increase the count by 2", async () => {
    const res = await connection.requestAirdrop(adminKeypair.publicKey, 5 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const lamports = await connection.getMinimumBalanceForRentExemption(COUNTER_SIZE);
    const createCounterAccountIns = SystemProgram.createAccount({
        fromPubkey: adminKeypair.publicKey,
        lamports,
        newAccountPubkey: counterAccountKaypair.publicKey,
        programId,
        space: COUNTER_SIZE
    })

    const txn = new Transaction().add(createCounterAccountIns);
    const txHash = await connection.sendTransaction(txn, [adminKeypair, counterAccountKaypair]);
    const signature = await connection.confirmTransaction(txHash);

    const createAddIx = new TransactionInstruction({
        keys: [{
            pubkey: counterAccountKaypair.publicKey,
            isSigner: true,
            isWritable: true
        }],
        programId,
        data: Buffer.from(new Uint8Array([0, 2, 0, 0, 0]))
    });

    const tx = new Transaction().add(createAddIx);
    const txAddHash = await connection.sendTransaction(tx, [adminKeypair, counterAccountKaypair]);
    const signatureAdd = await connection.confirmTransaction(txAddHash)
    console.log(signatureAdd);

    const getAcc = await connection.getAccountInfo(counterAccountKaypair.publicKey);
    if (!getAcc) {
        throw new Error("Counter account not found")
    }

    const counter = borsh.deserialize(schema, getAcc.data) as CounterAccount
    console.log(counter.count)

    expect(counter.count).toBe(2);
})