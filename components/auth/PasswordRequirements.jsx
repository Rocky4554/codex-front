"use client";

import { Check } from "lucide-react";

export const PASSWORD_RULES = [
    {
        id: "upper",
        label: "Uppercase letter",
        test: (p) => /[A-Z]/.test(p),
    },
    {
        id: "lower",
        label: "Lowercase letter",
        test: (p) => /[a-z]/.test(p),
    },
    {
        id: "number",
        label: "Number",
        test: (p) => /\d/.test(p),
    },
    {
        id: "special",
        label: "Special character (e.g. !?<>@#$%)",
        test: (p) => /[!?<>@#$%^&*()_\-+=[\]{};:'",.\\|/~`]/.test(p),
    },
    {
        id: "length",
        label: "8 characters or more",
        test: (p) => p.length >= 8,
    },
];

export function evaluatePassword(password) {
    const value = password || "";
    return PASSWORD_RULES.map((rule) => ({
        ...rule,
        met: rule.test(value),
    }));
}

export function isPasswordStrong(password) {
    return evaluatePassword(password).every((r) => r.met);
}

/**
 * Live checklist — empty circles fill with a check when each rule is met.
 */
export function PasswordRequirements({ password }) {
    const rules = evaluatePassword(password);

    return (
        <ul className="space-y-1.5 pt-1" aria-live="polite">
            {rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2.5 text-sm">
                    <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            rule.met
                                ? "border-green-500 bg-green-500 text-black"
                                : "border-dashed border-zinc-500 bg-transparent"
                        }`}
                        aria-hidden
                    >
                        {rule.met && <Check className="h-3 w-3 stroke-3" />}
                    </span>
                    <span className={rule.met ? "text-zinc-200" : "text-zinc-500"}>
                        {rule.label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
