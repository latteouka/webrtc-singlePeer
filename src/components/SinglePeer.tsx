import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";

let peer: Peer;
let localStream: MediaStream;

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
    call.on("stream", (remoteStream) => {
      videoRef2.current!.srcObject = remoteStream;
    });
  };

  return (
    <div>
      <div className="flex">
        <video autoPlay muted ref={videoRef1} className="h-[480px] w-[640px]" />
        <video autoPlay muted ref={videoRef2} className="h-[480px] w-[640px]" />
      </div>
      <div>PeerId: {peerId}</div>
      <div>
        <input
          type="text"
          className="w-[500px]"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
        />
        <button className="rounded-md bg-gray-300 p-2" onClick={callPeer}>
          call
        </button>
      </div>
    </div>
  );
};
export default Single;
