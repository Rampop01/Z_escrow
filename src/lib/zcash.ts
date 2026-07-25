import axios from "axios";

const RPC_USER = process.env.RPC_USER || "zcashrpc";
const RPC_PASSWORD = process.env.RPC_PASSWORD || "password";
const RPC_HOST = process.env.RPC_HOST || "127.0.0.1";
const RPC_PORT = process.env.RPC_PORT || "8232"; // Mainnet is 8232, testnet is 18232

const rpcClient = axios.create({
  baseURL: `http://${RPC_HOST}:${RPC_PORT}`,
  auth: {
    username: RPC_USER,
    password: RPC_PASSWORD,
  },
  headers: {
    "Content-Type": "text/plain",
  },
});

export async function zcashRpcCall(method: string, params: any[] = []) {
  try {
    const response = await rpcClient.post("/", {
      jsonrpc: "1.0",
      id: "z-escrow",
      method,
      params,
    });
    return response.data.result;
  } catch (error: any) {
    console.error(`Zcash RPC Error [${method}]:`, error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error?.message || "RPC connection failed");
  }
}

export const zcash = {
  /**
   * Generates a new shielded (z) address for the escrow deposit.
   */
  getNewAddress: async (): Promise<string> => {
    // getnewaddress is deprecated and disabled in Zcash 5.x. We MUST use unified accounts.
    const accountRes = await zcashRpcCall("z_getnewaccount");
    // Request BOTH a transparent (p2pkh) and shielded (sapling) receiver
    const addressRes = await zcashRpcCall("z_getaddressforaccount", [accountRes.account, ["p2pkh", "sapling"]]);
    
    // Return the Unified Address directly. Now that the buyer properly shields their 
    // coinbase rewards, we don't need to force transparent-to-transparent transactions!
    return addressRes.address;
  },

  /**
   * Checks the balance received by a specific shielded address.
   */
  getListReceivedByAddress: async (address: string): Promise<number> => {
    // If it's a transparent address, use listunspent (0 confs) to avoid the "bare receiver" error
    // which Zcash 5.x throws when calling z_listreceivedbyaddress on a p2pkh extracted from a UA.
    if (address.startsWith('t')) {
      const unspent = await zcashRpcCall("listunspent", [0, 9999999, [address]]);
      return unspent.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    }

    // Returns an array of received transactions (0 confirmations to detect instant mempool payments)
    const received = await zcashRpcCall("z_listreceivedbyaddress", [address, 0]);
    // Sum up the amounts
    const total = received.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    return total;
  },

  /**
   * Sends ZEC from the escrow address to the seller's address.
   */
  sendMany: async (fromAddress: string, toAddress: string, amount: number): Promise<string> => {
    // We need to subtract the miner fee from the amount to send if sending the exact balance
    // We strictly use 0.0001 because sending from an escrow UA with 1 UTXO is exactly 2 actions (1 input + 1 output)
    const fee = 0.0001; 
    const sendAmount = amount - fee;
    
    if (sendAmount <= 0) throw new Error("Amount too small to cover fee");

    return await zcashRpcCall("z_sendmany", [
      fromAddress, 
      [{ address: toAddress, amount: sendAmount }],
      1, // minconf
      fee // explicit fee that precisely matches ZIP 317 for this transaction shape
    ]);
  }
};
