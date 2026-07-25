#!/bin/bash

# A simple script to fund an escrow address on the local Zcash Regtest node

ADDRESS=$1
AMOUNT=${2:-10.0}

if [ -z "$ADDRESS" ]; then
  echo "❌ Error: Please provide the Escrow Address from the UI."
  echo "Usage: ./fund.sh <zcash_address> [amount]"
  exit 1
fi

echo "⛏️  Mining blocks to generate funds..."
docker exec zcash-node zcash-cli -regtest generate 101 > /dev/null

echo "💸 Sending $AMOUNT ZEC to $ADDRESS..."
docker exec zcash-node zcash-cli -regtest z_sendmany "*" "[{\"address\": \"$ADDRESS\", \"amount\": $AMOUNT}]" > /dev/null

echo "✅ Transaction sent to mempool. Mining 1 block to confirm..."
docker exec zcash-node zcash-cli -regtest generate 1 > /dev/null

echo "🎉 Success! Check your web browser, the UI should now update automatically to 'Funds Secured'."
