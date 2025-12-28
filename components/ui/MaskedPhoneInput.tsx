"use client";

import React, { forwardRef, useState, useEffect } from "react";

interface MaskedPhoneInputProps {
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
 * Turkish phone number input with mask: +90 5XX XXX XX XX
 */
const MaskedPhoneInput = forwardRef<HTMLInputElement, MaskedPhoneInputProps>(
    (
        {
            value,
            onChange,
            className = "",
            placeholder = "+90 5XX XXX XX XX",
            hasError = false,
            disabled = false,
            id,
            name,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState("");

        // Format phone number for display
        const formatPhone = (input: string): string => {
            // Remove all non-digits
            let digits = input.replace(/\D/g, "");

            // Remove leading 90 if present (we'll add +90 prefix)
            if (digits.startsWith("90")) {
                digits = digits.slice(2);
            }

            // Limit to 10 digits (excluding country code)
            digits = digits.slice(0, 10);

            // Build formatted string
            let formatted = "+90";
            if (digits.length > 0) {
                formatted += " " + digits.slice(0, 3);
            }
            if (digits.length > 3) {
                formatted += " " + digits.slice(3, 6);
            }
            if (digits.length > 6) {
                formatted += " " + digits.slice(6, 8);
            }
            if (digits.length > 8) {
                formatted += " " + digits.slice(8, 10);
            }

            return formatted;
        };

        // Clean phone for API (returns +90 XXX XXX XX XX format)
        const cleanPhone = (input: string): string => {
            const digits = input.replace(/\D/g, "");
            if (digits.length === 0) return "";

            // Build clean format with +90 prefix
            let clean = "+90";
            const localDigits = digits.startsWith("90") ? digits.slice(2) : digits;

            if (localDigits.length > 0) clean += " " + localDigits.slice(0, 3);
            if (localDigits.length > 3) clean += " " + localDigits.slice(3, 6);
            if (localDigits.length > 6) clean += " " + localDigits.slice(6, 8);
            if (localDigits.length > 8) clean += " " + localDigits.slice(8, 10);

            return clean;
        };

        // Update display when value prop changes
        useEffect(() => {
            if (value) {
                setDisplayValue(formatPhone(value));
            } else {
                setDisplayValue("+90");
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;

            // Prevent deleting +90 prefix
            if (input.length < 3) {
                setDisplayValue("+90");
                onChange("");
                return;
            }

            const formatted = formatPhone(input);
            setDisplayValue(formatted);
            onChange(cleanPhone(input));
        };

        const handleFocus = () => {
            if (!displayValue || displayValue === "") {
                setDisplayValue("+90");
            }
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
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            />
        );
    }
);

MaskedPhoneInput.displayName = "MaskedPhoneInput";

export default MaskedPhoneInput;
