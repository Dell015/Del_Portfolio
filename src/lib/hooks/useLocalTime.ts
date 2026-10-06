"use client";

import { useEffect, useState } from "react";

/**
 * Current time in a given IANA time zone, formatted like "4:05 PM".
 * Returns null until mounted so server and first client render agree.
 */
export function useLocalTime(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, [timeZone]);

  return time;
}
