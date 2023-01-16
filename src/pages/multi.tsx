import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import socketIO, { Socket } from "socket.io-client";

import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const webSocket_url = "http://localhost:4000";

let ws: Socket;

if (typeof window !== "undefined") {
  ws = socketIO(webSocket_url);
}

export const wsAtom = atom(ws!);

const Home: NextPage = () => {
  const [ws] = useAtom(wsAtom);
  const router = useRouter();
  const createRoom = () => {
    ws.emit("create-room");
  };

  useEffect(() => {
    ws.on("room-created", ({ roomId }: { roomId: string }) => {
      router.push("/room/" + roomId);
    });

    return () => {
      ws.off("room-created");
    };
  }, []);
  return (
    <>
      <Head>
        <title>WebRTC - Single Peer</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen w-screen">
        <button onClick={createRoom}>Join</button>
      </main>
    </>
  );
};

export default Home;