import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";

interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

interface WeatherData {
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  pressure_mb: number;
  feelslike_c: number;
  feelslike_f: number;
  uv: number;
  cloud: number;
  is_day: number;
  last_updated: string;
}

interface WeatherComponentProps {
  weatherData: WeatherData;
  location: string;
}

const WeatherComponent: React.FC<WeatherComponentProps> = ({
  weatherData,
  location,
}) => {
  if (!weatherData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p>Loading weather data...</p>
        </CardContent>
      </Card>
    );
  }

  const {
    temp_c,
    condition,
    humidity,
    wind_kph,
    wind_dir,
    pressure_mb,
    feelslike_c,
    uv,
    cloud,
    last_updated,
  } = weatherData;

  const formatUVIndex = (uv: number) => {
    if (uv <= 2) return { label: "Low", variant: "default" as const };
    if (uv <= 5) return { label: "Moderate", variant: "secondary" as const };
    if (uv <= 7) return { label: "High", variant: "destructive" as const };
    return { label: "Very High", variant: "destructive" as const };
  };

  const uvInfo = formatUVIndex(uv);

  return (
    <Card className="w-full max-w-md  bg-zinc-900 border border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Current Weather
            <p className="text-xs text-muted-foreground">
              Location: {location || "Unknown"}
            </p>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {format(new Date(last_updated), "MMM d, h:mm a")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">{Math.round(temp_c)}°C</div>
            <div>
              <p className="font-medium">{condition.text}</p>
              <p className="text-sm text-muted-foreground">
                Feels like {Math.round(feelslike_c)}°C
              </p>
            </div>
          </div>

          {condition.icon && (
            <div className="relative h-16 w-16">
              <Image
                src={`https:${condition.icon}`}
                alt={condition.text}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Humidity</p>
            <p className="font-medium">{humidity}%</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Wind</p>
            <p className="font-medium">
              {wind_kph} km/h{" "}
              <span className="text-muted-foreground">{wind_dir}</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pressure</p>
            <p className="font-medium">{pressure_mb} mb</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">UV Index</p>
            <div>
              <Badge variant={uvInfo.variant} className="text-xs">
                {uv} - {uvInfo.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cloud Cover</p>
            <p className="font-medium">{cloud}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherComponent;
