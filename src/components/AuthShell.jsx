import Icon from "./Icon";
import Logo from "./Logo";

export default function AuthShell({ children, imgSeed, quote }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-linen p-12 relative overflow-hidden">
        <div className="absolute inset-0 grain-bg opacity-30" />
        <img src={`https://picsum.photos/seed/${imgSeed}/900/1200`} className="absolute inset-0 w-full h-full object-cover opacity-25" alt="" loading="lazy" />
        <div className="relative"><Logo variant="light" /></div>
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
