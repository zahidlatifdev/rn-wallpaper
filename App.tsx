import * as React from 'react';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './components/HomeScreen';
import FullCatogeryScreen from './components/FullScreen';
import ImageDisplay from './components/ImageDisplay';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={'Home'}
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            animationEnabled: true,
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              gestureEnabled: false,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="FullCatogery"
            component={FullCatogeryScreen}
            options={{
              gestureEnabled: false,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="ImageDisplay"
            component={ImageDisplay}
            options={{
              gestureEnabled: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
