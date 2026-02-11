import { useEffect, useMemo, useState } from "react";
import Layout from "../../Shared/Layout";
import { apiClient } from "../../Shared/apiClient";
import type { DashboardSummary, TransactionRow } from "../../Shared/types";
import SpendingPieChart from "../../Shared/SpendingPieChart";

import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  HStack,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
  AbsoluteCenter,
  Center,
} from "@chakra-ui/react";

function negativeCheck(amountValue: number){
  if (amountValue>=0){
    return "accent.400";
  }
  else{
    return "negatives.400";
  }
}

function formatMoney(amountValue: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountValue);
}

function formatDate(dateValue: string): string {
  // expects yyyy-mm-dd; if you store ISO, slice it before sending or handle here
  return dateValue;
}

function safeText(textValue: string): string {
  const cleanValue = (textValue ?? "").trim();
  return cleanValue.length ? cleanValue : "—";
}

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionRow[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>("");

  const netTone = useMemo(() => {
    if (!summaryData) return "neutral";
    if (summaryData.netTotal > 0) return "good";
    if (summaryData.netTotal === 0) return "warn";
    return "bad";
  }, [summaryData]);

  async function loadDashboardData(): Promise<void> {
    setIsLoading(true);
    setErrorText("");

    try {
      // Adjust endpoints to match your backend naming
      const summaryValue = await apiClient.get<DashboardSummary>(
        "/api/v1/dashboard/summary",
      );
      const transactionsValue = await apiClient.get<TransactionRow[]>(
        "/api/v1/dashboard/recent-transactions?limit=8",
      );

      setSummaryData(summaryValue);
      setRecentTransactions(transactionsValue);
    } catch (errValue) {
      setErrorText(
        errValue instanceof Error ? errValue.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboardData();
  }, []);

  // Chakra “surface” styles using your palette (brand + accent from theme.ts)
  const pageBg = "brand.100";
  const cardBg = "brand.50";
  const cardBorder = "blackAlpha.100";
  const subtleText = "brand.700";
  const strongText = "brand.900";

  const netBadgeColor = useMemo(() => {
    if (netTone === "good") return { bg: "accent.500", color: "brand.900" };
    if (netTone === "warn") return { bg: "brand.100", color: "brand.700" };
    if (netTone === "bad") return { bg: "negatives.400", color: "white" };
    return { bg: "blackAlpha.100", color: "brand.700" };
  }, [netTone]);

  return (
    <Layout activePage="dashboard">
      <Box bg={pageBg} minH="calc(100vh - 1px)">
        <Container maxW="6xl" py={{ base: 6, md: 10 }}>
          {/* Header (keeps your title/subtitle content) */}
          <Stack gap={2} mb={6}>
            <Heading size="lg" color={strongText}>
              Dashboard
            </Heading>

            <Text color={subtleText}>
              {summaryData
                ? `${summaryData.monthLabel} • Data as of ${summaryData.dataAsOf}`
                : "Loading overview…"}
            </Text>
          </Stack>

          {/* Error box (keeps retry) */}
          {errorText ? (
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="16px"
              p={4}
              mb={5}
            >
              <Text fontWeight={900} color={strongText} mb={1}>
                Dashboard failed to load
              </Text>
              <Text color={subtleText}>{errorText}</Text>

              <Button
                mt={3}
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                onClick={() => void loadDashboardData()}
              >
                Retry
              </Button>
            </Box>
          ) : null}

          {/* KPI Row (same KPI content, upgraded visuals) */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="18px"
              p={5}
            >
              <Text fontSize="sm" fontWeight={900} color="accent.400">
                Income
              </Text>
              <Text fontSize="2xl" fontWeight={900} color={strongText} mt={1}>
                {summaryData ? formatMoney(summaryData.incomeTotal) : "—"}
              </Text>
              <Text fontSize="sm" color={subtleText} mt={1}>
                Month-to-date
              </Text>
            </Box>

            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="18px"
              p={5}
            >
              <Text fontSize="sm" fontWeight={800} color="negatives.400">
                Spending
              </Text>
              <Text fontSize="2xl" fontWeight={900} color={strongText} mt={1}>
                {summaryData ? formatMoney(summaryData.spendingTotal) : "—"}
              </Text>
              <Text fontSize="sm" color={subtleText} mt={1}>
                Month-to-date
              </Text>
            </Box>

            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="18px"
              p={5}
            >
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontSize="sm" fontWeight={800} color="brand.400">
                    Net Growth
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight={900}
                    color={strongText}
                    mt={1}
                  >
                    {summaryData ? formatMoney(summaryData.netTotal) : "—"}
                  </Text>
                </Box>

                <Badge
                  borderRadius="999px"
                  px={3}
                  py={1}
                  bg={netBadgeColor.bg}
                  color={netBadgeColor.color}
                >
                  {netTone}
                </Badge>
              </HStack>

              <Text fontSize="sm" color={subtleText} mt={2}>
                Month-to-date
              </Text>
            </Box>
          </Grid>

          <Box h="1px" w="100%" bg="blackAlpha.100" my={6} />

          {/* Spending by category (keeps your pie chart section + component) */}
          
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            borderRadius="18px"
            p={{ base: 4, md: 5 }}
            mb={6}
            w="100%"
          >
            <HStack justify="space-between" mb={1}>
              <Heading size="sm" color={strongText}>
                Spending by Category
              </Heading>
              <Badge
                bg="brand.100"
                color="brand.700"
                borderRadius="999px"
                px={3}
                py={1}
              >
                Month-to-date
              </Badge>
            </HStack>

            <Center>
              {/* keep your existing component so nothing breaks */}
              <SpendingPieChart />
            </Center>
          </Box>
          {/* Recent transactions header (keeps link) */}
          <HStack justify="space-between" align="baseline" mb={3}>
            <Heading size="sm" color={strongText}>
              Recent transactions
            </Heading>

            {/* leaving your original route untouched */}
            <Link
              href="/Transactions.html"
              color="brand.600"
              fontWeight={800}
              _hover={{ textDecoration: "none" }}
            >
              View all →
            </Link>
          </HStack>

          {/* Transactions table (same data + columns, nicer container) */}
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            borderRadius="18px"
            overflow="hidden"
          >
            {isLoading ? (
              <HStack p={5} gap={3}>
                <Spinner />
                <Text color={subtleText}>Loading transactions…</Text>
              </HStack>
            ) : (
              <Box overflowX="auto" p="20px">
                <Box as="table" width="100%">
                  <Box as="thead">
                    <Box as="tr">
                      <Box as="th" textAlign="left" py={2} color={subtleText}>
                        Date
                      </Box>
                      <Box as="th" textAlign="left" py={2} color={subtleText}>
                        Description
                      </Box>
                      <Box as="th" textAlign="left" py={2} color={subtleText}>
                        Category
                      </Box>
                      <Box as="th" textAlign="right" py={2} color={subtleText}>
                        Amount
                      </Box>
                    </Box>
                  </Box>

                  <Box as="tbody">
                    {recentTransactions.map((row) => (
                      <Box
                        as="tr"
                        key={row.transactionId}
                        color={subtleText}
                        _hover={{ bg: "blackAlpha.50" }}
                        
                      >
                        <Box as="td" py={2}>
                          {formatDate(row.date)}
                        </Box>
                        <Box as="td" py={2} fontWeight={700}>
                          {safeText(row.name)}
                        </Box>
                        <Box as="td" py={2}>
                          <Badge bg="brand.100" color="brand.700">
                            {safeText(row.category)}
                          </Badge>
                        </Box>
                        <Box as="td" py={2} color={negativeCheck(row.amount)} textAlign="right" fontWeight={800}>
                          {formatMoney(row.amount)}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}
