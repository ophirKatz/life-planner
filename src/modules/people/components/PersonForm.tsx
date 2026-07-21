import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";

export const personFormSchema = z.object({
  display_name: z.string().min(1, "Name is required"),
  nickname: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

export interface PersonFormProps {
  defaultValues: PersonFormValues;
  onSubmit: (values: PersonFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function PersonForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: PersonFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonFormValues>({ resolver: zodResolver(personFormSchema), defaultValues });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="display_name"
        render={({ field }) => (
          <Input
            label="Name"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.display_name?.message}
            autoFocus
          />
        )}
      />
      <Controller
        control={control}
        name="nickname"
        render={({ field }) => (
          <Input label="Nickname" value={field.value ?? ""} onChangeText={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <Input
            label="Phone"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            keyboardType="phone-pad"
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Input
            label="Notes"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
