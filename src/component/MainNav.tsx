import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu";
export function MainNav() {
  return (
    <div className="flex gap-4">
      <div className="text-3xl items-start">校正エディタ</div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem></NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
