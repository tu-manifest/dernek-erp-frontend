"use client";

import React, { forwardRef, useState, useEffect } from "react";

interface MaskedTCInputProps {
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
 * Turkish T.C. Kimlik No input with mask: XXX XXX XXX XX (11 digits)
 */
const MaskedTCInput = forwardRef<HTMLInputElement, MaskedTCInputProps>(
    (
        {
            value,
            onChange,
            className = "",
            placeholder = "XXX XXX XXX XX",
            hasError = false,
            disabled = false,
            id,
            name,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState("");

        // Format TC for display: XXX XXX XXX XX
        const formatTC = (input: string): string => {
            // Remove all non-digits
            const digits = input.replace(/\D/g, "").slice(0, 11);

            // Build formatted string
            let formatted = "";
            if (digits.length > 0) {
                formatted = digits.slice(0, 3);
            }
            if (digits.length > 3) {
                formatted += " " + digits.slice(3, 6);
            }
            if (digits.length > 6) {
                formatted += " " + digits.slice(6, 9);
            }
            if (digits.length > 9) {
                formatted += " " + digits.slice(9, 11);
            }

            return formatted;
        };

        // Clean TC for API (only digits)
        const cleanTC = (input: string): string => {
            return input.replace(/\D/g, "").slice(0, 11);
        };

        // Update display when value prop changes
        useEffect(() => {
            if (value) {
                setDisplayValue(formatTC(value));
            } else {
                setDisplayValue("");
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;
            const formatted = formatTC(input);
            setDisplayValue(formatted);
            onChange(cleanTC(input));
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
                placeholder={placeholder}
                disabled={disabled}
                maxLength={14}
                className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            />
        );
    }
);

MaskedTCInput.displayName = "MaskedTCInput";

export default MaskedTCInput;
