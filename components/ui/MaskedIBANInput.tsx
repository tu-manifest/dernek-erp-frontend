"use client";

import React, { forwardRef, useState, useEffect, useRef } from "react";

interface MaskedIBANInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    hasError?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
}

/**
 * Turkish IBAN input with mask: TR XX XXXX XXXX XXXX XXXX XXXX XX (26 chars)
 */
const MaskedIBANInput = forwardRef<HTMLInputElement, MaskedIBANInputProps>(
    (
        {
            value,
            onChange,
            className = "",
            placeholder = "TR XX XXXX XXXX XXXX XXXX XXXX XX",
            hasError = false,
            disabled = false,
            id,
            name,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState("TR");
        const [isFocused, setIsFocused] = useState(false);
        const isInitialMount = useRef(true);

        // Format IBAN for display: TR XX XXXX XXXX XXXX XXXX XXXX XX
        const formatIBAN = (input: string): string => {
            // Remove all spaces and non-alphanumeric chars, uppercase
            let clean = input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

            // Ensure it starts with TR
            if (!clean.startsWith("TR")) {
                if (clean.startsWith("T")) {
                    // partial, keep it
                } else {
                    clean = "TR" + clean.replace(/^[A-Z]*/g, "");
                }
            }

            // Keep only TR + max 24 digits
            const prefix = clean.slice(0, 2);
            const digits = clean.slice(2).replace(/\D/g, "").slice(0, 24);

            // Build formatted string
            let formatted = prefix;
            if (digits.length > 0) {
                formatted += " " + digits.slice(0, 2);
            }
            if (digits.length > 2) {
                formatted += " " + digits.slice(2, 6);
            }
            if (digits.length > 6) {
                formatted += " " + digits.slice(6, 10);
            }
            if (digits.length > 10) {
                formatted += " " + digits.slice(10, 14);
            }
            if (digits.length > 14) {
                formatted += " " + digits.slice(14, 18);
            }
            if (digits.length > 18) {
                formatted += " " + digits.slice(18, 22);
            }
            if (digits.length > 22) {
                formatted += " " + digits.slice(22, 24);
            }

            return formatted;
        };

        // Clean IBAN for API (no spaces) - TR + 24 digits = 26 chars
        const cleanIBAN = (input: string): string => {
            const clean = input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            // Ensure we return proper format: TR + up to 24 digits
            if (clean.startsWith("TR")) {
                return "TR" + clean.slice(2).replace(/\D/g, "").slice(0, 24);
            }
            return clean;
        };

        // Initialize display value from prop only on mount or when not focused
        useEffect(() => {
            if (isInitialMount.current) {
                isInitialMount.current = false;
                if (value && value.length > 2) {
                    setDisplayValue(formatIBAN(value));
                } else {
                    setDisplayValue("TR");
                }
            } else if (!isFocused && value && value.length > 2) {
                setDisplayValue(formatIBAN(value));
            }
        }, [value, isFocused]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;

            // Prevent deleting TR prefix
            if (input.length < 2) {
                setDisplayValue("TR");
                onChange("");
                return;
            }

            const formatted = formatIBAN(input);
            setDisplayValue(formatted);

            // Return clean IBAN (no spaces)
            const clean = cleanIBAN(formatted);
            onChange(clean);
        };

        const handleFocus = () => {
            setIsFocused(true);
            if (!displayValue || displayValue === "") {
                setDisplayValue("TR");
            }
        };

        const handleBlur = () => {
            setIsFocused(false);
        };

        const baseClasses =
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono tracking-wide";
        const errorClasses = hasError ? "border-red-500" : "border-gray-300";
        const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

        return (
            <input
                ref={ref}
                type="text"
                id={id}
                name={name}
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={36}
                className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            />
        );
    }
);

MaskedIBANInput.displayName = "MaskedIBANInput";

export default MaskedIBANInput;

