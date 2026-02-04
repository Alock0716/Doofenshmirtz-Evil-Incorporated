import type { ReactNode } from "react";

type LayoutProps = {
  activePage:
    | "dashboard"
    | "budgets"
    | "transactions"
    | "analytics"
    | "accounts";
  children: ReactNode;
};

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Text,
} from "@chakra-ui/react";

type NavItem = {
  label: string;
  href: string;
  isActive?: boolean;
};

function NavLink(navItem: NavItem) {
  return (
    <Link
      href={navItem.href}
      px={3}
      py={2}
      borderRadius="md"
      fontSize="sm"
      fontWeight={800}
      color={navItem.isActive ? "brand.600" : "textMuted"}
      bg={navItem.isActive ? "rgba(146,130,186,0.14)" : "transparent"}
      _hover={{
        textDecoration: "none",
        bg: "rgba(93,200,155,0.14)",
        color: "textStrong",
      }}
      whiteSpace="nowrap"
    >
      {navItem.label}
    </Link>
  );
}

export function TopNav(props: {activePage : String}) {
  const { activePage } = props;

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", isActive: activePage === "dashboard" },
    { label: "Budgets", href: "/budgets", isActive: activePage === "budgets" },
    { label: "Transactions", href: "/transactions", isActive: activePage === "transactions" },
    { label: "Analytics", href: "/analytics", isActive: activePage === "analytics" },
    { label: "Account", href: "/account", isActive: activePage === "account" },
  ];

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={50}
      bg="accent.300"
      borderBottomWidth="1px"
      borderColor="borderSubtle"
      boxShadow="sm"
    >
      <Container maxW="6xl" py={3}>
        <Flex align="center" justify="space-between" gap={4}>
          {/* Left: Brand + Logo Slot */}
          <HStack gap={3} minW="fit-content">
            <Box
              w="44px"
              h="44px"
              borderRadius="lg"
              bg="rgba(146,130,186,0.18)"
              borderWidth="1px"
              borderColor="rgba(111,101,160,0.35)"
              display="grid"
              placeItems="center"
              fontWeight={900}
              color="brand.600"
              letterSpacing="0.5px"
              flexShrink={0}
            >
              LOGO
            </Box>

            <Box lineHeight={1.1}>
              <Text fontWeight={900} color="textStrong">
                Income Generate-Inator
              </Text>
              <Text fontSize="sm" color="textMuted">
                Personal finance dashboard
              </Text>
            </Box>
          </HStack>

          {/* Center: Links (spread out) */}
          <HStack
            gap={2}
            flex={1}
            justify="center"
            display={{ base: "none", md: "flex" }}
          >
            {navItems.map((navItem) => (
              <NavLink
                key={navItem.href}
                label={navItem.label}
                href={navItem.href}
                isActive={navItem.isActive}
              />
            ))}
          </HStack>

          {/* Right: Actions */}
          <HStack gap={2} minW="fit-content">
            <Button
              variant="outline"
              borderColor="rgba(111,101,160,0.35)"
              _hover={{ bg: "rgba(146,130,186,0.10)" }}
              fontWeight={900}
              borderRadius="md"
              size="sm"
              onClick={() => console.log("sync")}
            >
              Sync
            </Button>

            <Button
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
              borderRadius="md"
              size="sm"
              fontWeight={900}
              as="a"
              reference-path="/logout"
            >
              Log out
            </Button>
          </HStack>
        </Flex>

        {/* Mobile nav row (shows under header on small screens) */}
        <Box display={{ base: "block", md: "none" }} mt={3}>
          <HStack gap={2} overflowX="auto" pb={2}>
            {navItems.map((navItem) => (
              <NavLink
                key={navItem.href}
                label={navItem.label}
                href={navItem.href}
                isActive={navItem.isActive}
              />
            ))}
          </HStack>
        </Box>
      </Container>
    </Box>


  );
}

export default function Layout({ activePage, children }: LayoutProps) {
  return (
    <div className="layoutRoot">
      {/* Sidebar */}
      
      {TopNav({activePage})}

      {/* Main content */}
      <section className="mainContent">
        {children}
      </section>
    </div>
  );
}