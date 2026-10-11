import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  Square, 
  Circle, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Radio, 
  Video, 
  Volume2
} from 'lucide-react';
import { Button } from '../common/Button';
import { ValidatedMediaFile } from '../../types/analysis';
import { generateMockHash } from '../../utils/fileValidation';

interface RecordMediaUploadProps {
  onMediaRecorded: (media: ValidatedMediaFile) => void;
  disabled?: boolean;
}

export const RecordMediaUpload: React.FC<RecordMediaUploadProps> = ({
  onMediaRecorded,
  disabled = false,
}) => {
  const [recordMode, setRecordMode] = useState<'video' | 'audio'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [useSimulatedFeed, setUseSimulatedFeed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopAllTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const startStream = async (mode: 'video' | 'audio') => {
    setPermissionError(null);
    stopAllTracks();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser.');
      }

      const constraints = mode === 'video' ? { video: true, audio: true } : { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setUseSimulatedFeed(false);
    } catch (err: any) {
      console.warn('Could not access real webcam/microphone; using simulated sensor intake.', err);
      setUseSimulatedFeed(true);
      setPermissionError('Hardware camera/mic not detected or permission denied. Demo simulation mode enabled for testing.');
    }
  };

  const handleStartRecording = async () => {
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    chunksRef.current = [];
    setRecordingTime(0);

    await startStream(recordMode);

    setIsRecording(true);

    // Timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 60) {
          handleStopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);

    // If real media stream is active, record real chunks
    if (mediaStreamRef.current) {
      try {
        const recorder = new MediaRecorder(mediaStreamRef.current);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        recorder.start(250);
      } catch (e) {
        console.warn('Real MediaRecorder initiation failed, fallback to simulated blob');
      }
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopAllTracks();

    // Create either real blob or mock demonstration blob
    setTimeout(() => {
      let blob: Blob;
      if (chunksRef.current.length > 0) {
        blob = new Blob(chunksRef.current, {
          type: recordMode === 'video' ? 'video/webm' : 'audio/webm',
        });
      } else {
        // Mock fallback blob
        blob = new Blob(['mock recorded data for truthlens forensic inspection'], {
          type: recordMode === 'video' ? 'video/mp4' : 'audio/wav',
        });
      }

      setRecordedBlob(blob);
      const url =
        chunksRef.current.length > 0
          ? URL.createObjectURL(blob)
          : recordMode === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

      setRecordedPreviewUrl(url);
    }, 300);
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  const handleConfirmRecording = () => {
    if (!recordedBlob) return;

    const fileName =
      recordMode === 'video'
        ? `live_webcam_capture_${Date.now()}.webm`
        : `live_mic_recording_${Date.now()}.wav`;

    const size = recordedBlob.size > 1000 ? recordedBlob.size : 14 * 1024 * 1024;
    const formattedSize = `${(size / (1024 * 1024)).toFixed(1)} MB`;

    onMediaRecorded({
      id: `record_${Date.now()}`,
      name: fileName,
      size,
      formattedSize,
      type: recordMode,
      mimeType: recordMode === 'video' ? 'video/webm' : 'audio/wav',
      previewUrl:
        recordedPreviewUrl ||
        (recordMode === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
      hash: generateMockHash(fileName, size),
      status: 'valid',
      sourceType: 'recording',
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector (Webcam vs Mic) */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRecording || disabled}
            onClick={() => {
              setRecordMode('video');
              handleRetake();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              recordMode === 'video'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Webcam Video</span>
          </button>

          <button
            type="button"
            disabled={isRecording || disabled}
            onClick={() => {
              setRecordMode('audio');
              handleRetake();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              recordMode === 'audio'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Microphone Audio</span>
          </button>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
          <Radio className={`w-3 h-3 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          <span>{isRecording ? 'Capturing Live Sensor' : 'Sensor Ready'}</span>
        </div>
      </div>

      {/* Permission / Simulation notice if needed */}
      {permissionError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Recording Stage Box */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-700/80 overflow-hidden shadow-xl min-h-[320px] flex flex-col items-center justify-center p-6 text-white">
        {/* If recorded preview is ready */}
        {recordedPreviewUrl && !isRecording ? (
          <div className="w-full max-w-lg space-y-4 flex flex-col items-center">
            {recordMode === 'video' ? (
              <video
                src={recordedPreviewUrl}
                controls
                className="w-full max-h-[260px] rounded-2xl bg-black shadow-lg"
              />
            ) : (
              <div className="w-full p-6 bg-navy-850 rounded-2xl border border-navy-700 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold">Recorded Acoustic Sample ({formatTimer(recordingTime)})</div>
                <audio src={recordedPreviewUrl} controls className="w-full h-10" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-white border-slate-600 hover:bg-slate-800"
              >
                Retake
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRecording}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Use For Forensic Scan
              </Button>
            </div>
          </div>
        ) : (
          /* Live stage while idle or recording */
          <div className="w-full flex flex-col items-center justify-center space-y-6">
            {recordMode === 'video' ? (
              <div className="relative w-full max-w-md h-52 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${useSimulatedFeed ? 'hidden' : 'block'}`}
                />
                {(useSimulatedFeed || !isRecording) && (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <Video className="w-10 h-10 text-cyan-500/60" />
                    <span className="text-xs font-mono">
                      {isRecording ? 'Simulated Live Sensor Feed' : 'Camera Feed Inactive'}
                    </span>
                  </div>
                )}
                {/* Crosshairs HUD overlay */}
                <div className="absolute inset-4 border border-dashed border-cyan-500/30 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
                </div>
              </div>
            ) : (
              /* Audio recording visualizer stage */
              <div className="w-full max-w-md h-40 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-3">
                <Mic className={`w-8 h-8 ${isRecording ? 'text-rose-500 animate-bounce' : 'text-slate-500'}`} />
                <div className="flex items-end gap-1.5 h-8">
                  {[20, 40, 80, 50, 95, 60, 30, 75, 45, 90, 60, 35].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-cyan-400 rounded-full transition-all"
                      style={{
                        height: isRecording ? `${h}%` : '20%',
                        opacity: isRecording ? 1 : 0.3,
                        animation: isRecording ? `pulse 0.8s ease-in-out ${i * 0.08}s infinite alternate` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Timer and Status */}
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-2xl font-mono font-bold tracking-wider">
                {formatTimer(recordingTime)}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 01:00 max</span>
            </div>

            {/* Record / Stop Button */}
            <div>
              {!isRecording ? (
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleStartRecording}
                  leftIcon={<Circle className="w-4 h-4 fill-current" />}
                  className="rounded-full px-8 shadow-lg shadow-rose-500/30"
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleStopRecording}
                  leftIcon={<Square className="w-4 h-4 fill-current text-rose-500" />}
                  className="rounded-full px-8 bg-white text-slate-950 hover:bg-slate-200"
                >
                  Stop Recording
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 justify-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Hardware streams are never uploaded during recording; strictly client-side buffering.</span>
      </div>
    </div>
  );
};
