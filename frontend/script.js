// --- Configuration ---
// Replace with your actual canister ID for the Wind canister
const WIND_CANISTER_ID = "YOUR_WIND_CANISTER_ID"; // TODO: Update this!
// Example: const WIND_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

// --- Global Variables ---
let authClient = null;
let actor = null;

// --- DOM Elements ---
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const mainContent = document.getElementById('mainContent');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const userPrincipalDisplay = document.getElementById('userPrincipalDisplay');
const adminSection = document.getElementById('adminSection');
const fetchPriceBtn = document.getElementById('fetchPriceBtn');
const solPriceInput = document.getElementById('solPriceInput');
const btcPriceInput = document.getElementById('btcPriceInput');
const updateBenchmarkBtn = document.getElementById('updateBenchmarkBtn');
const assignUserInput = document.getElementById('assignUserInput');
const assignRoleSelect = document.getElementById('assignRoleSelect');
const assignRoleBtn = document.getElementById('assignRoleBtn');
const profileNameInput = document.getElementById('profileNameInput');
const profileWalletInput = document.getElementById('profileWalletInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileForm = document.getElementById('profileForm');
const profileDisplay = document.getElementById('profileDisplay');
const profileName = document.getElementById('profileName');
const profileWallet = document.getElementById('profileWallet');
const benchmarksList = document.getElementById('benchmarksList');
const currentPricesDisplay = document.getElementById('currentPricesDisplay');
const rewardHistoryList = document.getElementById('rewardHistoryList');
const fetchResult = document.getElementById('fetchResult');
const recordRewardBtn = document.getElementById('recordRewardBtn');
const rewardRecipientInput = document.getElementById('rewardRecipientInput');
const rewardAmountInput = document.getElementById('rewardAmountInput');
const triggerConditionInput = document.getElementById('triggerConditionInput');
const initSolanaBtn = document.getElementById('initSolanaBtn');
const solanaCanisterIdInput = document.getElementById('solanaCanisterIdInput');
const getSolanaAddressBtn = document.getElementById('getSolanaAddressBtn');
const solanaAddressDisplay = document.getElementById('solanaAddressDisplay');
const getSolBalanceBtn = document.getElementById('getSolBalanceBtn');
const solBalanceDisplay = document.getElementById('solBalanceDisplay');
const sendSolBtn = document.getElementById('sendSolBtn');
const sendSolRecipient = document.getElementById('sendSolRecipient');
const sendSolAmount = document.getElementById('sendSolAmount');
const getTokenBalanceBtn = document.getElementById('getTokenBalanceBtn');
const tokenMintInput = document.getElementById('tokenMintInput');
const tokenBalanceDisplay = document.getElementById('tokenBalanceDisplay');

// --- Initialization ---
authClientInit();

async function authClientInit() {
    try {
        authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();
            userPrincipalDisplay.textContent = principal.toString();
            setStatus(`Logged in as ${principal.toString()}`);
            await initializeActor();
            await loadUserData();
            mainContent.style.display = 'block';
            logoutBtn.style.display = 'inline-block';
            loginBtn.style.display = 'none';
        } else {
            setStatus('Not logged in');
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing auth client:', error);
        setStatus('Error initializing authentication');
    }
}

// --- Authentication ---
loginBtn.addEventListener('click', async () => {
    try {
        await authClient.login({
            identityProvider: 'http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai', // Use local II for local dev
            // For mainnet, use: 'https://identity.ic0.app'
            onSuccess: async () => {
                const identity = authClient.getIdentity();
                const principal = identity.getPrincipal();
                userPrincipalDisplay.textContent = principal.toString();
                setStatus(`Logged in as ${principal.toString()}`);
                await initializeActor();
                await loadUserData(); // Load user data after successful login
                mainContent.style.display = 'block';
                logoutBtn.style.display = 'inline-block';
                loginBtn.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        setStatus('Login failed');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await authClient.logout();
        setStatus('Logged out');
        resetUI();
        mainContent.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// --- Actor Initialization ---
async function initializeActor() {
    try {
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity, host: 'http://localhost:4943' }); // Adjust host for mainnet
        if (location.hostname === "localhost") {
            await agent.fetchRootKey();
        }

        // Define the combined interface for the Wind actor including Solana calls
        const idlFactory = ({ IDL }) => {
          const TokenAmount = IDL.Record({
            'amount': IDL.Text,
            'decimals': IDL.Nat8,
            'uiAmount': IDL.Float64,
            'uiAmountString': IDL.Text,
          });
          return IDL.Service({
                'initializeAccessControl': IDL.Func([], [], []),
                'initializeSolana': IDL.Func([IDL.Principal], [], []),
                'getCallerUserRole': IDL.Func([], [IDL.Variant({'admin': IDL.Null, 'user': IDL.Null})], ['query']),
                'assignCallerUserRole': IDL.Func([IDL.Principal, IDL.Variant({'admin': IDL.Null, 'user': IDL.Null})], [], []),
                'isCallerAdmin': IDL.Func([], [IDL.Bool], ['query']),
                'getCallerUserProfile': IDL.Func([], [IDL.Opt(IDL.Record({'name': IDL.Text, 'walletAddress': IDL.Text}))], ['query']),
                'getUserProfile': IDL.Func([IDL.Principal], [IDL.Opt(IDL.Record({'name': IDL.Text, 'walletAddress': IDL.Text}))], ['query']),
                'saveCallerUserProfile': IDL.Func([IDL.Record({'name': IDL.Text, 'walletAddress': IDL.Text})], [], []),
                'fetchPriceData': IDL.Func([], [IDL.Text], []),
                'updatePriceBenchmarks': IDL.Func([IDL.Float64, IDL.Float64], [], []),
                'getPriceBenchmarks': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Float64))], ['query']),
                'recordRewardEvent': IDL.Func([IDL.Record({'recipient': IDL.Text, 'amount': IDL.Float64, 'triggerCondition': IDL.Text, 'timestamp': IDL.Int64})], [], []),
                'getRewardHistory': IDL.Func([], [IDL.Vec(IDL.Record({'recipient': IDL.Text, 'amount': IDL.Float64, 'triggerCondition': IDL.Text, 'timestamp': IDL.Int64}))], ['query']),
                'getCurrentPrices': IDL.Func([], [IDL.Opt(IDL.Record({'solPrice': IDL.Float64, 'btcPrice': IDL.Float64, 'timestamp': IDL.Int64}))], ['query']),
                'updateCurrentPrices': IDL.Func([IDL.Float64, IDL.Float64], [], []),
                // Solana methods exposed by the Wind actor
                'getSolanaAddress': IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Text], ['query']),
                'getSolanaBalance': IDL.Func([IDL.Opt(IDL.Text)], [IDL.Nat], ['query']),
                'getSPLTokenBalance': IDL.Func([IDL.Opt(IDL.Text), IDL.Text], [TokenAmount], ['query']),
                'sendSol': IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
                'sendSPLToken': IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Text], []),
            });
        };

        actor = Actor.createActor(idlFactory, { agent, canisterId: Principal.fromText(WIND_CANISTER_ID) });
    } catch (error) {
        console.error('Error initializing actor:', error);
        setStatus('Error initializing actor');
    }
}

