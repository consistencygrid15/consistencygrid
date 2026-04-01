"use client";

import { useEffect } from "react";

export default function DesktopAppBridge({ publicToken }) {
  useEffect(() => {
    if (publicToken) {
      localStorage.setItem("consistencygrid_token", publicToken);
    }
  }, [publicToken]);

  return null;
}
