import React, { useRef, useState } from 'react'
import Script from 'next/script';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Mic, MicOff, PhoneOff, User, Video, VideoOff } from 'lucide-react';
import { useEffect } from 'react';

const VideoCall = ({sessionId,token}) => {

  const[isLoading,setIsLoading]=useState(true);  // Loading state
  const[scriptLoaded, setScriptLoaded]=useState(false);  // Script loading state
  const[isConnected, setIsConnected]=useState(false);  // Connection state
  const[isVideoEnabled, setIsVideoEnabled]=useState(true);  // Video state on/off
  const[isAudioEnabled, setIsAudioEnabled]=useState(true);  // Audio state on/off
const sessionRef =useRef(null); // Reference to the video session
const publisherRef =useRef(null); // Reference to the video publisher
const router = useRouter();
 
const appId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID; // Vonage API Key from environment variables

//handling invalid video call parameters
if (!sessionId || !token || !appId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Invalid Video Call
        </h1>
        <p className="text-muted-foreground mb-6">
          Missing required parameters for the video call.
        </p>
        <Button
          onClick={() => router.push("/appointments")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Back to Appointments
        </Button>
      </div>
    );
  }

//handle successful loading of Vonage API
  const handleScriptLoad = () => {
    setScriptLoaded(true);
    //check if vonage OT(openTok) object is available
    if(!window.OT){
        toast.error("Failed to load video call script.");
        setIsLoading(false);
        return;
  }
  initializeSession();
}

const initializeSession = () => {
  // 1. Check if all required parameters are present
  if (!appId || !sessionId || !token) {
    toast.error("Missing required video call parameters");
    router.push("/appointments");
    return;
  }

  console.log({ appId, sessionId, token });

  try {
    // 2. Initialize the video session (creates a "room" object)
    sessionRef.current = window.OT.initSession(appId, sessionId);

    // 3. Listen for new streams created by OTHER participants
    sessionRef.current.on("streamCreated", (event) => {
      console.log(event, "New stream created");

      // Subscribe to the new stream (show their video/audio inside #subscriber div)
      sessionRef.current.subscribe(
        event.stream,
        "subscriber", // Target div id="subscriber"
        {
          insertMode: "append", // Append their video element to container
          width: "100%",
          height: "100%",
        },
        (error) => {
          if (error) {
            toast.error("Error connecting to other participant's stream");
          }
        }
      );
    });

    // 4. When YOU successfully connect to the session
    sessionRef.current.on("sessionConnected", () => {
      // Update local UI state
      setIsConnected(true);
      setIsLoading(false);

      // Initialize your publisher (camera & mic stream)
      publisherRef.current = window.OT.initPublisher(
        "publisher", // Target div id="publisher"
        {
          insertMode: "replace", // Replace contents of publisher div with your video
          width: "100%",
          height: "100%",
          publishAudio: isAudioEnabled, // Use current audio toggle state
          publishVideo: isVideoEnabled, // Use current video toggle state
        },
        (error) => {
          if (error) {
            console.error("Publisher error:", error);
            toast.error("Error initializing your camera and microphone");
          } else {
            console.log(
              "Publisher initialized successfully - you should see your video now"
            );
          }
        }
      );
    });

    // 5. Handle when the session disconnects (e.g., you leave or network drops)
    sessionRef.current.on("sessionDisconnected", () => {
      setIsConnected(false); // Update UI state
    });

    // 6. Connect to the session with your token (authenticate and join)
    sessionRef.current.connect(token, (error) => {
      if (error) {
        toast.error("Error connecting to video session");
      } else {
        // After successful connection, try to publish your stream
        if (publisherRef.current) {
          sessionRef.current.publish(publisherRef.current, (error) => {
            if (error) {
              console.log("Error publishing stream:", error);
              toast.error("Error publishing your stream");
            } else {
              console.log("Stream published successfully");
            }
          });
        }
      }
    });
  } catch (error) {
    // Catch unexpected errors during initialization
    toast.error("Failed to initialize video call");
    setIsLoading(false);
  }
};

const toggleVideo = () => {
    if (publisherRef.current) {
      publisherRef.current.publishVideo(!isVideoEnabled);
      setIsVideoEnabled((prev) => !prev);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (publisherRef.current) {
      publisherRef.current.publishAudio(!isAudioEnabled);
      setIsAudioEnabled((prev) => !prev);
    }
  };

  // End call
  const endCall = () => {
    // Properly destroy publisher
    if (publisherRef.current) {
      publisherRef.current.destroy();
      publisherRef.current = null;
    }

    // Disconnect session
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }

    router.push("/appointments");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (publisherRef.current) {
        publisherRef.current.destroy();
      }
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, []);





  

    return (
   <>
   <Script
    src="https://unpkg.com/@vonage/client-sdk-video@latest/dist/js/opentok.js"
   onLoad={handleScriptLoad}
   onError={() => {
       toast.error("Failed to load video call script.");
       setIsLoading(false);
   }}
   />
   
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Video Consultation
          </h1>
          <p className="text-muted-foreground">
            {isConnected
              ? "Connected"
              : isLoading
              ? "Connecting..."
              : "Connection failed"}
          </p>
        </div>
        {isLoading && !scriptLoaded ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
            <p className="text-white text-lg">
              Loading video call components...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Publisher (Your video) */}
              <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">
                  You
                </div>
                <div
                  id="publisher"
                  className="w-full h-[300px] md:h-[400px] bg-muted/30"
                >
                  {!scriptLoaded && (
                    <div className="flex items-center justify-center h-full">
                      <div className="bg-muted/20 rounded-full p-8">
                        <User className="h-12 w-12 text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscriber (Other person's video) */}
              <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">
                  Other Participant
                </div>
                <div
                  id="subscriber"
                  className="w-full h-[300px] md:h-[400px] bg-muted/30"
                >
                  {(!isConnected || !scriptLoaded) && (
                    <div className="flex items-center justify-center h-full">
                      <div className="bg-muted/20 rounded-full p-8">
                        <User className="h-12 w-12 text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video controls */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleVideo}
                className={`rounded-full p-4 h-14 w-14 ${
                  isVideoEnabled
                    ? "border-emerald-900/30"
                    : "bg-red-900/20 border-red-900/30 text-red-400"
                }`}
                disabled={!publisherRef.current}
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={toggleAudio}
                className={`rounded-full p-4 h-14 w-14 ${
                  isAudioEnabled
                    ? "border-emerald-900/30"
                    : "bg-red-900/20 border-red-900/30 text-red-400"
                }`}
                disabled={!publisherRef.current}
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full p-4 h-14 w-14 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                {isVideoEnabled ? "Camera on" : "Camera off"} •
                {isAudioEnabled ? " Microphone on" : " Microphone off"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                When you're finished with your consultation, click the red
                button to end the call
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


export default VideoCall