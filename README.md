# 🛡️ Z-Escrow: Privacy-First Digital Escrow

Welcome to **Z-Escrow**, built for the Zcash Mini Build Challenge! 

Z-Escrow is a decentralized-style escrow application that leverages the unparalleled privacy of the Zcash network. It uses real Zcash RPCs to generate Unified Addresses (Sapling), securely monitor shielded transactions in the mempool, handle ZIP-317 strict fee structures, and perform multi-party escrow release and dispute resolution.

---

## ✨ Features

- 🔐 **100% Shielded**: All escrow transactions are conducted using Sapling via Unified Addresses.
- ⚡ **Instant Mempool Detection**: The UI polls for zero-confirmation transactions, updating instantly when funds hit the mempool.
- 👨‍⚖️ **Built-in Arbitration**: Features a robust "Dispute" mechanism that freezes funds and allows an Admin/Judge to intervene via a dedicated Judge Dashboard.
- 💼 **Simulated Wallets**: Built-in "Buyer" and "Seller" wallets that interact directly with the local Zcash daemon to mine regtest ZEC and sign transactions natively.

---

## 🛠️ How to Test (For Hackathon Judges)

To prove this is a **100% real integration**, this project does not use mock API responses. It connects to a real Zcash node running locally in `regtest` mode. 

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

### Step 3: Test the Escrow Flow (The Magic)
1. On the web app, click **Start an Escrow** and fill out the form.
2. The app will securely generate a **real Shielded Unified Address** for both the Escrow Deposit and the Seller.
3. On the Escrow screen, click **"Mine Free ZEC"** on the Buyer's Wallet card to generate testnet funds.
4. Click **Pay from Wallet**. The app will automatically calculate the strict ZIP-317 fee, construct the transaction, and broadcast it. The UI will instantly detect the mempool transaction and update to **"Funds Secured"**!
5. From here, you can test two flows:
   - **Happy Path**: Click **Approve & Release Funds** to sweep the ZEC to the Seller's Wallet.
   - **Dispute Path**: Click **Dispute Transaction**, fill out a reason, and then use the **Admin: Judge Panel** link at the bottom of the page to rule in favor of the Buyer or Seller!

---

## 🧠 Zcash RPCs Used
- `z_getnewaccount` & `z_getaddressforaccount`: Generates unique Unified Addresses (Sapling) for every new escrow and wallet.
- `z_listunspent`: Scans the wallet for available shielded UTXOs to fund transactions.
- `z_sendmany`: Safely releases funds, auto-calculating ZIP-317 fees, and routes shielded funds between parties.
- `z_getoperationstatus`: Asynchronously tracks the success or failure of cryptographic operations.
- `generate`: Used to mine regtest blocks and confirm transactions instantly for the demo.

*Built with Next.js, Tailwind CSS, Framer Motion, and Zcash RPCs.*
