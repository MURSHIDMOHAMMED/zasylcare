"use client";

import { useEffect, useState } from "react";
import type { Lead } from "@/types/lead.types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((response) => response.json())
      .then((data) => setLeads(data.leads ?? []))
      .finally(() => setLoading(false));
  }, []);

  return { leads, loading };
}
