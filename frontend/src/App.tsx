import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { NetworkBanner } from "@/components/NetworkBanner";
import { HomePage } from "@/pages/Home";
import { MarketPage } from "@/pages/Market";

export function App() {
  return (
    <>
      <Header />
      <NetworkBanner />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/market/:id" element={<MarketPage />} />
        </Routes>
      </main>
    </>
  );
}
