import { MainNav } from "./MainNav";

export default function Header() {
  return (
    <header className="sticky flex justify-center border-b">
      <div className="flex items-center justify-between w-full h-16 px-4 sm:px-6">
        <MainNav />
      </div>
    </header>
  );
}
