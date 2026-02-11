import React, { useEffect, useRef, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VideoCall = ({ appointmentId, onEnd }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState('Initializing...');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  // STUN servers (free via Google)
  const peerConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    // Validate appointmentId
    if (!appointmentId) {
      setStatus('Error: No appointment ID provided');
      return;
    }

    console.log('VideoCall component initialized with appointmentId:', appointmentId);

    // Check if Socket.IO is available
    if (!window.io) {
      setStatus('Error: Socket.IO not available');
      return;
    }

    // Initialize Socket
    socketRef.current = window.io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: true,
      path: '/socket.io/'
    });

    console.log('Socket.IO initialized with URL:', BACKEND_URL);

    // Setup Listeners BEFORE emitting join
    socketRef.current.on('connect', () => {
      console.log("Socket connected with ID:", socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setStatus('Connection error: ' + error);
    });

    socketRef.current.on('room-joined', () => {
       if (status === 'Joining room...') {
          setStatus('Waiting for participant...');
       }
    });

    socketRef.current.on('user-connected', async (userId) => {
      console.log('User connected:', userId);
      setStatus('User connected. Initiating call...');
      await createOffer(userId);
    });

    socketRef.current.on('offer', async ({ offer, senderId }) => {
       console.log('Offer received from:', senderId);
       setStatus('Incoming call...');
       await handleOffer(offer, senderId);
    });

    socketRef.current.on('answer', async ({ answer }) => {
       console.log('Answer received');
       setStatus('Call Connected');
       await handleAnswer(answer);
    });

    socketRef.current.on('ice-candidate', async ({ candidate }) => {
      console.log('ICE candidate received');
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setStatus('Connection lost: ' + reason);
    });

    const startCall = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           setStatus('Error: WebRTC not supported here (Non-HTTPS?)');
           return;
        }

        setStatus('Accessing camera/microphone...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setStatus('Joining room...');
        socketRef.current.emit('join-video-room', appointmentId);

      } catch (err) {
        console.error("Error accessing media devices:", err);
        let msg = 'Error accessing camera.';
        if (err.name === 'NotAllowedError') msg = 'Error: Permission denied.';
        if (err.name === 'NotFoundError') msg = 'Error: No camera found.';
        if (err.name === 'NotReadableError') msg = 'Error: Camera busy/in use.';
        if (err.name === 'SecurityError') msg = 'Error: HTTPS required.';
        setStatus(msg);
      }
    };

    startCall();

    return () => {
      if (streamRef.current) { // Use ref to clean up correct stream
         streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [appointmentId]);

  // Keep track of stream in ref for cleanup closure
  const streamRef = useRef(null);
  useEffect(() => {
     streamRef.current = localStream;
  }, [localStream]);


  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(peerConfiguration);

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: appointmentId
        });
      }
    };
    
    // Connection state changes
    pc.onconnectionstatechange = () => {
        if(pc.connectionState === 'connected') {
            setStatus('Connected');
        } else if (pc.connectionState === 'disconnected') {
            setStatus('User Disconnected');
        }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async (userId) => {
    const pc = createPeerConnection(); // Create new PC for new connection
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socketRef.current.emit('offer', {
      offer,
      roomId: appointmentId
    });
  };

  const handleOffer = async (offer, senderId) => {
    try {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        answer,
        roomId: appointmentId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      setStatus('Error during WebRTC handshake: ' + error.message);
    }
  };

  const handleAnswer = async (answer) => {
     try {
        if(peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(answer);
        }
     } catch (error) {
        console.error('Error handling answer:', error);
        setStatus('Error during WebRTC handshake: ' + error.message);
     }
  };

  const toggleMute = () => {
    if (localStream) {
       localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
       setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
       localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
       setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
       {/* Header */}
       <div className="px-6 py-4 bg-slate-800 flex justify-between items-center shadow-lg z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Video Consultation</h2>
            <p className={`text-sm ${status.startsWith('Error') ? 'text-red-400 font-bold' : 'text-slate-400'}`}>Status: {status}</p>
          </div>
          <div className="flex gap-3">
             {status.startsWith('Error') && (
                <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-bold transition-colors">
                  Retry
                </button>
             )}
             <button onClick={onEnd} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-bold transition-colors">
               End Call
             </button>
          </div>
       </div>

       {/* Video Grid */}
       <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">
          
          {/* Main Remote Video */}
          <div className="flex-1 bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-700">
             <video 
               ref={remoteVideoRef} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover" 
             />
             {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                         <span className="text-4xl">👤</span>
                      </div>
                      <p className="text-slate-400">Waiting for other participant...</p>
                   </div>
                </div>
             )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute bottom-8 right-8 w-48 h-36 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl z-20">
             <video 
               ref={localVideoRef} 
               autoPlay 
               playsInline 
               muted 
               className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''} mirror`} 
             />
             {isVideoOff && (
               <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                  <span className="text-2xl">📷</span>
               </div>
             )}
              <div className="absolute bottom-2 left-2 px-2 py-0 type-xs bg-black/50 rounded text-[10px] text-white">
                You {isMuted && '(Muted)'}
              </div>
          </div>
       </div>

       {/* Controls */}
       <div className="h-20 bg-slate-800 flex items-center justify-center gap-6">
          <button 
             onClick={toggleMute} 
             className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
             title={isMuted ? "Unmute" : "Mute"}
          >
             {isMuted ? '🔇' : '🎤'}
          </button>
          
           <button 
             onClick={toggleVideo} 
             className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
             title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
             {isVideoOff ? '🚫' : '📹'}
          </button>

           <button 
             onClick={onEnd} 
             className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-500/30"
          >
             📞
          </button>
       </div>
       <style>{`
         .mirror {
            transform: scaleX(-1);
         }
       `}</style>
    </div>
  );
};

export default VideoCall;
