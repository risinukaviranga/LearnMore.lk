"use client";

import type { ReactNode } from "react";

/** Submit button that asks the user to confirm first (used for safe deletes). */
export default function ConfirmButton({
  message,
  className = "btn-danger btn-sm",
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
