use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

#[derive(BorshDeserialize, BorshSerialize)]
enum CounterInstruction {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshDeserialize, BorshSerialize)]
struct Counter {
    count: u32,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account = next_account_info(&mut accounts.iter())?;
    let mut counter = Counter::try_from_slice(&account.data.borrow())?;

    let instruction_type = CounterInstruction::try_from_slice(instruction_data)?;

    match instruction_type {
        CounterInstruction::Increment(value) => {
            counter.count += value;
        }
        CounterInstruction::Decrement(value) => {
            counter.count -= value;
        }
    }

    counter.serialize(&mut *account.data.borrow_mut())?;

    msg!("Couter successfully updated to {}", counter.count);
    Ok(())
}
