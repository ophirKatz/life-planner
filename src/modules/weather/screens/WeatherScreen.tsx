import { MapPin } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCurrentWeather } from "@/modules/weather/data/useCurrentWeather";
import { useSearchWeatherLocation, useSetWeatherLocation, useWeatherSettings } from "@/modules/weather/data/useWeatherSettings";
import type { LocationCandidate } from "@/modules/weather/types";
import { describeWeatherCode } from "@/modules/weather/weatherCodes";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { Input } from "@/core/ui/Input";
import { ListItem } from "@/core/ui/ListItem";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

function CurrentConditions() {
  const { data: settings } = useWeatherSettings();
  const { data: weather, isLoading, isError } = useCurrentWeather(!!settings);
  const colors = useThemeColors();

  if (!settings) return null;
  if (isLoading) return <ActivityIndicator className="my-4" />;
  if (isError || !weather) {
    return <Text className="text-sm text-danger">Could not load the forecast. Try again later.</Text>;
  }

  const { label, icon: Icon } = describeWeatherCode(weather.weatherCode);

  return (
    <Card className="items-center gap-2 py-6">
      <Icon size={40} color={colors.accent} />
      <Text className="text-3xl font-bold text-foreground">{weather.temperature}°</Text>
      <Text className="text-base text-muted-foreground">
        {label} · {weather.location}
      </Text>
      <Text className="text-sm text-muted-foreground">
        H:{weather.high}° L:{weather.low}° · Wind {weather.windSpeed} km/h
      </Text>
    </Card>
  );
}

export function WeatherScreen() {
  const { data: settings } = useWeatherSettings();
  const setLocation = useSetWeatherLocation();
  const search = useSearchWeatherLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationCandidate[]>([]);

  const runSearch = () => {
    if (query.trim().length < 2) return;
    search.mutate(query.trim(), { onSuccess: setResults });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <Text className="text-2xl font-semibold text-foreground">Weather</Text>

        <CurrentConditions />

        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {settings ? "Change location" : "Set your location"}
          </Text>
          <View className="flex-row items-center gap-2">
            <Input
              containerClassName="flex-1"
              value={query}
              onChangeText={setQuery}
              placeholder="Search for a city…"
              onSubmitEditing={runSearch}
              returnKeyType="search"
            />
            <Button label="Search" size="sm" onPress={runSearch} isLoading={search.isPending} />
          </View>

          {results.length > 0 ? (
            <View className="gap-2 mt-1">
              {results.map((result) => (
                <ListItem
                  key={`${result.lat},${result.lng}`}
                  title={result.label}
                  icon={MapPin}
                  onPress={() =>
                    setLocation.mutate(result, {
                      onSuccess: () => {
                        setResults([]);
                        setQuery("");
                      },
                    })
                  }
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
