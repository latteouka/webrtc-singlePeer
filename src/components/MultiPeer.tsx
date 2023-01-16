import { useAtom } from "jotai";
import Peer, { MediaConnection } from "peerjs";
import { useEffect, useReducer, useRef, useState } from "react";

let peer: Peer;
let localStream: MediaStream;
let callState: MediaConnection;
let sharingScreen: boolean = false;

import { wsAtom } from "../pages/multi";
import { peerReducer, PeerState } from "../utils/peerReducer";
import { addPeerAction, removePeerAction } from "../utils//peerActions";
import VideoPlayer from "./VideoPlayer";
import { useRouter } from "next/router";

const Single = () => {
  const [peerId, setPeerId] = useState<string>("");
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const { query, isReady } = useRouter();

  const [peers, dispatch] = useReducer(peerReducer, {});
  console.log(peers);

  const [ws] = useAtom(wsAtom);

  useEffect(() => {
    if (!peerId) return;
    if (!isReady) return;
    ws.emit("join-room", { roomId: query.roomId, peerId });

    ws.on("user-joined", ({ peerId }) => {
      const call = peer.call(peerId, localStream);
      call.on("stream", (remoteStream) => {
        dispatch(addPeerAction(peerId, remoteStream, call));
      });
    });

    ws.on("user-disconnected", (peerId) => {
      console.log("dis:", peerId);
      dispatch(removePeerAction(peerId));
    });

    return () => {
      ws.off("user-joined");
      ws.off("user-disconnected");
    };
  }, [peerId]);

  useEffect(() => {
    peer = new Peer();
    peer.on("open", (id: string) => {
      setPeerId(id);
    });

    const getLocalStream = async () => {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      peer.on("call", (call) => {
        call.answer(localStream);
        call.on("stream", (remoteStream) => {
          dispatch(addPeerAction(call.peer, remoteStream, call));
        });
      });

      videoRef1.current!.srcObject = localStream;
    };
    getLocalStream();

    return () => {
      peer.destroy();
    };
  }, []);

  const toggleCamera = async () => {
    const videoTracks = localStream.getVideoTracks();
    console.log(videoTracks);
    if (videoTracks[0]!.enabled) {
      console.log("enable -> mute");
      videoTracks[0]!.enabled = false;
    } else {
      console.log("mute -> enable");
      videoTracks[0]!.enabled = true;
    }
  };

  const toggleMic = async () => {
    const audioTracks = localStream.getAudioTracks();
    console.log(audioTracks);
    if (audioTracks[0]!.enabled) {
      console.log("enable -> mute");
      audioTracks[0]!.enabled = false;
    } else {
      console.log("mute -> enable");
      audioTracks[0]!.enabled = true;
    }
  };

  const shareScreen = async () => {
    if (!sharingScreen) {
      // get screen videotrack
      const displayStream = await navigator.mediaDevices.getDisplayMedia();
      const displayStreamVideoTracks = displayStream.getVideoTracks();
      const localStreamVideoTracks = localStream.getVideoTracks();
      // replace locally
      localStream.removeTrack(localStreamVideoTracks[0]!);
      localStream.addTrack(displayStreamVideoTracks[0]!);
      // replace tracks in connection
      Object.values(peers as PeerState).map((peer) => {
        peer.call.peerConnection
          .getSenders()[1]
          ?.replaceTrack(displayStreamVideoTracks[0]!);
      });
      if (callState) {
        callState.peerConnection
          .getSenders()[1]
          ?.replaceTrack(displayStreamVideoTracks[0]!);
      }
      sharingScreen = true;
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const userMediaVideoTracks = userMedia.getVideoTracks();

      const localStreamVideoTracks = localStream.getVideoTracks();
      // replace locally
      localStream.removeTrack(localStreamVideoTracks[0]!);
      localStream.addTrack(userMediaVideoTracks[0]!);
      // replace tracks in connection
      console.log(peers);
      Object.values(peers as PeerState).map((peer) => {
        peer.call.peerConnection
          .getSenders()[1]
          ?.replaceTrack(userMediaVideoTracks[0]!);
      });

      if (callState) {
        callState.peerConnection
          .getSenders()[1]
          ?.replaceTrack(userMediaVideoTracks[0]!);
      }
      sharingScreen = false;
    }
  };

  // video elements are muted!
  // if you want to test, turn them on back
  return (
    <div>
      <div className="flex">
        <video autoPlay muted ref={videoRef1} className="h-[480px] w-[640px]" />
        {Object.values(peers as PeerState).map((peer, index) => (
          <VideoPlayer stream={peer.stream} key={index} />
        ))}
      </div>
      <div>PeerId: {peerId}</div>
      <div className="m-2">
        <button className="rounded-md bg-gray-300 p-2" onClick={toggleCamera}>
          Toggle Camera
        </button>
        <button className="ml-4 rounded-md bg-gray-300 p-2" onClick={toggleMic}>
          Toggle Mic
        </button>
        <button
          className="ml-4 rounded-md bg-gray-300 p-2"
          onClick={shareScreen}
        >
          Share Screen
        </button>
      </div>
    </div>
  );
};
export default Single;
