import { Link } from "react-router-dom";


export default function NotFoundPage(){
   return(
    <div>
        <p>404 Page Not Found</p>
        <Link to="/">Go back to Home</Link>
    </div>
   ) 
}