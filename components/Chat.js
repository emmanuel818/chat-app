import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView } from 'react-native';

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    };
  }

  //function gets called after the Chat component mounts
  componentDidMount() {

    let name = this.props.route.params.name;

    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimage.com/140/140/any'
          },
        },
        {
          _id: 2,
          text: `${name} has entered the chat`,
          createdAt: new Date(),
          system: true,
        }
      ],
    })
  }

  //function will be called once user sends a message
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
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
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}