import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AIVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/delivery') || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Web Speech API check
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setShowPanel(true);
      setTranscript('Listening for your command...');
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setTranscript(`You said: "${command}"`);
      handleVoiceCommand(command);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('Sorry, I couldn\'t hear that.');
      setTimeout(() => setShowPanel(false), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command.includes('menu')) {
      speak('Sure, opening the menu for you.');
      toast.info('Opening Menu...');
      setTimeout(() => navigate('/Menu'), 1000);
    } else if (command.includes('restaurant') || command.includes('hotel')) {
      speak('Let\'s explore some great restaurants nearby.');
      toast.info('Searching Restaurants...');
      setTimeout(() => navigate('/restaurants'), 1000);
    } else if (command.includes('profile') || command.includes('account')) {
      speak('Going to your profile.');
      navigate('/profile');
    } else if (command.includes('home')) {
      speak('Going back to the home page.');
      navigate('/');
    } else if (command.includes('order') || command.includes('track')) {
      speak('Checking your live order status.');
      navigate('/tracking');
    } else if (command.includes('hello') || command.includes('hi')) {
      speak('Hello! I am your FoodExpress assistant. How can I help you today?');
      setTranscript('Hello! How can I help?');
    } else if (command.includes('best') || command.includes('top')) {
      speak('Our top rated items are currently the Burger and the Paneer Tikka.');
      setTranscript('Suggestions: Burger, Paneer Tikka');
    } else {
      speak('I heard you, but I don\'t know that command yet. Try saying Menu or Tracking.');
      setTranscript(`I heard "${command}", but I only know Menu, Restaurants, and Tracking for now.`);
      setTimeout(() => setShowPanel(false), 5000);
      return;
    }
    setTimeout(() => setShowPanel(false), 2500);
  };

  const startListening = () => {
    if (!recognition) {
      toast.error('Voice Recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <>
      <div 
        className={`ai-voice-trigger ${isListening ? 'listening' : ''}`} 
        onClick={startListening}
        title="AI Voice Assistant"
      >
        <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
      </div>

      {showPanel && (
        <div className="ai-voice-panel">
          <div className="text-center">
            <div className="ai-wave-container">
              {[1,2,3,4,5].map(i => <div key={i} className="ai-wave"></div>)}
            </div>
            <h5 className="fw-bold mb-2">Voice Assistant</h5>
            <p className="small text-secondary mb-0">{transcript}</p>
            {isListening && <p className="mt-2" style={{fontSize:'10px', color:'#ff00cc'}}>Say "Open Menu" or "Show Restaurants"</p>}
          </div>
        </div>
      )}
    </>
  );
}
