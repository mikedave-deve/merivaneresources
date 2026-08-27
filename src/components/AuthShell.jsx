import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";
import Seo from "./Seo";

export default function AuthShell({ children, imgSeed, quote, title }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      {title && <Seo title={title} noindex />}
      <button
        onClick={() => navigate("/")}
        aria-label="Go to Merivane Resources home"
        className="absolute top-5 right-5 sm:top-6 sm:right-8 z-20 hover:opacity-80 transition-opacity"
      >
        <Logo variant="dark" size="sm" showTag={false} />
      </button>
      <div className="hidden lg:flex flex-col justify-between bg-ink text-linen p-12 relative overflow-hidden">
        <div className="absolute inset-0 grain-bg opacity-30" />
        <img src={`https://picsum.photos/seed/${imgSeed}/900/1200`} className="absolute inset-0 w-full h-full object-cover opacity-25" alt="" loading="lazy" />
        <button onClick={() => navigate("/")} aria-label="Go to Merivane Resources home" className="relative self-start hover:opacity-80 transition-opacity">
          <Logo variant="light" />
        </button>
        <div className="relative">
          <Icon name="quote" size={26} className="text-brassLight mb-3" />
          <p className="font-display text-2xl leading-snug">{quote}</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
