import { WS_PRIVATE_CHANNELS, WS_MESSAGE_TYPES } from '../constants';

const SEPARATOR = '_';

export function constructKey(...parts) {
  return parts.filter(str => str).join(SEPARATOR);
}

export function deconstructKey(key) {
  return key.split(SEPARATOR);
}

const isPrivateChannel = channel => WS_PRIVATE_CHANNELS.includes(channel);

export function buildSubscribeMessage(channel, contractCode) {
  return {
    type: WS_MESSAGE_TYPES.SUBSCRIBE,
    isPrivate: isPrivateChannel(channel),
    channels: [channel],
    contractCodes: contractCode ? [contractCode] : [],
  };
}

export function buildUnsubscribeMessage(channel, contractCode) {
  return {
    type: WS_MESSAGE_TYPES.UNSUBSCRIBE,
    channels: [channel],
    contractCodes: contractCode ? [contractCode] : [],
  };
}

export function compareSubscribeMessage(message, channel, contractCode) {
  return (
    message.type === WS_MESSAGE_TYPES.SUBSCRIBE &&
    message.channels[0] === channel &&
    message.contractCodes[0] === contractCode
  );
}
