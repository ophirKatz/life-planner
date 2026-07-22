import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import { useBudgetCategories, useCreateBudgetCategory } from "@/modules/budget/data/useBudgetCategories";
import type { TransactionType } from "@/modules/budget/types";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/Select";
import { Sheet, SheetContent, SheetTrigger } from "@/core/ui/Sheet";

function NewCategorySheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createCategory = useCreateBudgetCategory();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button label="New category" size="sm" variant="secondary" />
      </SheetTrigger>
      <SheetContent>
        <Text className="text-lg font-semibold text-foreground text-center">New budget category</Text>
        <Input value={name} onChangeText={setName} placeholder="e.g. Groceries" autoFocus />
        <Button
          label="Create"
          isLoading={createCategory.isPending}
          disabled={!name.trim()}
          onPress={() =>
            createCategory.mutate(
              { name: name.trim(), monthly_limit: null },
              { onSuccess: () => { setName(""); setOpen(false); } }
            )
          }
        />
      </SheetContent>
    </Sheet>
  );
}

export const transactionFormSchema = z.object({
  amount: z.number().positive("Enter an amount"),
  type: z.enum(["income", "expense"]),
  category_id: z.string().nullable(),
  occurred_at: z.string(),
  note: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export interface TransactionFormProps {
  defaultValues: TransactionFormValues;
  onSubmit: (values: TransactionFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function TransactionForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: TransactionFormProps) {
  const { data: categories } = useBudgetCategories();
  const { control, handleSubmit, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View className="flex-row gap-2">
            {(["expense", "income"] as TransactionType[]).map((type) => (
              <Button
                key={type}
                label={type === "expense" ? "Expense" : "Income"}
                size="sm"
                variant={field.value === type ? "default" : "secondary"}
                className="flex-1"
                onPress={() => field.onChange(type)}
              />
            ))}
          </View>
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <Input
            label="Amount"
            value={field.value ? String(field.value) : ""}
            onChangeText={(text) => field.onChange(text ? Number(text.replace(/[^0-9.]/g, "")) : 0)}
            keyboardType="decimal-pad"
            error={errors.amount?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="occurred_at"
        render={({ field }) => {
          const today = formatISO(startOfDay(new Date()), { representation: "date" });
          const yesterday = formatISO(startOfDay(subDays(new Date(), 1)), { representation: "date" });
          return (
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Date</Text>
              <View className="flex-row gap-2">
                <Button
                  label="Today"
                  size="sm"
                  variant={field.value === today ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(today)}
                />
                <Button
                  label="Yesterday"
                  size="sm"
                  variant={field.value === yesterday ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(yesterday)}
                />
              </View>
            </View>
          );
        }}
      />

      <Controller
        control={control}
        name="category_id"
        render={({ field }) => {
          const selected = categories?.find((c) => c.id === field.value);
          return (
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">Category</Text>
                <NewCategorySheet />
              </View>
              <Select
                value={selected ? { value: selected.id, label: selected.name } : undefined}
                onValueChange={(option) => field.onChange(option?.value ?? null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((category) => (
                    <SelectItem key={category.id} label={category.name} value={category.id} />
                  ))}
                </SelectContent>
              </Select>
            </View>
          );
        }}
      />

      <Controller
        control={control}
        name="note"
        render={({ field }) => (
          <Input label="Note" value={field.value ?? ""} onChangeText={field.onChange} />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
