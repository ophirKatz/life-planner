import { addDays, formatISO, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TripForm } from "@/modules/travel/components/TripForm";
import { useCreateTrip } from "@/modules/travel/data/useTrips";

export function NewTripScreen() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const today = formatISO(startOfDay(new Date()), { representation: "date" });
  const inAWeek = formatISO(addDays(startOfDay(new Date()), 7), { representation: "date" });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New trip</Text>
        <TripForm
          submitLabel="Create trip"
          isSubmitting={createTrip.isPending}
          defaultValues={{
            name: "",
            destination: "",
            start_date: today,
            end_date: inAWeek,
            notes: "",
            color: "#6366f1",
          }}
          onSubmit={(values) => {
            createTrip.mutate(
              {
                name: values.name,
                destination: values.destination || null,
                start_date: values.start_date,
                end_date: values.end_date,
                notes: values.notes || null,
                color: values.color,
              },
              { onSuccess: (trip) => router.replace(`/modules/travel/${trip.id}`) }
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
