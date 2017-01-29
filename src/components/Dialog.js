/* @flow */

import React, { Component } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Overlay from './Overlay';
import DefaultAnimation from '../animations/DefaultAnimation';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

type Props = {
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  haveOverlay: bool;
  overlayPointerEvents: string;
  overlayBackgroundColor: string;
  overlayOpacity: number;
  dialogAnimation: Object;
  dialogStyle: Object | number;
  animationDuration: number;
  closeOnTouchOutside: bool;
  open: bool;
  onOpened: Function;
  onClosed: Function;
  actions: Array;
  children: any;
};

const defaultProps = {
  animationDuration: 200,
  minWidth: 0.4,
  minHeight: 0.4,
  maxHeight: 1.0,
  dialogAnimation: new DefaultAnimation({ animationDuration: 150 }),
  closeOnTouchOutside: true,
  haveOverlay: true,
};

class Dialog extends Component {
  props: Props;
  static defaultProps = defaultProps;

  constructor(props) {
    super(props);
    // opened, opening, closed, closing,
    this.state = {
      dialogState: 'closed',
    };

    this.onOverlayPress = this.onOverlayPress.bind(this);
  }

  componentDidMount() {
    if (this.props.open) {
      this.open(this.props.onOpened);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open) {
      if (nextProps.open) {
        return this.open(nextProps.onOpened);
      }
      return this.close(nextProps.onClosed);
    }
    return nextProps;
  }

  onOverlayPress() {
    if (this.props.closeOnTouchOutside) {
      this.close();
    }
  }

  setDialogState(toValue, callback) {
    this.props.dialogAnimation.toValue(toValue);
    let dialogState = toValue ? 'opening' : 'closing';

    this.setState({ dialogState });

    setTimeout(() => {
      dialogState = dialogState === 'closing' ? 'closed' : 'opened';
      this.setState({ dialogState });
      if (callback && typeof callback === 'function') callback();
    }, this.props.animationDuration);
  }

  calculateDialogSize({ minWidth, maxWidth, minHeight, maxHeight }): Object {
    const dialogSize = { minWidth, maxWidth, minHeight, maxHeight };

    Object.keys(dialogSize).forEach((s) => {
      if (dialogSize[s] > 0.0 && dialogSize[s] < 1.0) {
        if (s.toLowerCase().includes('width')) {
          dialogSize[s] *= WIDTH;
        } else {
          dialogSize[s] *= HEIGHT;
        }
      }
    });

    return dialogSize;
  }

  open(onOpened = this.props.onOpened) {
    this.setDialogState(1, onOpened);
  }

  close(onClosed = this.props.onClosed) {
    this.setDialogState(0, onClosed);
  }

  get pointerEvents() {
    if (this.props.overlayPointerEvents) {
      return this.props.overlayPointerEvents;
    }
    return this.state.dialogState === 'opened' ? 'auto' : 'none';
  }

  render() {
    let hidden;
    let dialog;

    const dialogState = this.state.dialogState;
    const overlayPointerEvents = this.pointerEvents;
    const isShowOverlay = (['opened', 'opening'].includes(dialogState) && this.props.haveOverlay);
    const dimensions = {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    };

    if (dialogState === 'closed') {
      hidden = styles.hidden;
    } else {
      const dialogSize = this.calculateDialogSize(this.props);
      dialog = (
        <Animated.View
          style={[
            styles.dialog, dialogSize, this.props.dialogStyle, this.props.dialogAnimation.animations,
          ]}
        >
          {this.props.children}
          {this.props.actions}
        </Animated.View>
      );
    }

    return (
      <View style={[styles.container, hidden, dimensions]}>
        <Overlay
          pointerEvents={overlayPointerEvents}
          showOverlay={isShowOverlay}
          onPress={this.onOverlayPress}
          backgroundColor={this.props.overlayBackgroundColor}
          opacity={this.props.overlayOpacity}
          animationDuration={this.props.animationDuration}
        />
        {dialog}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  hidden: {
    top: -10000,
    left: 0,
    height: 0,
    width: 0,
  },
});

export default Dialog;
