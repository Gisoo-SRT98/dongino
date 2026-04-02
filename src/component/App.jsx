import Header from "./Header";
import Footer from "./Footer";
import GroupList from "./GroupList";

export default function App() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen p-3 border border-gray-200 rounded-xl">
      <Header />
      <GroupList />
      <Footer />
    </div>
  );
}
