import * as Notifications from "expo-notifications";

// Foreground presentation — imported once (side-effect only) from app/_layout.tsx.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
