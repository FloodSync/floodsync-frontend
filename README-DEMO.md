# Demo Mode Configuration

This app supports a demo mode for testing and demonstrations without requiring real API data.

## How to Enable Demo Mode

### Option 1: Environment Variable (Recommended)

Create a `.env` file in the root directory and add:

```env
EXPO_PUBLIC_DEMO_MODE=true
```

### Option 2: Direct Configuration

Edit `lib/config/app-config.ts` and set:

```typescript
DEMO_MODE: true,  // Change from false to true
```

## Demo Data Configuration

You can customize the demo data in `lib/config/app-config.ts`:

```typescript
DEMO_DATA: {
  // Flood risk (set to > 70 to test notifications)
  floodRisk: 75,

  // Weather data
  weather: {
    temperature: 28,
    feelsLike: 26,
    condition: "Partly Cloudy",
    // ... more fields
  },

  // Precipitation data
  precipitation: {
    lastHour: 0.2,
    last24Hours: 1.5,
    next24HoursForecast: 3.2,
  },

  // Location
  location: "Yangon, Hlaing",
}
```

## Testing Notifications

To test push notifications:

1. Enable demo mode
2. Set `floodRisk` to a value > 70 (e.g., 75, 80, 90)
3. The app will automatically trigger a notification when the risk exceeds 70%

## Switching Back to Real Data

To use real API data:

1. Set `EXPO_PUBLIC_DEMO_MODE=false` in `.env`, or
2. Set `DEMO_MODE: false` in `lib/config/app-config.ts`

## Notes

- When demo mode is enabled, all API calls are bypassed
- Notifications will work in demo mode if flood risk > 70%
- The app will show demo data immediately without waiting for API responses
