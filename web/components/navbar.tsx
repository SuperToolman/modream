"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
  MinimizeIcon,
  MaximizeIcon,
  CloseIcon,
} from "@/components/icons";
import { windowControls, isTauri } from "@/lib/tauri";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar
      maxWidth="full"
      position="static"
      className="px-0 flex-shrink-0 relative z-10"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 左侧内容 - 品牌和导航 */}
      <NavbarContent
        className="flex-none"
        justify="start"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* 中间搜索框 */}
      <NavbarContent
        className="flex-1 hidden lg:flex"
        justify="center"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <NavbarItem
          className="w-full max-w-md"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          {searchInput}
        </NavbarItem>
      </NavbarContent>

      {/* 右侧内容 - 社交图标、主题切换和窗口控制 */}
      <NavbarContent
        className="flex-none"
        justify="end"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <NavbarItem
          className="hidden sm:flex gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <Link isExternal aria-label="Twitter" href={siteConfig.links.twitter}>
            <TwitterIcon className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Discord" href={siteConfig.links.discord}>
            <DiscordIcon className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem
          className="hidden md:flex"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button>
        </NavbarItem>

        {/* 窗口控制按钮 - 临时强制显示用于测试 */}
        <NavbarItem
          className="flex gap-1 ml-2"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-8 w-8 h-8 hover:bg-default-200 flex items-center justify-center"
            onPress={() => {
              console.log('Minimize clicked, isTauri:', isTauri());
              if (isTauri()) {
                windowControls.minimize();
              } else {
                console.log('Not in Tauri environment');
              }
            }}
          >
            <MinimizeIcon size={12} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-8 w-8 h-8 hover:bg-default-200 flex items-center justify-center"
            onPress={() => {
              console.log('Maximize clicked, isTauri:', isTauri());
              if (isTauri()) {
                windowControls.toggleMaximize();
              } else {
                console.log('Not in Tauri environment');
              }
            }}
          >
            <MaximizeIcon size={12} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-8 w-8 h-8 hover:bg-red-500 hover:text-white flex items-center justify-center"
            onPress={() => {
              console.log('Close clicked, isTauri:', isTauri());
              if (isTauri()) {
                windowControls.close();
              } else {
                console.log('Not in Tauri environment');
              }
            }}
          >
            <CloseIcon size={12} />
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
