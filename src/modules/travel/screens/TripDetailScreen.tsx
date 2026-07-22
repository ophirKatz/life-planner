import { format } from "date-fns";
import { useRouter } from "expo-router";
import { AlertTriangle, Users } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinkEntityButton } from "@/core/links/LinkEntityButton";
import { LinkedItemsSection } from "@/core/links/LinkedItemsSection";
import { TripItemsSection } from "@/modules/travel/components/TripItemsSection";
import { useDeleteTrip, useTrip } from "@/modules/travel/data/useTrips";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { EmptyState } from "@/core/ui/EmptyState";

export function TripDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: trip, isLoading, isError } = useTrip(id);
  const deleteTrip = useDeleteTrip();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !trip) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Trip not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <Card className="gap-1">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: trip.color }} />
            <Text className="text-lg font-semibold text-foreground">{trip.name}</Text>
          </View>
          {trip.destination ? <Text className="text-sm text-muted-foreground">{trip.destination}</Text> : null}
          <Text className="text-sm text-muted-foreground">
            {format(new Date(trip.start_date), "MMM d")} – {format(new Date(trip.end_date), "MMM d, yyyy")}
          </Text>
          {trip.notes ? <Text className="text-sm text-foreground mt-2">{trip.notes}</Text> : null}
        </Card>

        <LinkEntityButton
          label="Add a companion"
          icon={Users}
          pickerTitle="Add a travel companion"
          sourceType="trip"
          sourceId={trip.id}
          targetType="person"
          relType="related"
        />
        <LinkedItemsSection entityType="trip" entityId={trip.id} />

        <TripItemsSection tripId={trip.id} type="itinerary" label="Itinerary" placeholder="e.g. Day 1: Arrive, check in" />
        <TripItemsSection tripId={trip.id} type="packing" label="Packing list" placeholder="e.g. Passport" showCheckbox />
        <TripItemsSection tripId={trip.id} type="document" label="Documents" placeholder="e.g. Hotel confirmation #1234" />
        <TripItemsSection tripId={trip.id} type="note" label="Notes" placeholder="Add a note" />

        <Button
          label="Delete trip"
          variant="destructive"
          isLoading={deleteTrip.isPending}
          onPress={() => deleteTrip.mutate(trip.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
