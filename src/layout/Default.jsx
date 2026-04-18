import Header from "../component/Header";
import Footer from "../component/Footer";

export default function Default({ children }) {
    return (
        <div className="relative w-full max-w-md mx-auto h-screen flex flex-col overflow-hidden">
            <Header />
            <main className="overflow-auto px-2">
                {children}
            </main>
            <Footer />
        </div>
    )
}