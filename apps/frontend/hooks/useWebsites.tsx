"use client";
import { API_BACKEND_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";

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

export function useWebsites(getToken: (() => Promise<string | null>) | null) {
    const [websites, setWebsites] = useState<Website[]>([]);

    async function refreshWebsites() {    
        try {
            if (!getToken) {
                setWebsites([]);
                return;
            }

            const token = await getToken();

            if (!token) {
                console.error('No auth token available');
                return;
            }
            
            const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setWebsites(response.data.websites);
        } catch (error) {
            console.error('Error fetching websites:', error);
        }
    }

    useEffect(() => {
        refreshWebsites();

        const interval = setInterval(() => {
            refreshWebsites();
        }, 1000 * 60 * 1);

        return () => clearInterval(interval);
    }, []);

    return { websites, refreshWebsites };

}
