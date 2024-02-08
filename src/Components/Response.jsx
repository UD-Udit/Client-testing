import React, { useContext, useEffect, useState } from 'react'; 
import ReactPlayer from "react-player";
import Message from './Message';
import ConversationContext from '../context/ConversationContext';
import { Progress } from "@material-tailwind/react";

export const Response = ({ audioURL, message, loading, handleStart, messageNo}) => {
  const {
    conversationCompleted, 
    setConversationCompleted} = useContext(ConversationContext);
    const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    console.log(messageNo);
    if(messageNo === 0) return;
    if(messageNo < 9 && progressVal < 90){
      setProgressVal((progressVal) => progressVal+5);
    }else{
      setProgressVal((progressVal) => progressVal+2);
    }
    if ((message.includes("submit the conversation now") || message.includes("आप अगले कदमों के लिए चैट सबमिट कर सकते हैं।")) && !conversationCompleted) {
      setProgressVal(100);
      setConversationCompleted(true);
    }
  }, [message, messageNo, conversationCompleted, setConversationCompleted]);

  return (
    <div className='h-[50vh] w-2/3 flex flex-col justify-center items-center'>
      {
        message !== ""  && 
        <div className="w-full">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h3 className="text-white">
            Completed
          </h3>
          <h3 className="text-white">
            {progressVal > 100 ? "99" : progressVal}%
          </h3>
        </div>
        <Progress value={progressVal} color="blue" className="bg-transparent" size="sm"/>
        </div>
      }
      <div className="relative h-[45vh] w-full flex items-center justify-center ">
          <div className="w-4/5 flex justify-center items-center h-auto bg-transparent rounded-xl p-2">
            {audioURL &&
              <ReactPlayer url={audioURL} playing width={0} onEnded={conversationCompleted ? ()=>{console.log("Conversation completed!");} : handleStart} />
            }
              <Message loading={loading} message={message} />
          </div>
      </div>
    </div>
  )
}
