import { useEffect, useState } from "react";

export default function HomePage(){
     const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  
    return(
        <div>
            Homepage
            <p>Backend says {message}</p>
        </div>
    );
}