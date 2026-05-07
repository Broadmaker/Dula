import { useState, useEffect } from "react";
import type { Match } from "@/types/match.types";
import { MOCK_MATCHES } from "@/mocks/match.mock";

export function useMatchMock(id?: string) {
  const [data, setData] = useState<Match[]>([]);
  const [singleData, setSingleData] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (id) {
        const match = MOCK_MATCHES.find((m) => m.uuid === id) || null;
        setSingleData(match);
      } else {
        setData(MOCK_MATCHES);
      }
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id]);

  return {
    data,
    singleData,
    isLoading,
    isError,
    isEmpty: !isLoading && (id ? !singleData : data.length === 0),
  };
}
