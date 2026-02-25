"use client";

import { API_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface Website {
  id: string;
  url: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
  }[];
}

export function useWebsites() {
  const { getToken } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  const refreshWebsites = useCallback(async () => {
    const token = await getToken();
    const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
      headers: {
        Authorization: token ?? undefined,
      },
    });

    setWebsites(response.data.websites ?? []);
  }, [getToken]);

  const deleteWebsite = useCallback(
    async (websiteId: string) => {
      const token = await getToken();
      await axios.delete(`${API_BACKEND_URL}/api/v1/website/`, {
        headers: {
          Authorization: token ?? undefined,
        },
        data: {
          websiteId,
        },
      });

      setWebsites((prev) => prev.filter((website) => website.id !== websiteId));
    },
    [getToken]
  );

  useEffect(() => {
    const timeoutId = setTimeout(refreshWebsites, 0);
    const intervalId = setInterval(refreshWebsites, 1000 * 60 * 1);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [refreshWebsites]);

  return { websites, refreshWebsites, deleteWebsite };
}
