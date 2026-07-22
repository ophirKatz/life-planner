import { useRouter } from "expo-router";
import { AlertTriangle, Calendar, ListTodo } from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinkEntityButton } from "@/core/links/LinkEntityButton";
import { LinkedItemsSection } from "@/core/links/LinkedItemsSection";
import { InteractionsSection } from "@/modules/people/components/InteractionsSection";
import { PersonForm } from "@/modules/people/components/PersonForm";
import { PersonSummaryCard } from "@/modules/people/components/PersonSummaryCard";
import { useDeletePerson, usePerson, useUpdatePerson } from "@/modules/people/data/usePeople";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

export function PersonDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: person, isLoading, isError } = usePerson(id);
  const updatePerson = useUpdatePerson();
  const deletePerson = useDeletePerson();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !person) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Contact not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <PersonForm
          submitLabel="Save changes"
          isSubmitting={updatePerson.isPending}
          defaultValues={{
            display_name: person.display_name,
            nickname: person.nickname ?? "",
            email: person.emails[0] ?? "",
            phone: person.phones[0] ?? "",
            notes: person.notes ?? "",
          }}
          onSubmit={(values) => {
            updatePerson.mutate({
              id: person.id,
              patch: {
                display_name: values.display_name,
                nickname: values.nickname || null,
                emails: values.email ? [values.email] : [],
                phones: values.phone ? [values.phone] : [],
                notes: values.notes || null,
              },
            });
          }}
        />

        <View className="flex-row flex-wrap gap-2">
          <LinkEntityButton
            label="Link a task"
            icon={ListTodo}
            pickerTitle="Link a task"
            sourceType="person"
            sourceId={person.id}
            targetType="task"
            relType="related"
          />
          <LinkEntityButton
            label="Link an event"
            icon={Calendar}
            pickerTitle="Link an event"
            sourceType="person"
            sourceId={person.id}
            targetType="calendar_event"
            relType="attendee"
          />
        </View>

        <LinkedItemsSection entityType="person" entityId={person.id} />

        <PersonSummaryCard personId={person.id} />

        <InteractionsSection personId={person.id} />

        <Button
          label="Delete contact"
          variant="destructive"
          isLoading={deletePerson.isPending}
          onPress={() => deletePerson.mutate(person.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
