import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

//import screens
import Start from './components/Start';
import Chat from './components/Chat';
import CustomActions from './components/CustomActions';

//import react native gesture handler
import 'react-native-gesture-handler';

//import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';




//Create Navigator
const Stack = createStackNavigator();


export default class ChatApp extends React.Component {

  renderCustomActions = (props) => {
    return <CustomActions {...props} />
  };

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          //First screen to load up upon starting the app
          initialRouteName="Start"
        >
          <Stack.Screen
            name="Start"
            component={Start}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
