import React from "react";
import { GiftedChat, InputToolbar, Bubble } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import MapView from 'react-native-maps';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from "./CustomActions";


export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      isConnected: false,
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      image: null,
      location: null,
    };

    //initializing firebase
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyD0MafGSiwxEIUAgXZP3wf65lyDKRx3dww",
        authDomain: "chatapp-872b6.firebaseapp.com",
        projectId: "chatapp-872b6",
        storageBucket: "chatapp-872b6.appspot.com",
        messagingSenderId: "114591700803",
        appId: "1:114591700803:web:33728b7aca641adbba01f6"
      });
    }
    //reference to the Firestore messages collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    this.refMsgUser = null;
  }

  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }



  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message);
    }
  }

  //function gets called after the Chat component mounts
  componentDidMount() {
    //set name to name selected on start page
    let { name } = this.props.route.params;
    // Adds the name to top of screen
    this.props.navigation.setOptions({ title: name });

    //Check if the user is off- or online
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log("online");
        // listens for updates in the collection
        this.unsubscribe = this.referenceChatMessages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate);

        //listen to authentication events, sign in anonymously
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              return await firebase.auth().signInAnonymously();
            }

            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              messages: [],
              user: {
                _id: user.uid,
                name: name,
                avatar: "https://placeimg.com/140/140/any",
              },
            });

            //referencing messages of current user
            this.refMsgsUser = firebase
              .firestore()
              .collection("messages")
              .where("uid", "==", this.state.uid);
          });
        //save messages when online
        this.saveMessages();
      } else {
        // the user is offline
        this.setState({ isConnected: false });
        console.log("offline");
        //retrieve chat from asyncstorage
        this.getMessages();
      }
    });
  }

  //adding a new message to the database collection
  addMessage() {
    const message = this.state.messages[0];

    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  }



  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages: messages
    });
    this.saveMessages();
  };




  //function will be called once user sends a message
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      // this.addMessage();
      this.saveMessages();
    }
    );
  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      // stops listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
    }
  }





  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000',
          },
        }}
      />
    );
  }

  // hides inputbar when offline
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />
    }
  }

  //displays the communication features
  renderCustomActions = (props) => <CustomActions {...props} />

  // custom map view
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  // render components
  render() {

    const { bgColor } = this.props.route.params;

    return (
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <GiftedChat
          messages={this.state.messages}
          isConnected={this.state.isConnected}
          onSend={(messages) => this.onSend(messages)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          user={{
            _id: 1,
            name: this.state.name,
            avatar: this.state.user.avatar
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}