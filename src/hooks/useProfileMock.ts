import { useState, useEffect } from "react";
import type { UserProfile } from "@/types/user.types";
import { MOCK_USER } from "@/mocks/user.mock";

export function useProfileMock() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_USER);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return {
    data,
    isLoading,
    isError,
    isEmpty: !isLoading && !data,
  };
}
