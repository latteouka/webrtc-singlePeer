import { MediaConnection } from "peerjs";
import { ADD_PEER, REMOVE_PEER } from "./peerActions";

export type PeerState = Record<
  string,
  { stream: MediaStream; call: MediaConnection }
>;

type PeerAction =
  | {
      type: typeof ADD_PEER;
      payload: { peerId: string; stream: MediaStream; call: MediaConnection };
    }
  | {
      type: typeof REMOVE_PEER;
      payload: { peerId: string };
    };

export const peerReducer = (state: PeerState, action: PeerAction) => {
  switch (action.type) {
    case ADD_PEER:
      return {
        ...state,
        [action.payload.peerId]: {
          stream: action.payload.stream,
          call: action.payload.call,
        },
      };
    case REMOVE_PEER:
      const { [action.payload.peerId]: deleted, ...rest } = state;
      return rest;

    default:
      return { ...state };
  }
};
