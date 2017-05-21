import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Youtube from 'react-youtube';
import { compose, withState, withHandlers } from 'recompose';

class App extends React.Component {
  constructor(props) {
    const socket = new WebSocket('ws://localhost:8081');
    socket.addEventListener('message', event => {
      props.setPlayVideoId(event.data);
    });
    props.socket = socket;
    super(props);
  }

  render() {
    return (
      <div>
        <div>
          {this.props.playVideoId}
          {/*<Youtube videoId={this.props.playVideoId}/>*/}
        </div>
        <input type="text" value={this.props.videoId} onChange={this.props.editVideoId}/>
        <button onClick={this.props.buttonClicked}>{this.props.buttonText}</button>
      </div>
    );
  }
};

const enhance = compose(
  withState('buttonText', 'setButtonText', 'Click me'),
  withState('videoId', 'setVideoId', ''),
  withState('playVideoId', 'setPlayVideoId', 'o5ZXr9i_cSI'),
  withHandlers({
    buttonClicked: props => event => {
      props.socket.send(props.videoId);
    },
    editVideoId: props => event => {
      props.setVideoId(event.target.value);
    }
  })
);

export default enhance(App);
