import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Youtube from 'react-youtube';
import { compose, withState, withHandlers } from 'recompose';

class App extends React.Component {
  constructor(props) {
    const socket = new WebSocket('ws://localhost:8081');
    socket.addEventListener('message', event => {
      this.props.messageReceived(event);
    });
    props.setSocket(socket);
    super(props);
  }

  render() {
    const opts = {
      playerVars: {
        autoplay: 1
      }
    };
    return (
      <div>
        <div>
          <Youtube
            videoId={this.props.playVideoId}
            onReady={this.props.onReady}
            onPause={this.props.onPause}
            onPlay={this.props.onPlay}
            onStateChange={this.props.onStateChange}
            opts={opts} />
        </div>
        <input type="text" value={this.props.videoId} onChange={this.props.editVideoId} />
        <button onClick={this.props.buttonClicked}>{this.props.buttonText}</button>
      </div>
    );
  }
};

const enhance = compose(
  withState('buttonText', 'setButtonText', 'Click me'),
  withState('videoId', 'setVideoId', ''),
  withState('playVideoId', 'setPlayVideoId', '03ckEZRAMxI'),
  withState('socket', 'setSocket', {}),
  withState('player', 'setPlayer', {}),
  withState('clientId', 'setClientId', null),
  withState('sendStateChange', 'setSendStateChange', null),
  withHandlers({
    buttonClicked: props => event => {
      if(props.sendStateChange) {
        console.log('change video');
        props.socket.send(JSON.stringify({ clientId: props.clientId, videoId: props.videoId }));
      }
    },
    editVideoId: props => event => {
      props.setVideoId(event.target.value);
    },
    onPause: props => event => {
      if(props.sendStateChange) {
        console.log('pause');
        props.socket.send(JSON.stringify({ clientId: props.clientId, pause: true }));
      }
    },
    onPlay: props => event => {
      console.log('play', props.sendStateChange);
      if(props.sendStateChange) {
        props.socket.send(JSON.stringify({ clientId: props.clientId, play: true }));
      }
    },
    onReady: props => event => {
      console.log('ready');
      props.setPlayer(event.target);
    },
    onStateChange: props => event => {
      if(props.sendStateChange) {
        console.log('stateChange');
        props.socket.send(JSON.stringify({ clientId: props.clientId, time: event.target.getCurrentTime() }))
      }
    },
    messageReceived: props => event => {
      const data = JSON.parse(event.data);

      props.setSendStateChange(false);
      console.log("sendStateChange", false);
      if (data.videoId) {
        props.setPlayVideoId(data.videoId);
      }
      if (data.time && Math.abs(data.time - props.player.getCurrentTime()) > 1) {
        props.player.seekTo(data.time);
      }
      if (data.play) {
        props.player.playVideo();
      }
      if (data.pause) {
        props.player.pauseVideo();
      }
      if(data.id) {
        props.setClientId(data.id);
      }
      props.setSendStateChange(true);
      console.log("sendStateChange", true);
    }
  })
);

export default enhance(App);
