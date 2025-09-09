import { MainNav } from "./MainNav";

export default function Header() {
  return (
    <header className="sticky flex justify-center border-b">
      <div className="flex items-center justify-between w-full h-16 max-w-3xl px-4 mx-auto sm:px-6">
        <MainNav />
      </div>
    </header>
  );
}
