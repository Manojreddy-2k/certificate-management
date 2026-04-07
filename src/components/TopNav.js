"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

function getInitial(name) {
  const value = (name ?? "").trim();
  if (!value) {
    return "U";
  }
  return value[0].toUpperCase();
}

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useSession();
  const displayName = data?.user?.name ?? "User";
  const initial = getInitial(displayName);

  const isHome = pathname === "/home";

  return (
    <header
      className="w-full border-b"
      style={{
        background: "hsl(var(--navbar))",
        borderColor: "hsl(var(--border))",
        boxShadow: "0 1px 0 hsl(var(--border)), 0 4px 12px hsl(0 0% 0% / 0.06)"
      }}
    >
      <div className="flex min-h-[80px] w-full items-stretch">
        <div className="flex shrink-0 items-center justify-center self-stretch">
          <Image
            alt="State of Michigan"
            className="h-[80px] w-[80px] object-contain"
            height={256}
            priority
            src="/mi-logo.png"
            width={256}
          />
        </div>

        <div className="flex min-w-0 shrink-0 flex-col justify-center px-4 py-2">
          <div className="text-type-2xl-bold leading-tight" style={{ color: "hsl(var(--foreground))" }}>
            MiRA
          </div>
          <div className="text-type-sm-regular leading-tight" style={{ color: "hsl(var(--foreground) / 0.72)" }}>
            State of Michigan
          </div>
        </div>

        <nav
          className="flex min-h-0 flex-1 items-center justify-center gap-8 px-4"
          aria-label="Primary"
        >
          <Link
            className={`touch-target-min inline-flex items-center rounded px-2 py-2 text-type-sm-medium ${
              isHome ? "text-type-sm-semibold" : ""
            }`}
            href="/home"
            style={{
              color: isHome ? "hsl(var(--navbar-accent))" : "hsl(var(--foreground))"
            }}
          >
            Home
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3 pr-5 pl-2">
          <button
            aria-label="Profile"
            className="touch-target-min flex h-10 w-10 items-center justify-center rounded-full text-type-sm-semibold"
            onClick={() => router.push("/home")}
            type="button"
            style={{
              background: "hsl(var(--navbar-accent))",
              color: "hsl(0 0% 100%)"
            }}
            title={displayName}
          >
            <span>{initial}</span>
          </button>

          <button
            className="ui-btn ui-btn-tertiary touch-target-min"
            onClick={() => signOut({ callbackUrl: "/login" })}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
