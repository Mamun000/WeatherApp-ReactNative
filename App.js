// Enhanced Weather App with animations and extra features
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { 
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  ScrollView as HorizontalScrollView
} from "react-native";
import { Feather } from '@expo/vector-icons';
import * as Location from "expo-location";

const { width } = Dimensions.get('window');

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cityFade = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const getWeatherDetails = async (longitude, latitude) => {
    setLoading(true);
    setErrorMsg(null);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=991ca7767ca41950b8025cbbbe5eb9fb&units=metric`
      );
      const weatherData = await weatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=991ca7767ca41950b8025cbbbe5eb9fb&units=metric`
      );
      const forecastData = await forecastResponse.json();

      if (weatherResponse.ok && forecastResponse.ok) {
        setWeatherData(weatherData);
        setForecastData(forecastData);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(cityFade, { toValue: 1, duration: 1000, delay: 400, useNativeDriver: true })
        ]).start();

        // Scroll to bottom after data loads
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

      } else {
        setErrorMsg(weatherData.message || "Failed to fetch weather data.");
      }
    } catch (error) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();
    if (location) {
      getWeatherDetails(location.longitude, location.latitude);
    } else {
      setErrorMsg("Location not available yet. Please wait...");
    }
  };

  const getWeatherIconName = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear': return 'sun';
      case 'clouds': return 'cloud';
      case 'rain': return 'cloud-rain';
      case 'snow': return 'cloud-snow';
      case 'thunderstorm': return 'cloud-lightning';
      case 'drizzle': return 'cloud-drizzle';
      case 'mist':
      case 'fog': return 'wind';
      default: return 'sun';
    }
  };

  const getBackgroundColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear': return '#7f8c8d';
      case 'clouds': return '#95a5a6';
      case 'rain': return '#7f8c8d';
      case 'snow': return '#bdc3c7';
      case 'thunderstorm': return '#616a6b';
      case 'drizzle': return '#aeb6bf';
      case 'mist':
      case 'fog': return '#85929e';
      default: return '#7f8c8d';
    }
  };

  const getWeatherNote = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear': return "It's a sunny day! Great time for outdoor activities.";
      case 'clouds': return "Cloudy skies ahead. Might want a light jacket.";
      case 'rain': return "Don't forget your umbrella!";
      case 'snow': return "Snowfall expected. Stay warm and safe.";
      case 'thunderstorm': return "Thunderstorm warning. Better to stay indoors.";
      case 'drizzle': return "Light rain. A raincoat should be enough.";
      case 'mist':
      case 'fog': return "Visibility is low due to mist or fog. Drive carefully.";
      default: return "Check the forecast for more updates.";
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
      } catch (error) {
        setErrorMsg("Failed to get location. Please try again.");
      }
    })();
  }, []);

  const backgroundColor = getBackgroundColor(weatherData?.weather?.[0]?.main);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}> 
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollViewRef}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Weather App</Text>
            <Text style={styles.subtitle}>Get current weather conditions</Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Fetching weather data...</Text>
            </View>
          )}

          {weatherData && weatherData.main && (
            <Animated.View style={[styles.weatherCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.weatherHeader}>
                <Feather name={getWeatherIconName(weatherData.weather[0].main)} size={60} color="#fff" style={{ marginRight: 15 }} />
                <Animated.View style={{ opacity: cityFade }}>
                  <Text style={styles.cityName}>{weatherData.name}</Text>
                  <Text style={styles.countryName}>{weatherData.sys.country}</Text>
                </Animated.View>
              </View>

              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°</Text>
                <Text style={styles.temperatureUnit}>C</Text>
              </View>

              <Text style={styles.condition}>
                {weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1)}
              </Text>

              <Text style={[styles.condition, { fontSize: 14, marginBottom: 10, opacity: 0.7 }]}>Note: {getWeatherNote(weatherData.weather[0].main)}</Text>

              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Feels like</Text>
                  <Text style={styles.detailValue}>{Math.round(weatherData.main.feels_like)}°C</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{weatherData.main.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Pressure</Text>
                  <Text style={styles.detailValue}>{weatherData.main.pressure} hPa</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Wind Speed</Text>
                <Text style={styles.detailValue}>{weatherData.wind.speed} m/s</Text>
              </View>
            </Animated.View>
          )}

          {forecastData && (
            <View style={{ marginTop: 30 }}>
              <Text style={{ fontSize: 18, color: '#fff', marginBottom: 15 }}>5-Day Forecast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5).map((item, index) => (
                  <View key={index} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, marginRight: 15, width: 100 }}>
                    <Text style={{ color: '#fff', marginBottom: 5 }}>{new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                    <Feather name={getWeatherIconName(item.weather[0].main)} size={30} color="#fff" style={{ alignSelf: 'center', marginBottom: 5 }} />
                    <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>{Math.round(item.main.temp)}°C</Text>
                    <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center', opacity: 0.8 }}>{item.weather[0].main}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
            <Pressable
              onPress={handleButtonPress}
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Check Weather'}</Text>
            </Pressable>
          </Animated.View>

          {errorMsg && (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', opacity: 0.8 },
  buttonContainer: { alignItems: 'center', marginVertical: 30 },
  button: {
    backgroundColor: '#2c3e50', paddingHorizontal: 40, paddingVertical: 15,
    borderRadius: 25, elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { color: '#FFFFFF', marginTop: 10, fontSize: 16, opacity: 0.8 },
  weatherCard: {
    borderRadius: 20, padding: 25, marginTop: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255,255,255,0.10)'
  },
  weatherHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cityName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  countryName: { fontSize: 16, color: '#FFFFFF', opacity: 0.8 },
  temperatureContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  temperature: { fontSize: 72, fontWeight: '300', color: '#FFFFFF' },
  temperatureUnit: { fontSize: 24, color: '#FFFFFF', marginTop: 10, opacity: 0.8 },
  condition: { fontSize: 18, color: '#FFFFFF', marginBottom: 25, textAlign: 'center', opacity: 0.9 },
  detailsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', paddingTop: 20 },
  detailItem: { alignItems: 'center', flex: 1, marginBottom: 10 },
  detailLabel: { fontSize: 14, color: '#FFFFFF', opacity: 0.7, marginBottom: 5 },
  detailValue: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  errorContainer: { backgroundColor: 'rgba(231, 76, 60, 0.9)', borderRadius: 10, padding: 15, marginTop: 20, alignItems: 'center' },
  errorText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', fontWeight: '500' },
});
