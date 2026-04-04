import Header from "./Header";
import Footer from "./Footer";
import GroupList from "./GroupList";

export default function App() {
  return (
    <div className="relative w-full max-w-md mx-auto h-screen flex flex-col border border-gray-200 rounded-xl overflow-hidden">
      <Header />
      <main className="overflow-auto mb-18">
        <GroupList />
      </main>
      <Footer />
    </div>
  );
}
