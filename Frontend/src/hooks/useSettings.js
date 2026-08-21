import { useEffect, useState } from "react";
import api from "../api/axios";

let cache = null;

export function useSettings() {
  const [settings, setSettings] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    api
      .get("/settings")
      .then(({ data }) => {
        if (active) {
          cache = data.settings;
          setSettings(data.settings);
        }
      })
      .catch(() => {
        // settings endpoint unreachable - components fall back to hardcoded defaults
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
