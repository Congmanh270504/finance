"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerSimpleProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    label?: string;
    id?: string;
    className?: string;
}

export function DatePickerSimple({
    value,
    onChange,
    label = "Date",
    id = "date-picker-simple",
    className,
}: DatePickerSimpleProps) {
    return (
        <Field className="w-full gap-0">
            <FieldLabel htmlFor={id} className={`mb-0.75 ${className || ""}`}>
                {label}
            </FieldLabel>
            <Popover>
                <PopoverTrigger
                    asChild
                    className="border-blue-200 bg-blue-50/30 focus-visible:border-blue-600 focus-visible:ring-blue-500/30"
                >
                    <Button
                        variant="outline"
                        id={id}
                        className="w-full justify-start px-2.5 font-normal hover:bg-transparent"
                    >
                        <CalendarIcon />
                        {value ? (
                            format(value, "MMM d, yyyy")
                        ) : (
                            <span>Select date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        defaultMonth={value}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    );
}
