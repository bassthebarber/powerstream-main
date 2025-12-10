export default function AttachLivepeerButton({ onAttached }) {
  return (
    <button onClick={() => onAttached?.({ playbackUrl: "", rtmp: { server:"", key:"" } })}>
      Attach Livepeer (stub)
    </button>
  );
}


