"use client";

import { BaseSyntheticEvent, useState } from "react";

export type fourDigitInputProp = {
  id?: string;
  onValueChanged: (value: string) => void;
};

export default function FourDigitInput({
  id,
  onValueChanged,
}: fourDigitInputProp) {
  const [filter, setFilter] = useState("");
  const handleChange = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    const regex1 = /^\d$/;
    const regex2 = /^\d{2}$/;
    const regex3 = /^\d{2}-$/;
    const regex4 = /^\d{2}-\d$/;
    const regex5 = /^\d{2}-\d{2}$/;
    const regex6 = /^\d{3}$/;
    const value = e.currentTarget.value;
    if (
      regex1.test(value) ||
      regex2.test(value) ||
      regex3.test(value) ||
      regex4.test(value) ||
      regex5.test(value) ||
      value === ""
    ) {
      setFilter(value);
      onValueChanged(value);
    } else if (regex6.test(value)) {
      setFilter(`${value.substring(0, 2)}-${value.substring(2, 3)}`);
      onValueChanged(`${value.substring(0, 2)}-${value.substring(2, 3)}`);
    }
  };
  return (
    <input
      id={id}
      className="w-full border border-neutral-200 rounded indent-1 pl-0"
      type="text"
      placeholder="예: 24-01"
      onChange={handleChange}
      maxLength={5}
      size={9}
      value={filter}
    />
  );
}
