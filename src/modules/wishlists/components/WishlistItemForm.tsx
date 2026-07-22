import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import type { WishlistItemStatus, WishlistItemType } from "@/modules/wishlists/types";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { OptionButtonGroup } from "@/core/ui/OptionButtonGroup";

const TYPE_OPTIONS: { value: WishlistItemType; label: string }[] = [
  { value: "movie", label: "Movie" },
  { value: "tv", label: "TV" },
  { value: "book", label: "Book" },
  { value: "game", label: "Game" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: { value: WishlistItemStatus; label: string }[] = [
  { value: "want", label: "Want" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const RATING_OPTIONS = [0, 1, 2, 3, 4, 5];

export const wishlistItemFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["movie", "tv", "book", "game", "other"]),
  status: z.enum(["want", "in_progress", "done"]),
  rating: z.number().min(0).max(5),
  notes: z.string().optional(),
  url: z.string().optional(),
});

export type WishlistItemFormValues = z.infer<typeof wishlistItemFormSchema>;

export interface WishlistItemFormProps {
  defaultValues: WishlistItemFormValues;
  onSubmit: (values: WishlistItemFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function WishlistItemForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: WishlistItemFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WishlistItemFormValues>({ resolver: zodResolver(wishlistItemFormSchema), defaultValues });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            label="Title"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.title?.message}
            autoFocus
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Type</Text>
            <OptionButtonGroup options={TYPE_OPTIONS} value={field.value} onChange={field.onChange} wrap />
          </View>
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Status</Text>
            <OptionButtonGroup options={STATUS_OPTIONS} value={field.value} onChange={field.onChange} equalWidth />
          </View>
        )}
      />

      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Rating</Text>
            <OptionButtonGroup
              options={RATING_OPTIONS.map((value) => ({ value, label: value === 0 ? "—" : "★".repeat(value) }))}
              value={field.value}
              onChange={field.onChange}
              wrap
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="url"
        render={({ field }) => (
          <Input
            label="Link"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            autoCapitalize="none"
            keyboardType="url"
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Input label="Notes" value={field.value ?? ""} onChangeText={field.onChange} multiline numberOfLines={3} />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
