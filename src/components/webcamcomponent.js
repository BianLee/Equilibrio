

import { useRef, useEffect } from "react";

function WebcamComponent() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupWebcam() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing the webcam:", error);
        }
      }
    }

    setupWebcam();
  }, []);

  return (
    <video ref={videoRef} playsInline autoPlay muted width="640" height="480" />
  );
}

export default WebcamComponent;
