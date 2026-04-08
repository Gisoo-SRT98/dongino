import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="overflow-auto px-2">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
