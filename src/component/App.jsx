import { useNavigate } from "react-router-dom";
import Default from "../layout/Default";

export default function App() {
  const navigate = useNavigate();

  return (
   
   <Default>
        <div className="flex flex-col gap-2 mb-4">
          <button
            onClick={() => navigate("/new-group")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            ساخت گروه جدید
          </button>
          <button
            onClick={() => navigate("/my-groups")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            لیست گروه های من
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            پروفایل
          </button>
        </div>
   </Default>
   
  );
}
