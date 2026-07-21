import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PersonForm } from "@/modules/people/components/PersonForm";
import { useCreatePerson } from "@/modules/people/data/usePeople";

export function NewPersonScreen() {
  const router = useRouter();
  const createPerson = useCreatePerson();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New contact</Text>
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
      </View>
    </SafeAreaView>
  );
}
