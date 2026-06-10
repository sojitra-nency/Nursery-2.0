"use client";

import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { set, unset, type ArrayOfPrimitivesInputProps } from "sanity";
import { Box, Button, Card, Checkbox, Flex, Stack, Text, TextInput } from "@sanity/ui";

/**
 * Custom input for an array of strings. Shows checkboxes for a predefined option
 * list (passed via `options.list`) plus a text box to add custom values. Stores
 * plain strings — no documents to manage. Powers both Categories and Bag Sizes.
 */
export function CheckboxListWithAdd(props: ArrayOfPrimitivesInputProps) {
  const { value, onChange, schemaType } = props;
  const selected = useMemo<string[]>(
    () => (Array.isArray(value) ? (value.filter((v) => typeof v === "string") as string[]) : []),
    [value]
  );
  const [draft, setDraft] = useState("");

  const presets = useMemo<string[]>(() => {
    const list = (schemaType.options as { list?: unknown })?.list;
    if (!Array.isArray(list)) return [];
    return list.map((item) =>
      typeof item === "string" ? item : (item as { value: string }).value
    );
  }, [schemaType.options]);

  // Predefined options first, then any custom values already selected.
  const options = useMemo(() => {
    const extras = selected.filter((s) => !presets.includes(s));
    return [...presets, ...extras];
  }, [presets, selected]);

  const commit = (next: string[]) => {
    onChange(next.length ? set(next) : unset());
  };

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      commit(selected.filter((s) => s !== option));
    } else {
      commit([...selected, option]);
    }
  };

  const addCustom = () => {
    const trimmed = draft.trim();
    if (!trimmed || selected.includes(trimmed)) {
      setDraft("");
      return;
    }
    commit([...selected, trimmed]);
    setDraft("");
  };

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} shadow={1}>
        <Stack space={3}>
          {options.map((option) => (
            <Flex key={option} align="center" gap={2} as="label" style={{ cursor: "pointer" }}>
              <Checkbox checked={selected.includes(option)} onChange={() => toggle(option)} />
              <Box flex={1}>
                <Text size={1}>{option}</Text>
              </Box>
            </Flex>
          ))}
          {options.length === 0 && (
            <Text size={1} muted>
              No options yet — add one below.
            </Text>
          )}
        </Stack>
      </Card>
      <Flex gap={2}>
        <Box flex={1}>
          <TextInput
            value={draft}
            placeholder="Add custom value…"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.currentTarget.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            fontSize={1}
          />
        </Box>
        <Button
          text="Add"
          mode="ghost"
          tone="primary"
          onClick={addCustom}
          fontSize={1}
          padding={2}
        />
      </Flex>
    </Stack>
  );
}
