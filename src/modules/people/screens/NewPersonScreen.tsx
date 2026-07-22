import { useRouter } from "expo-router";
import { Text } from "react-native";

import { PersonForm } from "@/modules/people/components/PersonForm";
import { useCreatePerson } from "@/modules/people/data/usePeople";

export function NewPersonScreen() {
  const router = useRouter();
  const createPerson = useCreatePerson();

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New contact</Text>
      <PersonForm
        submitLabel="Create contact"
        isSubmitting={createPerson.isPending}
        defaultValues={{ display_name: "", nickname: "", email: "", phone: "", notes: "" }}
        onSubmit={(values) => {
          createPerson.mutate(
            {
              display_name: values.display_name,
              nickname: values.nickname || null,
              emails: values.email ? [values.email] : [],
              phones: values.phone ? [values.phone] : [],
              notes: values.notes || null,
            },
            { onSuccess: () => router.back() }
          );
        }}
      />
    </>
  );
}
