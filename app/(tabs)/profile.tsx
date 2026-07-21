import { useRouter } from "expo-router";
import { Link2, Moon, Sun, SunMoon } from "lucide-react-native";
import { Text, View } from "react-native";

import { useSession } from "@/core/auth/session";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { cn } from "@/core/ui/lib/utils";
import { ListItem } from "@/core/ui/ListItem";
import { useTheme, type ThemePreference } from "@/core/ui/theme/useTheme";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: SunMoon },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useSession();
  const { active, setPreference } = useTheme();

  return (
    <View className="flex-1 bg-bg px-6 pt-20 gap-6">
      <View>
        <Text className="text-2xl font-semibold text-foreground mb-1">Profile</Text>
        <Text className="text-base text-muted-foreground">{session?.user.email}</Text>
      </View>

      <Card>
        <Text className="text-sm font-medium text-muted-foreground mb-3">Appearance</Text>
        <View className="flex-row gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isActive = active === value;
            return (
              <Button
                key={value}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                className="flex-1"
                onPress={() => setPreference(value)}
              >
                <Icon size={16} color={isActive ? "white" : undefined} />
                <Text className={cn("text-sm font-medium", isActive ? "text-accent-foreground" : "text-foreground")}>
                  {label}
                </Text>
              </Button>
            );
          })}
        </View>
      </Card>

      <ListItem
        title="Integrations"
        subtitle="Connect Google Calendar"
        icon={Link2}
        showChevron
        onPress={() => router.push("/integrations")}
      />

      <Button label="Sign out" variant="secondary" onPress={signOut} className="mt-auto mb-10" />
    </View>
  );
}
