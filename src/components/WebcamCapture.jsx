import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function WebcamCapture() {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isCapturing, setIsCapturing] = useState(false);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capture = async () => {
    try {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();

      const image = new Image();
      image.src = imageSrc;

      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");

      // Flip horizontally for front camera
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });
      
      console.log(file)
      const formData = new FormData();
      formData.append("file", file);


      const response = await fetch("https://276439b221c3.ngrok-free.app/liveness/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error checking liveness. Make sure the backend is running.");
    } finally {
      setIsCapturing(false);
    }
  };

  const isReal = result && result.label === "Real";

  return (

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-purple-400">
            Liveness Detection
          </h1>
          <p className="text-sm text-gray-400">
            Advanced facial verification system
          </p>
  

        {/* Main Content */}
        <div className="bg-gray-900 rounded-xl border border-purple-800 shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4 p-4">
            {/* Left: Webcam + Button */}
            <div className="w-full lg:w-1/2 flex flex-col items-center">
              <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-full rounded-lg overflow-hidden border border-purple-600 h-64 sm:h-80 lg:h-[460px]">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  mirrored={false} // Avoid mirrored preview
                  videoConstraints={{
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  }}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={switchCamera}
                  className="absolute top-2 right-2 bg-purple-800 hover:bg-purple-700 p-2 sm:p-3 rounded-full text-white shadow"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <button
                onClick={capture}
                disabled={isCapturing}
                className="w-full mt-4 bg-purple-700 hover:bg-purple-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base rounded-lg flex justify-center items-center gap-2 transition"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                {isCapturing ? "Processing..." : "Check Liveness"}
              </button>
            </div>

            {/* Right: Results */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              {result ? (
                <div className="space-y-4">
                  {/* Status */}
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                      isReal
                        ? "border-green-500 bg-green-900/20"
                        : "border-red-500 bg-red-900/20"
                    }`}
                  >
                    {isReal ? (
                      <CheckCircle className="text-green-400 w-6 h-6" />
                    ) : (
                      <XCircle className="text-red-400 w-6 h-6" />
                    )}
                    <div>
                      <p className="text-xs text-gray-300 uppercase">Status</p>
                      <p
                        className={`text-xl font-bold ${
                          isReal ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {result.label}
                      </p>
                    </div>
                  </div>

                  {/* Real Confidence */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Real Confidence</span>
                      <span className="text-green-400 font-semibold">
                        {(parseFloat(result.real) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${parseFloat(result.real) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Spoof Probability */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Spoof Probability</span>
                      <span className="text-red-400 font-semibold">
                        {(parseFloat(result.spoof) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-300"
                        style={{ width: `${parseFloat(result.spoof) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-lg font-medium text-white mb-1">
                    Ready to Verify
                  </p>
                  <p className="text-sm text-gray-400">
                    Position your face and tap "Check Liveness"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          Powered by advanced AI facial recognition
        </div>
      </div>
    </div>
  );
}
