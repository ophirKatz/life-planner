import { addDays, formatISO, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { Text } from "react-native";

import { TripForm } from "@/modules/travel/components/TripForm";
import { useCreateTrip } from "@/modules/travel/data/useTrips";

export function NewTripScreen() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const today = formatISO(startOfDay(new Date()), { representation: "date" });
  const inAWeek = formatISO(addDays(startOfDay(new Date()), 7), { representation: "date" });

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New trip</Text>
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
    </>
  );
}
