"use client";

import React, { forwardRef, useState, useEffect } from "react";

interface MaskedEmailInputProps {
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
 * Email input with validation feedback and auto-lowercase
 */
const MaskedEmailInput = forwardRef<HTMLInputElement, MaskedEmailInputProps>(
    (
        {
            value,
            onChange,
            className = "",
            placeholder = "ornek@email.com",
            hasError = false,
            disabled = false,
            id,
            name,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState("");
        const [isValid, setIsValid] = useState<boolean | null>(null);

        // Basic email validation
        const validateEmail = (email: string): boolean => {
            if (!email) return false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        // Update display when value prop changes
        useEffect(() => {
            if (value) {
                setDisplayValue(value.toLowerCase());
                setIsValid(validateEmail(value));
            } else {
                setDisplayValue("");
                setIsValid(null);
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let input = e.target.value;

            // Remove spaces
            input = input.replace(/\s/g, "");

            // Convert to lowercase
            input = input.toLowerCase();

            setDisplayValue(input);
            onChange(input);

            // Validate as user types (only after @ is entered)
            if (input.includes("@")) {
                setIsValid(validateEmail(input));
            } else {
                setIsValid(null);
            }
        };

        const handleBlur = () => {
            if (displayValue) {
                setIsValid(validateEmail(displayValue));
            }
        };

        const baseClasses =
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

        let borderClass = "border-gray-300";
        if (hasError) {
            borderClass = "border-red-500";
        } else if (isValid === true && displayValue) {
            borderClass = "border-green-500";
        } else if (isValid === false && displayValue) {
            borderClass = "border-orange-400";
        }

        const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

        return (
            <div className="relative">
                <input
                    ref={ref}
                    type="email"
                    id={id}
                    name={name}
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="email"
                    className={`${baseClasses} ${borderClass} ${disabledClasses} ${className} pr-10`}
                />
                {displayValue && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {isValid === true && (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {isValid === false && (
                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </span>
                )}
            </div>
        );
    }
);

MaskedEmailInput.displayName = "MaskedEmailInput";

export default MaskedEmailInput;
