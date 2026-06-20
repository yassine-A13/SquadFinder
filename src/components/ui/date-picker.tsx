"use client";

import { Input } from "@/components/ui/input";

type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
};

export function DatePicker({ value = "", onChange, name, disabled }: DatePickerProps) {
  return (
    <Input
      disabled={disabled}
      name={name}
      onChange={(event) => onChange?.(event.target.value)}
      type="date"
      value={value}
    />
  );
}
