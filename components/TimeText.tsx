"use client";

import { useEffect, useState } from "react";
import { clockTime, timeAgo } from "@/lib/utils";

// Relative/clock times depend on the current time, which differs between
// the server render and the client. To avoid hydration mismatches we render
// a stable fallback on the server + first client paint, then fill in the real
// value after mount.

export function TimeAgo({ iso, fallback = "recently" }: { iso: string; fallback?: string }) {
  const [text, setText] = useState(fallback);
  useEffect(() => {
    setText(timeAgo(iso));
  }, [iso]);
  return <>{text}</>;
}

export function PostedAgo({ iso }: { iso: string }) {
  const [text, setText] = useState("Posted recently");
  useEffect(() => {
    setText(`Posted ${timeAgo(iso)}`);
  }, [iso]);
  return <>{text}</>;
}

export function ClockTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(clockTime(iso));
  }, [iso]);
  return <>{text}</>;
}
