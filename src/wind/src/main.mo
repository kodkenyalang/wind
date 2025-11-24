import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Types "./types";

// Interface for the Solana RPC canister
actor SolanaRpcCanister {
  public func solana_account(owner : ?Principal) : async Text;
  public func get_balance(account : ?Text) : async Nat;
  public func get_spl_token_balance(account : ?Text, mint_account : Text) : async Types.TokenAmount;
  public func send_sol(owner : ?Principal, to : Text, amount : Nat) : async Text;
  public func send_spl_token(owner : ?Principal, mint_account : Text, to : Text, amount : Nat) : async Text;
  // Add other relevant functions from the Rust canister here
};

actor Wind {
  let accessControlState = AccessControl.initState();
  var solanaCanister : ?Principal = null;

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public shared ({ caller }) func initializeSolana(solanaId : Principal) : async () {
     if (not AccessControl.isAdmin(accessControlState, caller)) {
        Debug.trap("Unauthorized: Only admins can initialize Solana integration");
    };
    solanaCanister := ?solanaId;
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    walletAddress : Text;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public type PriceData = {
    solPrice : Float;
    btcPrice : Float;
    timestamp : Int;
  };

  public type RewardEvent = {
    recipient : Text;
    amount : Float;
    triggerCondition : Text;
    timestamp : Int;
  };

  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  var priceBenchmarks = textMap.empty<Float>();
  var rewardHistory = textMap.empty<RewardEvent>();
  var currentPrices : ?PriceData = null;

  public shared ({ caller }) func fetchPriceData() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can fetch price data");
    };
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin&vs_currencies=usd";
    // Assuming OutCall logic is handled elsewhere or using a different library
    // For simplicity, returning a placeholder string here
    return "Price data fetched from external API (placeholder)";
  };

  public shared ({ caller }) func updatePriceBenchmarks(solPrice : Float, btcPrice : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update benchmarks");
    };
    priceBenchmarks := textMap.put(priceBenchmarks, "SOL", solPrice);
    priceBenchmarks := textMap.put(priceBenchmarks, "BTC", btcPrice);
  };

  public query ({ caller }) func getPriceBenchmarks() : async [(Text, Float)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view price benchmarks");
    };
    Iter.toArray(textMap.entries(priceBenchmarks));
  };

  public shared ({ caller }) func recordRewardEvent(event : RewardEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can record reward events");
    };
    rewardHistory := textMap.put(rewardHistory, event.recipient # Int.toText(Time.now()), event);
  };

  public query ({ caller }) func getRewardHistory() : async [RewardEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view reward history");
    };
    Iter.toArray(textMap.vals(rewardHistory));
  };

  public query ({ caller }) func getCurrentPrices() : async ?PriceData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view current prices");
    };
    currentPrices;
  };

  public shared ({ caller }) func updateCurrentPrices(solPrice : Float, btcPrice : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update current prices");
    };
    currentPrices := ?{
      solPrice;
      btcPrice;
      timestamp = Time.now();
    };
  };

  // --- New Solana Functions ---

  public query ({ caller }) func getSolanaAddress(owner : ?Principal) : async Text {
      let actualOwner = owner ? caller : owner!;
      if (solanaCanister == null) {
          Debug.trap("Solana integration not initialized");
      };
      let solRpc = actor (Principal.toText(solanaCanister!)!) : SolanaRpcCanister;
      await solRpc.solana_account(?actualOwner);
  };

  public query ({ caller }) func getSolanaBalance(account : ?Text) : async Nat {
      if (solanaCanister == null) {
          Debug.trap("Solana integration not initialized");
      };
      let solRpc = actor (Principal.toText(solanaCanister!)!) : SolanaRpcCanister;
      await solRpc.get_balance(account);
  };

  public query ({ caller }) func getSPLTokenBalance(account : ?Text, mintAccount : Text) : async Types.TokenAmount {
      if (solanaCanister == null) {
          Debug.trap("Solana integration not initialized");
      };
      let solRpc = actor (Principal.toText(solanaCanister!)!) : SolanaRpcCanister;
      await solRpc.get_spl_token_balance(account, mintAccount);
  };

  public shared ({ caller }) func sendSol(to : Text, amount : Nat) : async Text {
      if (solanaCanister == null) {
          Debug.trap("Solana integration not initialized");
      };
      let solRpc = actor (Principal.toText(solanaCanister!)!) : SolanaRpcCanister;
      await solRpc.send_sol(?caller, to, amount); // Pass caller as owner
  };

  public shared ({ caller }) func sendSPLToken(mintAccount : Text, to : Text, amount : Nat) : async Text {
      if (solanaCanister == null) {
          Debug.trap("Solana integration not initialized");
      };
      let solRpc = actor (Principal.toText(solanaCanister!)!) : SolanaRpcCanister;
      await solRpc.send_spl_token(?caller, mintAccount, to, amount); // Pass caller as owner
  };
};
