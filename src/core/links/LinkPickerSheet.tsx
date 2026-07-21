import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import { Input } from "@/core/ui/Input";
import { ListItem } from "@/core/ui/ListItem";
import { Sheet, SheetContent } from "@/core/ui/Sheet";

export interface LinkPickerOption {
  id: string;
  title: string;
  subtitle?: string;
}

export interface LinkPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: LinkPickerOption[];
  onSelect: (id: string) => void;
}

export function LinkPickerSheet({ open, onOpenChange, title, options, onSelect }: LinkPickerSheetProps) {
  const [query, setQuery] = useState("");
  const filtered = options.filter((o) => o.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <Text className="text-lg font-semibold text-foreground text-center mb-3">{title}</Text>
        <Input value={query} onChangeText={setQuery} placeholder="Search…" autoFocus />

        {filtered.length === 0 ? (
          <Text className="text-sm text-muted-foreground text-center py-6">No matches.</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 320, marginTop: 12 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => (
              <ListItem
                title={item.title}
                subtitle={item.subtitle}
                onPress={() => {
                  onSelect(item.id);
                  onOpenChange(false);
                  setQuery("");
                }}
              />
            )}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
