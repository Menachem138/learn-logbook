import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from "./pages/Index";
import Login from "./pages/Login";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen 
                name="Home" 
                component={Index}
                options={{
                  headerShown: false
                }}
              />
              <Stack.Screen 
                name="Login" 
                component={Login}
                options={{
                  headerShown: false
                }}
              />
            </Stack.Navigator>
            <Toaster />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;