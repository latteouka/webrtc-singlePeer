import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream: MediaStream | null;
}

const VideoPlayer = ({ stream }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("video player effect");
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      className="h-[100px] w-[100px] rounded-full"
    />
  );
};
export default VideoPlayer;
