import { useEffect, useState } from "react";

type UseResponse<T> = [result: T | null, loading: boolean];

export default function use<T>(promise: (...v: any) => Promise<T>, ...v: any): UseResponse<T> {
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<T | null>(null);

  useEffect(() => {
    setLoading(true);
    promise(...v).then((r) => {
      setResult(r);
      setLoading(false);
    });

    return () => setLoading(true);
  }, [...v]);

  return [result, loading];
}
