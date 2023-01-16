import dynamic from "next/dynamic";
const MultiPeer = dynamic(() => import("../../components/MultiPeer"), {
  ssr: false,
});

const Room = () => {
  return (
    <main className="h-screen w-screen">
      <MultiPeer />
    </main>
  );
};
export default Room;
