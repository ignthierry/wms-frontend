"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";


import { 
  FileText, 
  ArrowRightLeft, 
  AlertTriangle, 
  PackageSearch, 
  RefreshCcw, 
  ClipboardCheck, 
  Send, 
  CheckSquare, 
  Truck,
  Warehouse,
  Users,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; icon?: React.ReactNode; pro?: boolean; new?: boolean }[];
};

const internalStaffItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Inbound Management",
    subItems: [
      { name: "Pre-Advice / ASN List", path: "/inbound/asn", icon: <FileText className="w-4 h-4" /> },
      { name: "Goods Receiving", path: "/inbound/receiving", icon: <ArrowRightLeft className="w-4 h-4" /> },
      { name: "Inbound Deviation", path: "/inbound/deviation", icon: <AlertTriangle className="w-4 h-4" /> },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Inventory Management",
    subItems: [
      { name: "Stock Overview", path: "/inventory/stock", icon: <PackageSearch className="w-4 h-4" /> },
      { name: "Stock Transfer", path: "/inventory/transfer", icon: <RefreshCcw className="w-4 h-4" /> },
      { name: "Stock Opname", path: "/inventory/opname", icon: <ClipboardCheck className="w-4 h-4" /> },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Outbound Management",
    subItems: [
      { name: "Delivery Request", path: "/outbound/request", icon: <Send className="w-4 h-4" /> },
      { name: "Packing & Verification", path: "/outbound/packing", icon: <CheckSquare className="w-4 h-4" /> },
      { name: "Dispatch & Shipping", path: "/outbound/dispatch", icon: <Truck className="w-4 h-4" /> },
    ],
  },
];

const clientPortalItems: NavItem[] = [
  { icon: <GridIcon />, name: "My Dashboard", path: "/client/dashboard" },
  { icon: <PageIcon />, name: "Inbound Notice", path: "/client/inbound" },
  { icon: <BoxCubeIcon />, name: "My Inventory", path: "/client/inventory" },
  { icon: <ListIcon />, name: "Outbound Request", path: "/client/outbound" },
];

const superAdminItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Master Data",
    subItems: [
      { name: "Gudang & Layout", path: "/admin/master/warehouse", icon: <Warehouse className="w-4 h-4" /> },
      { name: "Klien / Customers", path: "/admin/master/clients", icon: <Users className="w-4 h-4" /> },
      { name: "Pengguna / RBAC", path: "/admin/master/users", icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  },
  { icon: <PlugInIcon />, name: "Configurations", path: "/admin/configurations" },
  { icon: <ListIcon />, name: "System Logs", path: "/admin/logs" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "internal" | "client" | "admin"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-brand-500 hover:text-white hover:shadow-md"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-white"
                      : "text-gray-500 group-hover:text-white"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "bg-brand-500 text-white shadow-md" : "text-gray-700 hover:bg-brand-500 hover:text-white hover:shadow-md"
                }`}
              >
                <span
                  className={`transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item group flex items-center gap-2 ${
                        isActive(subItem.path)
                          ? "bg-brand-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-brand-500 hover:text-white hover:shadow-sm"
                      }`}
                    >
                      {subItem.icon && (
                        <span className="transition-transform duration-300 group-hover:scale-125 group-hover:text-white">
                          {subItem.icon}
                        </span>
                      )}
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "internal" | "client" | "admin";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["internal", "client", "admin"].forEach((menuType) => {
      const items = menuType === "internal" ? internalStaffItems : menuType === "client" ? clientPortalItems : superAdminItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "internal" | "client" | "admin",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "internal" | "client" | "admin") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gray-100 dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <img 
              src="https://everwin-company-profile.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fheader_logo.50ada9d8.png&w=640&q=75" 
              alt="Everwin Logo" 
              className="h-7 w-auto object-contain" 
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-white font-bold text-sm">EW</span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Internal Staff"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(internalStaffItems, "internal")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Client Portal"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(clientPortalItems, "client")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Super Admin"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(superAdminItems, "admin")}
            </div>
          </div>
        </nav>

      </div>
    </aside>
  );
};

export default AppSidebar;
