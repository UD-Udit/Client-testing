import React, { useEffect, useState } from "react";
import { Navbar } from "../Components/Navbar";
import { InputBar } from "../Components/InputBar";
import { Response } from "../Components/Response";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";


function HomePage() {
  const [audioURL, setAudioURL] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState("");
  const [threadId, setThreadId] = useState("");
  const [messageNo, setMessageNo] = useState(0);
  const apiKey = process.env.REACT_APP_API_KEY;

  const {
      transcript,
      listening,
      browserSupportsSpeechRecognition,
      browserSupportsContinuousListening,
      resetTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    const timeoutId = setTimeout(()=>{
      if(transcript.trim() !== ''){
        handleStop();
      }
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [transcript]);


  if (!browserSupportsSpeechRecognition) {
      return <alert>Browser doesn't support speech recognition.</alert>;
  }

  const handleStop = () => {
      SpeechRecognition.stopListening();
      handleAssistantCall(transcript);
  }


  const handleStart = () => {
      resetTranscript();
      if(browserSupportsContinuousListening){
          SpeechRecognition.startListening({continuous: true});
      }
  } 

  



  const handleAssistantCall = async(prompt) => {
    try{
        setLoading(true);
        if(prompt.length === 0) return;
        const response = await axios.post("https://ai-product-manager.onrender.com/assistant/chat", {
                message: prompt,
                threadId: threadId,
                assistantId: assistantId
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
        )
        if(response.data){
            handleApiCall(response.data.content);
            setMessage("Generating...");
        }
    }catch(e){
        console.log(e.message);
    }finally{
      setLoading(false);
    }
  }
  

  const handleApiCall = async (prompt) => {
    try {
      setLoading(true);
      if(prompt.length === 0) return;
      const response = await fetch(`https://api.openai.com/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(
          { 
            model: 'tts-1',
            voice: "alloy",
            input: prompt
          }),
      });
      if (!response.ok) {
        throw new Error('TTS submission failed');
      }
   
      const audioStream = await response.blob();
      const voiceURL = URL.createObjectURL(audioStream);
      setAudioURL(voiceURL);
      setMessage(prompt);
      setMessageNo((messageNo) => messageNo+1);
      
    }catch (error) {
        setMessage("TTS Error!");
        console.error("Error during API call:", error.message);
    }finally{
      setLoading(false);
    }
  }

  const handleStartConversation = async (language) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://ai-product-manager.onrender.com/assistant/",
        {
          language: language
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { assistantId, content, threadId } = response.data;
      setMessage("Generating...");
      setAssistantId(assistantId);
      setThreadId(threadId);
      handleApiCall(content);
    } catch (error) {
      console.log(error.message);
    } finally{
      setLoading(false);
    }
  };

  return (   
    <div className="w-full bg-[#121112] h-screen flex flex-col gap-2">
      <Navbar />
      <div className=" flex gap-6 flex-col justify-center items-center">
      
      <Response 
        audioURL={audioURL} 
        message={message} 
        loading={loading} 
        handleStart={handleStart}
        messageNo={messageNo}  />
      <InputBar 
        transcript={transcript} 
        handleStart = {handleStart}
        handleStop={handleStop}
        listening={listening}
        stopListening={SpeechRecognition.stopListening}
        handleStartConversation={handleStartConversation}
        loading={loading}
        startListening = {SpeechRecognition.startListening}
        browserSupportsContinuousListening = {browserSupportsContinuousListening}
        resetTranscript={resetTranscript}
        threadId={threadId}
      />

        </div>
    </div>
        
  );
}

export default HomePage;