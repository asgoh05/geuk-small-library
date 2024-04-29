"use client";

import { BaseSyntheticEvent, useState } from "react";
import { NativeSelect } from "@mui/material";

export type BookIdInputProp = {
  id?: string;
  onValueChanged: (value: string) => void;
};

export default function BookIdInput({ id, onValueChanged }: BookIdInputProp) {
  const [filter, setFilter] = useState("");
  const [type, setType] = useState("BOOK");

  const typeChanged = (e: BaseSyntheticEvent) => {
    const value = e.target.value;
    if (value === "BOOK") {
      setType("BOOK");
      onValueChanged(`GEUK_BOOK_${filter}`);
    } else if (value === "job") {
      setType("직무");
      onValueChanged(`GEUK_직무_${filter}`);
    } else throw new Error("unknown type");
  };
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
      onValueChanged(`GEUK_${type}_${value}`);
    } else if (regex6.test(value)) {
      const id = `${value.substring(0, 2)}-${value.substring(2, 3)}`;
      setFilter(id);
      onValueChanged(`GEUK_${type}_${id}`);
    }
  };
  return (
    <div className="flex justify-end items-end">
      <p className=" text-neutral-600 text-end text-lg">GEUK_</p>
      <NativeSelect
        sx={{ width: 1, fontSize: "0.9rem" }}
        onChange={typeChanged}
        defaultValue={type}
      >
        <option value="BOOK">BOOK</option>
        <option value="job">직무</option>
      </NativeSelect>
      <p className="items-baseline text-neutral-600 text-lg">_</p>
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
    </div>
  );
}
