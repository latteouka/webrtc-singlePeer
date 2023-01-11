import Peer, { MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";

let peer: Peer;
let localStream: MediaStream;
let callState: MediaConnection;
let sharingScreen: boolean = false;

const Single = () => {
  const [peerId, setPeerId] = useState<string>("");
  const [remotePeerId, setRemotePeerId] = useState<string>("");
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const videoRef2 = useRef<HTMLVideoElement | null>(null);

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
          videoRef2.current!.srcObject = remoteStream;
        });
        callState = call;
      });

      videoRef1.current!.srcObject = localStream;
    };
    getLocalStream();

    return () => {
      peer.destroy();
    };
  }, []);

  const callPeer = async () => {
    const call = peer.call(remotePeerId, localStream);
    callState = call;
    call.on("stream", (remoteStream) => {
      videoRef2.current!.srcObject = remoteStream;
    });
  };

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
        <video autoPlay ref={videoRef1} className="h-[480px] w-[640px]" />
        <video autoPlay ref={videoRef2} className="h-[480px] w-[640px]" />
      </div>
      <div>PeerId: {peerId}</div>
      <div>
        <input
          type="text"
          className="m-2 w-[500px] border-2 px-3 py-2"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
        />
        <button className="m-2 rounded-md bg-gray-300 p-2" onClick={callPeer}>
          call
        </button>
      </div>
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
