import { useRouter } from "expo-router";
import { CloudSun } from "lucide-react-native";
import { Text, View } from "react-native";

import { useCurrentWeather } from "@/modules/weather/data/useCurrentWeather";
import { useWeatherSettings } from "@/modules/weather/data/useWeatherSettings";
import { describeWeatherCode } from "@/modules/weather/weatherCodes";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function WeatherWidget() {
  const router = useRouter();
  const { data: settings, isLoading: settingsLoading } = useWeatherSettings();
  const { data: weather, isLoading: weatherLoading } = useCurrentWeather(!!settings);
  const colors = useThemeColors();

  const isLoading = settingsLoading || (!!settings && weatherLoading);

  return (
    <PressableCard onPress={() => router.push("/modules/weather")}>
      <View className="flex-row items-center gap-2 mb-3">
        <CloudSun size={18} color={colors.accent} />
        <CardTitle>Weather</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : !settings ? (
        <Text className="text-sm text-muted-foreground">Set your location to see the forecast.</Text>
      ) : !weather ? (
        <Text className="text-sm text-muted-foreground">Forecast unavailable.</Text>
      ) : (
        <View className="flex-row items-center gap-2">
          {(() => {
            const { label, icon: Icon } = describeWeatherCode(weather.weatherCode);
            return (
              <>
                <Icon size={20} color={colors.accent} />
                <Text className="text-sm text-foreground flex-1" numberOfLines={1}>
                  {weather.temperature}° · {label} · {weather.location}
                </Text>
              </>
            );
          })()}
        </View>
      )}
    </PressableCard>
  );
}
