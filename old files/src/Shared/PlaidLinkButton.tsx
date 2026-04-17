// File: src/Shared/PlaidLinkButton.tsx

import { useCallback, useEffect, useState } from "react";
import { Button, Spinner, Text, VStack } from "@chakra-ui/react";
import { usePlaidLink } from "react-plaid-link";
import { apiClient } from "./apiClient";
import type {
  PlaidExchangeResponse,
  PlaidLinkTokenResponse,
} from "./types";

type PlaidLinkButtonProps = {
  buttonLabelValue?: string;
  onLinkedValue?: () => void | Promise<void>;
};

/**
 * PlaidLinkButton
 * Inputs:
 * - buttonLabelValue: optional label for the button
 * - onLinkedValue: optional callback fired after a successful token exchange
 *
 * Output:
 * - React component that opens Plaid Link
 *
 * Purpose:
 * - creates a link token from the backend
 * - launches Plaid Link
 * - exchanges the returned public token through the backend
 * - notifies the parent so dashboard/account data can refresh
 */
export default function PlaidLinkButton({
  buttonLabelValue = "Link Bank Account",
  onLinkedValue,
}: PlaidLinkButtonProps) {
  // This state stores the temporary Plaid link token used to initialize Link.
  const [linkTokenValue, setLinkTokenValue] = useState<string>("");

  // This state tracks whether the component is creating the token or exchanging it.
  const [isLoadingValue, setIsLoadingValue] = useState<boolean>(false);

  // This state stores any user-visible error text from token creation or exchange.
  const [errorTextValue, setErrorTextValue] = useState<string>("");

  /**
   * loadLinkTokenValue
   * Inputs: none
   * Output: Promise<void>
   * Purpose: requests a fresh Plaid link token from the backend.
   */
  const loadLinkTokenValue = useCallback(async (): Promise<void> => {
    setIsLoadingValue(true);
    setErrorTextValue("");

    try {
      const responseValue =
        await apiClient.post<PlaidLinkTokenResponse>("/api/v1/plaid/create-link-token", {});
      setLinkTokenValue(responseValue.linkToken);
    } catch (errValue) {
      setErrorTextValue(
        errValue instanceof Error ? errValue.message : "Failed to create Plaid link token.",
      );
    } finally {
      setIsLoadingValue(false);
    }
  }, []);

  useEffect(() => {
    void loadLinkTokenValue();
  }, [loadLinkTokenValue]);

  /**
   * handlePlaidSuccessValue
   * Inputs:
   * - publicTokenValue: temporary public token returned by Plaid Link
   * - metadataValue: metadata about the institution/accounts selected
   *
   * Output: Promise<void>
   * Purpose: sends the public token to the backend so it can be exchanged
   * for a Plaid access token and persisted for the signed-in user.
   */
  async function handlePlaidSuccessValue(
    publicTokenValue: string,
    metadataValue: unknown,
  ): Promise<void> {
    setIsLoadingValue(true);
    setErrorTextValue("");

    try {
      await apiClient.post<PlaidExchangeResponse>("/api/v1/plaid/exchange-public-token", {
        publicToken: publicTokenValue,
        metadata: metadataValue,
      });

      if (onLinkedValue) {
        await onLinkedValue();
      }

      // Plaid link tokens are single-use, so request a fresh one after success.
      await loadLinkTokenValue();
    } catch (errValue) {
      setErrorTextValue(
        errValue instanceof Error ? errValue.message : "Failed to exchange Plaid token.",
      );
    } finally {
      setIsLoadingValue(false);
    }
  }

  const { open, ready } = usePlaidLink({
    token: linkTokenValue || null,
    onSuccess: (publicTokenValue, metadataValue) => {
      void handlePlaidSuccessValue(publicTokenValue, metadataValue);
    },
    onExit: (errorValue) => {
      if (errorValue?.display_message) {
        setErrorTextValue(errorValue.display_message);
      }
    },
  });

  return (
    <VStack align="stretch" gap={2}>
      <Button
        onClick={() => open()}
        disabled={!ready || !linkTokenValue || isLoadingValue}
        bg="accent.400"
        color="brand.900"
        _hover={{ opacity: 0.92 }}
        fontWeight={900}
      >
        {isLoadingValue ? <Spinner size="sm" /> : buttonLabelValue}
      </Button>

      {errorTextValue ? (
        <Text fontSize="sm" color="negatives.400" fontWeight={700}>
          {errorTextValue}
        </Text>
      ) : null}
    </VStack>
  );
}