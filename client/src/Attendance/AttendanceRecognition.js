import React, { useState, useRef, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CallApi from '../API/CallApi';

const AttendanceRecognition = () => {
  const history = useHistory();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [lop, setLop] = useState('');

  // Cleanup stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle face recognition interval
  useEffect(() => {
    let captureInterval;

    if (isRecognizing && stream) {
      console.log('Starting face recognition interval');
      captureInterval = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

          canvasRef.current.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob, 'face.jpg');
            formData.append('lop', lop);

            console.log('Sending recognize request');

            try {
              const response = await CallApi('api/face-recognition', 'POST', formData);
              console.log('Recognize response:', response);

              if (response && response.data && response.data.recognized) {
                toast.success(`Điểm danh thành công: ${response.data.msv}`);
                setIsRecognizing(false);
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                }
                history.push(`/home/attendance`);
              }
              
            } catch (error) {
              console.error('Error sending frame:', error);
              toast.error('Lỗi khi gửi ảnh: ' + error.message);
            }
          }, 'image/jpeg', 0.9);
        }
      }, 2000);
    }

    return () => {
      if (captureInterval) {
        console.log('Cleaning up face recognition interval');
        clearInterval(captureInterval);
      }
    };
  }, [isRecognizing, stream, lop, history]);

  const startLocalRecognition = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsRecognizing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Không thể truy cập camera');
    }
  };

  const stopRecognition = () => {
    setIsRecognizing(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Điểm danh bằng nhận diện khuôn mặt</h2>
      <div className="mb-3">
        <label className="form-label">Lớp:</label>
        <input
          type="text"
          className="form-control"
          value={lop}
          onChange={(e) => setLop(e.target.value)}
          placeholder="Nhập mã lớp"
        />
      </div>
      <div className="mb-3">
        {!isRecognizing ? (
          <button className="btn btn-primary" onClick={startLocalRecognition}>
            Bắt đầu điểm danh
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopRecognition}>
            Dừng điểm danh
          </button>
        )}
      </div>
      <div className="position-relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-100 d-block"
          style={{ maxWidth: '640px' }}
        />
        <canvas
          ref={canvasRef}
          className="d-none"
          width="640"
          height="480"
        />
      </div>
    </div>
  );
};

export default AttendanceRecognition; 