import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    });
  }, []);
  return online;
}