// --- Data Loading ---
async function loadUserData() {
    if (!actor) return;
    try {
        // Fetch User Role
        const userRole = await actor.getCallerUserRole();
        const roleText = userRole.admin ? 'Admin' : 'User';
        userRoleDisplay.textContent = roleText;

        // Show Admin Section if Admin
        if (userRole.admin) {
            adminSection.style.display = 'block';
        } else {
            adminSection.style.display = 'none';
        }

        // Fetch User Profile
        const profile = await actor.getCallerUserProfile();
        if (profile.length > 0) { // Option type in Candid returns an array
            const { name, walletAddress } = profile[0];
            profileName.textContent = name;
            profileWallet.textContent = walletAddress;
            profileForm.style.display = 'none';
            profileDisplay.style.display = 'block';
        } else {
            profileName.textContent = '-';
            profileWallet.textContent = '-';
            profileForm.style.display = 'none';
            profileDisplay.style.display = 'block';
        }

        // Fetch Price Benchmarks
        const benchmarks = await actor.getPriceBenchmarks();
        benchmarksList.innerHTML = '';
        benchmarks.forEach(([key, value]) => {
            const li = document.createElement('li');
            li.textContent = `${key}: $${value.toFixed(2)}`;
            benchmarksList.appendChild(li);
        });

        // Fetch Current Prices
        const currentPrices = await actor.getCurrentPrices();
        if (currentPrices.length > 0) {
            const { solPrice, btcPrice, timestamp } = currentPrices[0];
            const date = new Date(Number(timestamp / 1000000n)); // Convert nanoseconds to milliseconds
            currentPricesDisplay.innerHTML = `<p>SOL: $${solPrice.toFixed(2)}</p><p>BTC: $${btcPrice.toFixed(2)}</p><p>Updated: ${date.toLocaleString()}</p>`;
        } else {
            currentPricesDisplay.textContent = 'No current prices available.';
        }

        // Fetch Reward History
        const rewardHistory = await actor.getRewardHistory();
        rewardHistoryList.innerHTML = '';
        rewardHistory.forEach(event => {
            const date = new Date(Number(event.timestamp / 1000000n));
            const li = document.createElement('li');
            li.innerHTML = `<strong>${event.recipient}</strong>: ${event.amount} - ${event.triggerCondition} (${date.toLocaleString()})`;
            rewardHistoryList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading user ', error);
        alert(`Error loading  ${error.message || error}`);
    }
}

// --- Helper Functions ---
function setStatus(message) {
    userStatus.textContent = message;
}

function resetUI() {
    userRoleDisplay.textContent = '-';
    userPrincipalDisplay.textContent = '-';
    profileName.textContent = '-';
    profileWallet.textContent = '-';
    benchmarksList.innerHTML = '';
    currentPricesDisplay.textContent = '-';
    rewardHistoryList.innerHTML = '';
    adminSection.style.display = 'none';
    profileForm.style.display = 'none';
    profileDisplay.style.display = 'block';
    solPriceInput.value = '';
    btcPriceInput.value = '';
    assignUserInput.value = '';
    assignRoleSelect.value = 'user';
    rewardRecipientInput.value = '';
    rewardAmountInput.value = '';
    triggerConditionInput.value = '';
    solanaCanisterIdInput.value = '';
    solanaAddressDisplay.textContent = '-';
    solBalanceDisplay.textContent = '-';
    tokenBalanceDisplay.textContent = '-';
    sendSolRecipient.value = '';
    sendSolAmount.value = '';
    tokenMintInput.value = '';
    fetchResult.textContent = '';
}

// --- Event Listeners ---

// Admin
fetchPriceBtn.addEventListener('click', async () => {
    if (!actor) return;
    try {
        const result = await actor.fetchPriceData();
        fetchResult.textContent = `API Response: ${result}`;
    } catch (error) {
        console.error('Error fetching price ', error);
        fetchResult.textContent = `Error: ${error.message || error}`;
    }
});

updateBenchmarkBtn.addEventListener('click', async () => {
    if (!actor) return;
    const solPrice = parseFloat(solPriceInput.value);
    const btcPrice = parseFloat(btcPriceInput.value);

    if (isNaN(solPrice) || isNaN(btcPrice)) {
        alert('Please enter valid numbers for both prices.');
        return;
    }
    try {
        await actor.updatePriceBenchmarks(solPrice, btcPrice);
        alert('Price benchmarks updated successfully!');
        await loadUserData(); // Reload data to reflect changes
        solPriceInput.value = '';
        btcPriceInput.value = '';
    } catch (error) {
        console.error('Error updating benchmarks:', error);
        alert(`Error updating benchmarks: ${error.message || error}`);
    }
});

assignRoleBtn.addEventListener('click', async () => {
    if (!actor) return;
    const userPrincipalText = assignUserInput.value.trim();
    const selectedRole = assignRoleSelect.value;

    if (!userPrincipalText) {
        alert('Please enter a principal ID.');
        return;
    }
    try {
        const userPrincipal = Principal.fromText(userPrincipalText);
        const roleVariant = { [selectedRole]: null }; // Candid variant
        await actor.assignCallerUserRole(userPrincipal, roleVariant);
        alert(`Role ${selectedRole} assigned to ${userPrincipalText} successfully!`);
        assignUserInput.value = '';
        // Optionally, reload user data if the assigned user is the caller
    } catch (error) {
        console.error('Error assigning role:', error);
        alert(`Error assigning role: ${error.message || error}`);
    }
});

recordRewardBtn.addEventListener('click', async () => {
    if (!actor) return;
    const recipient = rewardRecipientInput.value.trim();
    const amount = parseFloat(rewardAmountInput.value);
    const condition = triggerConditionInput.value.trim();

    if (!recipient || isNaN(amount) || !condition) {
        alert('Please fill in all reward event fields.');
        return;
    }
    try {
        const now = BigInt(Date.now()) * 1000000n; // Timestamp in nanoseconds
        const event = {
            recipient,
            amount,
            triggerCondition: condition,
            timestamp: now
        };
        await actor.recordRewardEvent(event);
        alert('Reward event recorded successfully!');
        rewardRecipientInput.value = '';
        rewardAmountInput.value = '';
        triggerConditionInput.value = '';
        await loadUserData(); // Reload history
    } catch (error) {
        console.error('Error recording reward:', error);
        alert(`Error recording reward: ${error.message || error}`);
    }
});

initSolanaBtn.addEventListener('click', async () => {
    if (!actor) return;
    const solanaId = solanaCanisterIdInput.value.trim();
    if (!solanaId) {
        alert('Please enter a Solana canister ID.');
        return;
    }
    try {
        const solanaPrincipal = Principal.fromText(solanaId);
        await actor.initializeSolana(solanaPrincipal);
        alert('Solana integration initialized successfully!');
        solanaCanisterIdInput.value = '';
    } catch (error) {
        console.error('Error initializing Solana:', error);
        alert(`Error initializing Solana: ${error.message || error}`);
    }
});

// Profile
editProfileBtn.addEventListener('click', () => {
    if (profileName.textContent !== '-') {
        profileNameInput.value = profileName.textContent;
    }
    if (profileWallet.textContent !== '-') {
        profileWalletInput.value = profileWallet.textContent;
    }
    profileDisplay.style.display = 'none';
    profileForm.style.display = 'flex';
});

cancelProfileBtn.addEventListener('click', () => {
    profileForm.style.display = 'none';
    profileDisplay.style.display = 'block';
});

saveProfileBtn.addEventListener('click', async () => {
    if (!actor) return;
    const name = profileNameInput.value.trim();
    const walletAddress = profileWalletInput.value.trim();

    if (!name || !walletAddress) {
        alert('Please fill in both name and wallet address.');
        return;
    }
    try {
        const profile = { name, walletAddress };
        await actor.saveCallerUserProfile(profile);
        alert('Profile saved successfully!');
        profileName.textContent = name;
        profileWallet.textContent = walletAddress;
        profileForm.style.display = 'none';
        profileDisplay.style.display = 'block';
    } catch (error) {
        console.error('Error saving profile:', error);
        alert(`Error saving profile: ${error.message || error}`);
    }
});

// Solana
getSolanaAddressBtn.addEventListener('click', async () => {
    if (!actor) return;
    try {
        const address = await actor.getSolanaAddress(null); // null means use caller's principal
        solanaAddressDisplay.textContent = address;
    } catch (error) {
        console.error('Error getting Solana address:', error);
        solanaAddressDisplay.textContent = `Error: ${error.message || error}`;
    }
});

getSolBalanceBtn.addEventListener('click', async () => {
    if (!actor) return;
    try {
        const balance = await actor.getSolanaBalance(null); // null means use derived address
        solBalanceDisplay.textContent = `${balance} lamports`;
    } catch (error) {
        console.error('Error getting SOL balance:', error);
        solBalanceDisplay.textContent = `Error: ${error.message || error}`;
    }
});

getTokenBalanceBtn.addEventListener('click', async () => {
    if (!actor) return;
    const mintAddress = tokenMintInput.value.trim();
    if (!mintAddress) {
        alert('Please enter a token mint address.');
        return;
    }
    try {
        const balance = await actor.getSPLTokenBalance(null, mintAddress); // null means use derived address
        tokenBalanceDisplay.innerHTML = `<p>Amount: ${balance.uiAmountString}</p><p>Decimals: ${balance.decimals}</p>`;
    } catch (error) {
        console.error('Error getting token balance:', error);
        tokenBalanceDisplay.textContent = `Error: ${error.message || error}`;
    }
});

sendSolBtn.addEventListener('click', async () => {
    if (!actor) return;
    const recipient = sendSolRecipient.value.trim();
    const amount = sendSolAmount.value.trim();
    if (!recipient || !amount || isNaN(amount)) {
        alert('Please enter recipient address and a valid amount.');
        return;
    }
    try {
        const result = await actor.sendSol(recipient, BigInt(amount));
        alert(`Transaction sent successfully! TXID: ${result}`);
        // Optionally reload balance
        // await loadSolanaData();
    } catch (error) {
        console.error('Error sending SOL:', error);
        alert(`Error sending SOL: ${error.message || error}`);
    }
});
