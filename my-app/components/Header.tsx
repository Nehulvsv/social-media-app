import { userData } from "../utils/mockData";
import { UserCircle } from "lucide-react";
import { UserProfile } from "./UserProfile";
import { NavBar } from "./NavBar";

export function Header({username}) {
  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <UserProfile  username = {username}/>
      </div>
    </div>
  );
}
