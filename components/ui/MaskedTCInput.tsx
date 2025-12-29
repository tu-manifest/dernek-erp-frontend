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
 * Turkish T.C. Kimlik No input - plain 11 digit format
 */
const MaskedTCInput = forwardRef<HTMLInputElement, MaskedTCInputProps>(
    (
        {
            value,
            onChange,
            className = "",
            placeholder = "T.C. Kimlik Numarası",
            hasError = false,
            disabled = false,
            id,
            name,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState("");

        // Clean TC - only allow digits, max 11
        const cleanTC = (input: string): string => {
            return input.replace(/\D/g, "").slice(0, 11);
        };

        // Update display when value prop changes
        useEffect(() => {
            if (value) {
                setDisplayValue(cleanTC(value));
            } else {
                setDisplayValue("");
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;
            const cleaned = cleanTC(input);
            setDisplayValue(cleaned);
            onChange(cleaned);
        };

        const baseClasses =
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
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
                maxLength={11}
                inputMode="numeric"
                pattern="[0-9]*"
                className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            />
        );
    }
);

MaskedTCInput.displayName = "MaskedTCInput";

export default MaskedTCInput;
