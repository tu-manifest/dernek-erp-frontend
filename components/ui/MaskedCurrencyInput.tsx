"use client";

import React, { forwardRef, useState, useEffect, useRef } from "react";

interface MaskedCurrencyInputProps {
    value: string | number;
    onChange: (value: string) => void;
    currency?: string;
    className?: string;
    placeholder?: string;
    hasError?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    min?: number;
}

/**
 * Currency input with format: 1.000,00 TL (Turkish format)
 * Returns clean numeric string for API
 */
const MaskedCurrencyInput = forwardRef<HTMLInputElement, MaskedCurrencyInputProps>(
    (
        {
            value,
            onChange,
            currency = "₺",
            className = "",
            placeholder = "0,00",
            hasError = false,
            disabled = false,
            id,
            name,
            min = 0,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState("");
        const [isFocused, setIsFocused] = useState(false);
        const isInitialMount = useRef(true);

        // Format number for display: 1.234,56
        const formatCurrency = (input: string | number): string => {
            // Convert to string and handle empty
            let numStr = String(input).replace(/[^\d.,]/g, "");

            if (!numStr || numStr === "") return "";

            // Replace comma with dot for parsing
            numStr = numStr.replace(",", ".");

            // Parse as float
            const num = parseFloat(numStr);

            if (isNaN(num)) return "";

            // Format with Turkish locale (1.234,56)
            return num.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        // Parse display value to clean number string for API
        const parseToNumber = (input: string): string => {
            if (!input || input === "") return "";

            // Remove all dots (thousand separators) and replace comma with dot
            const clean = input.replace(/\./g, "").replace(",", ".");
            const num = parseFloat(clean);

            if (isNaN(num)) return "";

            return num.toFixed(2);
        };

        // Initialize display value from prop only on mount or when not focused
        useEffect(() => {
            if (isInitialMount.current) {
                isInitialMount.current = false;
                if (value !== undefined && value !== "" && value !== null) {
                    setDisplayValue(formatCurrency(value));
                }
            } else if (!isFocused && value !== undefined && value !== "" && value !== null) {
                // Only update from prop when not focused (external update)
                const formattedValue = formatCurrency(value);
                setDisplayValue(formattedValue);
            }
        }, [value, isFocused]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let input = e.target.value;

            // Remove currency suffix if user somehow types it
            input = input.replace(/\s*(TL|USD|EUR|₺|\$|€)\s*/gi, "").trim();

            // Only allow digits, comma, and dot
            input = input.replace(/[^\d.,]/g, "");

            // Handle multiple dots/commas - keep only the last one as decimal
            const parts = input.split(/[.,]/);
            if (parts.length > 2) {
                input = parts.slice(0, -1).join("") + "," + parts[parts.length - 1];
            }

            // Limit decimal places to 2
            const decimalMatch = input.match(/[,.](\d*)/);
            if (decimalMatch && decimalMatch[1].length > 2) {
                const beforeDecimal = input.split(/[,.]/)[0];
                input = beforeDecimal + "," + decimalMatch[1].slice(0, 2);
            }

            setDisplayValue(input);

            // Only call onChange with parsed value if there's something to parse
            const numericValue = parseToNumber(input);
            onChange(numericValue);
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        const handleBlur = () => {
            setIsFocused(false);

            // Format on blur
            if (displayValue && displayValue.trim() !== "") {
                const formatted = formatCurrency(displayValue);
                setDisplayValue(formatted);
            }
        };

        const baseClasses =
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right";
        const errorClasses = hasError ? "border-red-500" : "border-gray-300";
        const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

        return (
            <div className="relative">
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
                    className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className} pr-12`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                    {currency}
                </span>
            </div>
        );
    }
);

MaskedCurrencyInput.displayName = "MaskedCurrencyInput";

export default MaskedCurrencyInput;

