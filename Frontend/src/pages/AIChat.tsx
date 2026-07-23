// components/BudgetAgentChat.tsx
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChat() {
  const [input, setInput] = useState('');
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setDisplayMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory
        })
      });

      const data = await res.json();

      if (data.error) {
        setDisplayMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setDisplayMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        setConversationHistory(data.messages); // carry full history forward for context
      }
    } catch (err) {
      setDisplayMessages(prev => [...prev, { role: 'assistant', content: "Couldn't reach the assistant. Try again."}]);
      console.log(err)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="agent-chat">
      <div className="messages">
        {displayMessages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message assistant loading">Thinking…</div>}
      </div>

      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Ask about your spending…"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

// import { useState } from "react"

// export default function AIChat(){

//     interface Message{
//         role: 'user' | 'assistant';
//         content: string;
//     }

//     const [userMessage, setUserMessage] = useState("")
//     const [conversationHistory , setConversationHistory] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [displayMessages, setDisplayMessages] = useState<Message[]>([]);

//     const handleSubmit = async (e: React.FormEvent){
//         e.preventDefault();
//         setLoading(true);

//         try{
//             const res = await fetch("/api/agent", {
//                 method: "POST",
//                 headers: {"Content-Type":"application/json"},
//                 body: JSON.stringify({ 
//                     message: userMessage,
//                     conversationHistory: conversationHistory
//                 })
//             })



//         }
//         catch(error){

//         }
//     }

//     return(
//         <div>
//             {/* conversation history */}
//             <div>

//             </div>

//             {/* chat */}
//             <div>
//                 <form onSubmit={handleSubmit}>
//                     <div>
//                         <input className="w-full border-b border-rule bg-transparent py-1.5 focus:outline-none focus:border-b-2 focus:border-accent" type="text" value={userMessage} onChange={(e)=>{setUserMessage(e.target.value)}} />
//                         <button type="submit" disabled={loading} >{loading ? "Loading" : "Ask"}</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }