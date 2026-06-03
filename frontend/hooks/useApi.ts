/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";

interface ApiRequestOptions<TBody = unknown> {
  url: string;
  method?: Method;
  body?: TBody;
  queryParams?: Record<string, string | number | boolean>;
  urlParams?: Record<string, string | number>;
  headers?: Record<string, string>;
}

interface ApiState<TResponse> {
  data: TResponse | null;
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useApi = <TResponse = unknown>() => {
  const [state, setState] = useState<ApiState<TResponse>>({
    data: null,
    loading: false,
    success: false,
    error: null,
    message: null,
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      success: false,
      error: null,
      message: null,
    });
  }, []);

  const request = useCallback(
    async <TBody = unknown>({
      url,
      method = "GET",
      body,
      queryParams,
      urlParams,
      headers,
    }: ApiRequestOptions<TBody>): Promise<TResponse | null> => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          success: false,
          error: null,
        }));

        let finalUrl = url;

        if (urlParams) {
          Object.entries(urlParams).forEach(([key, value]) => {
            finalUrl = finalUrl.replace(
              `:${key}`,
              encodeURIComponent(String(value))
            );
          });
        }

        const config: AxiosRequestConfig = {
          baseURL: API_BASE_URL,
          url: finalUrl,
          method,
          params: queryParams,
          data: body,
          headers,
        };

        const response: AxiosResponse<TResponse> =
          await axios(config);

        const successMessage =
          (response.data as any)?.message ||
          "Request completed successfully";

        setState({
          data: response.data,
          loading: false,
          success: true,
          error: null,
          message: successMessage,
        });

        return response.data;
      } catch (error) {
        const err = error as AxiosError<any>;

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Something went wrong";

        setState((prev) => ({
          ...prev,
          loading: false,
          success: false,
          error: errorMessage,
          message: null,
        }));

        return null;
      }
    },
    []
  );

  return {
    ...state,
    request,
    reset,
  };
};