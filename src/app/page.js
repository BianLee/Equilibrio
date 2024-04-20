import WebcamTensorFlow from "../components/webcamtensorflow";

export default function Home() {
  return (
    <div className="flex m-4 mt-6">
      <div className="flex-1 mr-1">
        <WebcamTensorFlow />
      </div>
      <div className="flex-1 ml-1">
        <div className="flex flex-col h-full border-2 border-gray-300 p-4 rounded-lg">
          <div className="flex-1 overflow-y-auto p-2 mb-4 bg-white rounded-lg shadow">
            <p>Your messages will appear here...</p>
          </div>
          <div className="mt-auto">
            <input
              type="text"
              placeholder="Type your message here..."
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
