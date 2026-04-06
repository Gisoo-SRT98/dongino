import Header from "./Header";
import Footer from "./Footer";
import GroupList from "./GroupList";

export default function App() {
  return (
    <div className="relative w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="overflow-auto px-2">
        <GroupList />
      </main>
      <Footer />
    </div>
  );
}
