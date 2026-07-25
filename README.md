<img width="1512" height="982" alt="Screenshot 2026-07-25 at 4 31 24 PM" src="https://github.com/user-attachments/assets/0ad26367-e7dd-4133-a97c-a4be18e7826c" />



#  Z-Escrow: Privacy-First Digital Escrow

Welcome to **Z-Escrow**, built for the Zcash Mini Build Challenge! 

Z-Escrow is a decentralized-style escrow application that leverages the unparalleled privacy of the Zcash network. It uses real Zcash RPCs to generate Unified Addresses (Sapling), securely monitor shielded transactions in the mempool, handle ZIP-317 strict fee structures, and perform multi-party escrow release and dispute resolution.

---

##  Features

-  **100% Shielded**: All escrow transactions are conducted using Sapling via Unified Addresses.
-  **Instant Mempool Detection**: The UI polls for zero-confirmation transactions, updating instantly when funds hit the mempool.
-  **Built-in Arbitration**: Features a robust "Dispute" mechanism that freezes funds and allows an Admin/Judge to intervene via a dedicated Judge Dashboard.
-  **Simulated Wallets**: Built-in "Buyer" and "Seller" wallets that interact directly with the local Zcash daemon to mine regtest ZEC and sign transactions natively.

---

## 🌐 Live Demo & Seamless Testing
You can view and interact with the live demo here: [https://placidly-flagpole-quarterly.ngrok-free.dev](https://placidly-flagpole-quarterly.ngrok-free.dev)

**Why a Live Link for a Local Node?**
To provide a seamless, frictionless testing experience for the hackathon judges! Z-Escrow relies on a real Zcash daemon running in `regtest` mode. Rather than forcing every tester to download Docker, pull the `zcashd` image, and spin up a local node just to test the UI, we are hosting the node locally and securely tunneling the traffic through **Ngrok**. 

When you click the link above, your browser connects to our Next.js frontend, which seamlessly communicates with our local Zcash RPC backend. This allows you to generate Unified Addresses, mine free ZEC, and test the full privacy escrow flow instantly—no local setup required!

---

## 🛠️ How to Test (For Hackathon Judges)

To prove this is a **100% real integration**. It connects to a real Zcash node running locally in `regtest` mode. 

Please follow these simple steps to test the app:

### Step 1: Start the Zcash Node (Docker required)
We need a local Zcash node to generate accounts, manage wallets, and sign transactions. Run this single command in your terminal to instantly spin up a private Zcash network:

```bash
docker run -d --name zcash-node -p 8232:8232 electriccoinco/zcashd -regtest -daemon=0 -showmetrics=0 -rpcuser=zcashrpc -rpcpassword=password -rpcport=8232 -rpcallowip=0.0.0.0/0 -printtoconsole=1
```

### Step 2: Start the Web App
In a new terminal window, navigate to this project folder, install dependencies, and start the Next.js server:

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 3: Test the Escrow Flow
1. On the web app, click **Start an Escrow** and fill out the form.
2. The app will securely generate a **real Shielded Unified Address** for both the Escrow Deposit and the Seller.
3. On the Escrow screen, click **"Mine Free ZEC"** on the Buyer's Wallet card to generate testnet funds.
4. Click **Pay from Wallet**. The app will automatically calculate the strict ZIP-317 fee, construct the transaction, and broadcast it. The UI will instantly detect the mempool transaction and update to **"Funds Secured"**!
5. From here, you can test two flows:
   - **Happy Path**: Click **Approve & Release Funds** to sweep the ZEC to the Seller's Wallet.
   - **Dispute Path**: Click **Dispute Transaction**, fill out a reason, and then use the **Admin: Judge Panel** link at the bottom of the page to rule in favor of the Buyer or Seller!

---

## 🏗️ Design Rationale & Wallet Management

Currently, **Z-Escrow automatically generates a Zcash Unified Address** for both the Escrow deposit and the Seller using the local Zcash daemon.

**Why is it designed this way?**
This project was built for the **Zcash Mini Build Challenge**, and the primary goal is to demonstrate the *flow* of a privacy-first escrow using `regtest`. By auto-generating the wallets on our local node:
- Judges and testers experience **zero friction**. They don't need to download external wallets, configure regtest networks, or hunt for testnet faucets.
- The UI can seamlessly control both the "Buyer" and "Seller" wallets simultaneously to demonstrate the escrow release and dispute resolution in real-time.


**Pushing to Live (Mainnet) will require a simple architecture shift**: Instead of auto-generating the Seller's wallet on the node, the "Start Escrow" form will require the Buyer to input the Seller's *existing* self-custodied Zcash Unified Address. This ensures true decentralization and self-custody.

**Advantages of Current (Regtest) Design:**
- Immediate, frictionless testing for hackathon judges.
- Complete demonstration of Zcash RPC capabilities (address generation, unspent scanning, and sending) entirely self-contained.

---

## 📖 User Flow & Pain Point Story

**The Pain Point:**
Alice, a freelance graphic designer in Nigeria, lands a gig for a client (Bob) in Europe. Alice wants to be paid in crypto to avoid massive fiat conversion fees, but she values her privacy and doesn't want her entire transaction history and wallet balance visible on a public ledger like Ethereum. Bob is happy to pay in crypto, but he wants to ensure Alice actually delivers the designs before he releases the funds. Additionally, Alice wants to avoid getting scammed or dealing with unfair chargebacks. Traditional web2 escrow services take a massive 5-10% cut, and existing web3 smart contracts are completely public, leaking business intelligence.

**The Solution Flow:**
1. **Creation:** Bob visits Z-Escrow and creates a new escrow agreement, stipulating the payment amount in ZEC.
2. **Deposit (Shielded):** Bob deposits the ZEC into the generated Escrow Unified Address. Because this uses Zcash's Sapling protocol, the amount and sender are completely shielded. The UI instantly detects the transaction in the mempool.
3. **Work & Delivery:** Alice sees the funds are safely locked in escrow and begins her design work.
4. **Resolution:** 
   - *Happy Path:* Alice delivers the work. Bob clicks "Approve & Release". The Z-Escrow backend constructs a `z_sendmany` transaction to sweep the funds to Alice's wallet, handling the strict ZIP-317 fee automatically.
   - *Dispute Path:* If Bob is unhappy with the work, he clicks "Dispute". A neutral 3rd-party Judge (Admin) reviews the evidence off-chain, and uses the Judge Dashboard to route the shielded funds to either Alice or refund Bob.

---

##  Zcash RPCs Used
- `z_getnewaccount` & `z_getaddressforaccount`: Generates unique Unified Addresses (Sapling) for every new escrow and wallet.
- `z_listunspent`: Scans the wallet for available shielded UTXOs to fund transactions.
- `z_sendmany`: Safely releases funds, auto-calculating ZIP-317 fees, and routes shielded funds between parties.
- `z_getoperationstatus`: Asynchronously tracks the success or failure of cryptographic operations.
- `generate`: Used to mine regtest blocks and confirm transactions instantly for the demo.

*Built with Next.js, Tailwind CSS, Framer Motion, and Zcash RPCs.*
