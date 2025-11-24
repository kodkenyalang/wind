// src/wind/src/types.mo
// Define types used for inter-canister communication, matching the Rust canister's Candid output.
// This is a simplified version based on the Rust code's expected output.
// You might need to generate this from the Rust canister's .did file.
module Types {
  public type TokenAmount = {
    amount : Text; // String representation of the amount
    decimals : Nat8;
    uiAmount : Float;
    uiAmountString : Text;
  };
}
