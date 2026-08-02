"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const fieldClass =
    "w-full px-4 py-2.5 pr-11 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors";

/**
 * Password field with show/hide toggle (eye button).
 */
export function PasswordInput({
    name = "password",
    placeholder = "Password",
    autoComplete = "current-password",
    value,
    onChange,
    required = true,
    minLength,
    className = "",
}) {
    const [visible, setVisible] = useState(false);

    const controlled = value !== undefined;

    return (
        <div className={`relative ${className}`}>
            <input
                name={name}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                placeholder={placeholder}
                {...(controlled ? { value, onChange } : {})}
                required={required}
                minLength={minLength}
                className={fieldClass}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 transition-colors"
            >
                {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}
