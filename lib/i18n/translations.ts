export type Language = "en" | "my";

export const translations = {
  en: {
    // Common
    login: "Login",
    register: "Register",
    location: "Location",
    profile: "Profile",

    // Home Screen
    floodRiskLevel: "Flood Risk Level",
    highFloodRiskAlert: "High Flood Risk Alert",
    highFloodRiskMessage:
      "Your current location has high chance of flooding. Please stay alert.",

    // Weather
    currentWeatherConditions: "Current Weather Conditions",
    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    visibility: "Visibility",
    pressure: "Pressure",
    rain: "Rain",
    uvIndex: "UV Index",
    dewPoint: "Dew Point",
    cloudCover: "Cloud Cover",
    airQuality: "Air Quality",
    sunrise: "Sunrise",
    sunset: "Sunset",
    moonPhase: "Moon Phase",

    // Precipitation Analysis
    rainInformation: "Rain Information",
    rainDescription: "How much it rained and will rain",
    lastHour: "Last Hour",
    last24Hours: "Last 24 Hours",
    next24Hours: "Next 24 Hours",
    lightRain: "Light Rain",
    mediumRain: "Medium Rain",
    heavyRain: "Heavy Rain",
    lessThan: "Less than",
    to: "to",
    moreThan: "More than",
    inches: "inches",

    // Flood Risk
    floodDanger: "Flood Danger",
    floodDangerDescription: "How safe you are right now",
    lowRisk: "LOW",
    moderateRisk: "MODERATE",
    highRisk: "HIGH",
    severeRisk: "SEVERE",
    risk: "RISK",
    basedOnForecast: "Based on current weather and tomorrow's forecast",
    groundWater: "Ground Water",
    riverWater: "River Water",
    drainage: "Drainage",
    normal: "Normal",
    rising: "Rising",
    high: "High",
    nearCapacity: "Near Capacity",
    atCapacity: "At Capacity",
    importantNotice: "Important Notice",
    monitorConditions:
      "Monitor conditions closely. Avoid low-lying areas and be prepared for possible evacuation.",

    // Map
    interactiveMap: "Interactive Map",
    viewAlerts: "View real-time flood alerts and community reports",
    activeAlerts: "Active Alerts",
    waterLevel: "Water Level",

    // Notifications
    notifications: "Notifications",
    stayInformed: "Stay informed",
    noNotifications: "No new notifications",

    // Loading
    loading: "Loading...",

    // Safety Check
    safetyCheckTitle: "Safety Check",
    safetyCheckMessage:
      "Are you safe? Please let us know your current safety status.",
    safe: "I'm Safe",
    notSafe: "I'm Not Safe",
  },
  my: {
    // Common
    login: "ဝင်ရောက်ရန်",
    register: "မှတ်ပုံတင်ရန်",
    location: "တည်နေရာ",
    profile: "ကိုယ်ရေးအချက်အလက်",

    // Home Screen
    floodRiskLevel: "ရေကြီးနိုင်ခြေအဆင့်",
    highFloodRiskAlert: "ရေလျှံအန္တရာယ်မြင့်မားသော သတိပေးချက်",
    highFloodRiskMessage:
      "သင့်လက်ရှိတည်နေရာတွင် ရေလျှံအန္တရာယ်မြင့်မားပါသည်။ သတိထားရန် လိုအပ်ပါသည်။",

    // Weather
    currentWeatherConditions: "လက်ရှိရာသီဥတုအခြေအနေ",
    feelsLike: "ခံစားရသော",
    humidity: "စိုထိုင်းဆ",
    wind: "လေ",
    visibility: "မြင်ကွင်းပေါ်လွင်မှု",
    pressure: "လေထုဖိအား",
    rain: "မိုး",
    uvIndex: "UV အညွှန်း",
    dewPoint: "နှင်းကျမှတ်",
    cloudCover: "မိုးတိမ်ဖုံးလွှမ်းမှု",
    airQuality: "လေထုအရည်အသွေး",
    sunrise: "နေထွက်ချိန်",
    sunset: "နေဝင်ချိန်",
    moonPhase: "လရဲ့အဆင့်",

    // Precipitation Analysis
    rainInformation: "မိုးရေချိန်အချက်အလက်",
    rainDescription: "မိုးရွာသွန်းမှုနှင့် ရွာသွန်းမည့်ပမာဏ",
    lastHour: "ပြီးခဲ့သော တစ်နာရီ",
    last24Hours: "ပြီးခဲ့သော ၂၄ နာရီ",
    next24Hours: "ရှေ့ ၂၄ နာရီ",
    lightRain: "မိုးအနည်းငယ်",
    mediumRain: "မိုးအလယ်အလတ်",
    heavyRain: "မိုးကြီး",
    lessThan: "ထက်နည်း",
    to: "မှ",
    moreThan: "ထက်များ",
    inches: "လက်မ",

    // Flood Risk
    floodDanger: "ရေလျှံအန္တရာယ်",
    floodDangerDescription: "သင်လက်ရှိ ဘယ်လောက်လုံခြုံသလဲ",
    lowRisk: "နည်း",
    moderateRisk: "အလယ်အလတ်",
    highRisk: "မြင့်",
    severeRisk: "ပြင်းထန်",
    risk: "အန္တရာယ်",
    basedOnForecast:
      "လက်ရှိရာသီဥတုနှင့် မနက်ဖြန်ခန့်မှန်းချက်အပေါ် အခြေခံထားသည်",
    groundWater: "မြေအောက်ရေ",
    riverWater: "မြစ်ရေ",
    drainage: "ရေထုတ်စနစ်",
    normal: "ပုံမှန်",
    rising: "တက်နေသည်",
    high: "မြင့်",
    nearCapacity: "စွမ်းဆောင်ရည်နီးပါး",
    atCapacity: "စွမ်းဆောင်ရည်ပြည့်",
    importantNotice: "အရေးကြီးသတိပေးချက်",
    monitorConditions:
      "အခြေအနေကို ဂရုတစိုက် စောင့်ကြည့်ပါ။ နိမ့်သောနေရာများကို ရှောင်ကြဉ်ပြီး ဖြစ်နိုင်သော ရွှေ့ပြောင်းမှုအတွက် ပြင်ဆင်ထားပါ။",

    // Map
    interactiveMap: "အပြန်အလှန်တုံ့ပြန်နိုင်သော မြေပုံ",
    viewAlerts:
      "လက်ရှိ ရေလျှံသတိပေးချက်များနှင့် လူထုအစီရင်ခံစာများကို ကြည့်ရှုရန်",
    activeAlerts: "လုပ်ဆောင်နေသော သတိပေးချက်များ",
    waterLevel: "ရေအဆင့်",

    // Notifications
    notifications: "အကြောင်းကြားစာများ",
    stayInformed: "သတင်းအချက်အလက်ရယူပါ",
    noNotifications: "အကြောင်းကြားစာအသစ်မရှိပါ",

    // Loading
    loading: "ဖွင့်နေသည်...",

    // Safety Check
    safetyCheckTitle: "လုံခြုံမှုစစ်ဆေးခြင်း",
    safetyCheckMessage:
      "သင်လုံခြုံပါသလား? သင့်လက်ရှိလုံခြုံမှုအခြေအနေကို ကျွန်ုပ်တို့အား အကြောင်းကြားပါ။",
    safe: "လုံခြုံပါသည်",
    notSafe: "လုံခြုံမှုမရှိပါ",
  },
};

export const getTranslation = (
  lang: Language,
  key: keyof typeof translations.en
): string => {
  return translations[lang][key] || translations.en[key] || key;
};
