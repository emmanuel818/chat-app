import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: {
        _id: '',
        name: '',
        avatar: '',
      },
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
  }

  //function gets called after the Chat component mounts
  componentDidMount() {

    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    //authentication
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }

      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
          avatar: "https://placeimg.com/140/140/any"
        }
      });
      //listener for collection updates
      this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
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
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        }
      });
    });
    this.setState({
      messages: messages
    });
  };

  //adding a new message to the database collection
  addMessage() {
    const message = this.state.messages[0];

    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: this.state.user
    });
  }


  //function will be called once user sends a message
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessage();
    })
  }

  componentWillUnmount() {
    // stops listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribe();
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

  render() {

    const { bgColor } = this.props.route.params;

    return (
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
        // user={{
        //   _id: this.state.user._id,
        //   name: this.state.name,
        //   avatar: this.state.user.avatar
        // }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}