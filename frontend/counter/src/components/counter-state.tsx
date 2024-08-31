import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, counterPDA } from "../anchor/setup";

type CounterData = {
  count: bigint;
  bump: number;
};

export default function CounterState() {
  const { connection } = useConnection();
  const [counterData, setCounterData] = useState<CounterData | null>(null);

  useEffect(() => {
    // Fetch initial account data
    const fetchCounterData = async () => {
      try {
        // Use type assertion to ensure TypeScript understands the type
        const data = await (program.account as any).counter.fetch(counterPDA) as CounterData;
        // Ensure count is a bigint
        const count = BigInt(data.count);
        const bump = data.bump;
        setCounterData({ count, bump });
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    fetchCounterData();

  // Subscribe to account change
  const subscriptionId = connection.onAccountChange(
    counterPDA,
    (accountInfo) => {
      try {
        const decodedData = program.coder.accounts.decode("counter", accountInfo.data);
        console.log("Decoded Data:", decodedData);
        setCounterData(decodedData);
      } catch (err) {
        console.error("Error decoding account data:", err);
      }
    }
  );

  return () => {
    // Unsubscribe from account change
    connection.removeAccountChangeListener(subscriptionId);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [program]);

return <p className="text-lg">Count: {counterData?.count?.toString()}</p>;
}