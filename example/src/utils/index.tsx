// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";
import { Alert, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import GenericClient, {
    getOrCreateAPIClient,
    getOrCreateWebSocketClient,
} from "@mattermost/react-native-network-client";

export enum METHODS {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export enum UploadStatus {
    UPLOADING = "UPLOADING",
    FAILED = "FAILED",
    COMPLETED = "COMPLETED",
    POST_FAILED = "POST_FAILED",
}

export enum ClientType {
    GENERIC,
    API,
    WEBSOCKET,
}

export const parseHeaders = (headers: Header[]): ClientHeaders => {
    return headers
        .filter(({ key, value }) => key && value)
        .reduce((prev, cur) => ({ ...prev, [cur.key]: cur.value }), {} as any);
};

export const networkClientKeyExtractor = (item: NetworkClientItem) => {
    if ("baseUrl" in item.client) {
        return item.client.baseUrl;
    } else if ("url" in item.client) {
        return item.client.url;
    }

    return item.name;
};

const buildDefaultApiClientConfiguration = (headers: Record<string, string>): APIClientConfiguration => {
    const sessionConfiguration = {
        followRedirects: true,
        allowsCellularAccess: true,
        waitsForConnectivity: false,
        timeoutIntervalForRequest: 30,
        timeoutIntervalForResource: 30,
        httpMaximumConnectionsPerHost: 10,
        cancelRequestsOnUnauthorized: true,
    };
    const retryPolicyConfiguration = {
        type: undefined,
        retryLimit: 2,
        exponentialBackoffBase: 2,
        exponentialBackoffScale: 0.5,
    };
    const requestAdapterConfiguration = {
        bearerAuthTokenResponseHeader: "token",
    };

    const configuration: APIClientConfiguration = {
        headers,
        sessionConfiguration,
        retryPolicyConfiguration,
        requestAdapterConfiguration,
    };

    return configuration;
};

const createAPIClient = async (
    name: string,
    baseUrl: string,
    configuration: APIClientConfiguration,
    {validateUrl = true, isMattermostClient = false} = {},
): Promise<APIClientItem | null> => {
    try {
        const { client, created } = await getOrCreateAPIClient(
            baseUrl,
            configuration,
            validateUrl
        );

        if (!created) {
            Alert.alert(
                "Error",
                `A client for ${baseUrl} already exists`,
                [{ text: "OK" }],
                { cancelable: false }
            );

            return null;
        }

        return {
            name,
            client,
            type: ClientType.API,
            isMattermostClient,
        };
    } catch (e) {
        console.log(JSON.stringify(e));
        return null;
    }
};

const createMattermostAPIClient = async (): Promise<APIClientItem | null> => {
    const name = "Mattermost API";
    const baseUrl = "http://192.168.0.14:8065";
    const userAgent = await DeviceInfo.getUserAgent();
    const headers = {
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": userAgent,
    };
    const configuration = buildDefaultApiClientConfiguration(headers);

    return createAPIClient(name, baseUrl, configuration, {isMattermostClient: true});
};

const createJSONPlaceholderAPIClient = async (): Promise<APIClientItem | null> => {
    const name = "JSON Placeholder API";
    const baseUrl = "https://jsonplaceholder.typicode.com";
    const configuration = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    return createAPIClient(name, baseUrl, configuration);
};

const createMockserverAPIClient = async (): Promise<APIClientItem | null> => {
    const name = "Mockserver API";
    const baseUrl = Platform.OS === 'ios' ? "http://localhost:8080" : "http://10.0.2.2:8080";
    const headers = {
        "custom-header-1-key": "custom-header-1-value",
        "custom-header-2-key": "custom-header-2-value",
    };
    const configuration = buildDefaultApiClientConfiguration(headers);

    return createAPIClient(name, baseUrl, configuration, {validateUrl: false});
};

const createWebSocketClient = async (
    name: string,
    url: string,
    configuration: WebSocketClientConfiguration,
    {validateUrl = true, isMattermostClient = false} = {},
): Promise<WebSocketClientItem | null> => {
    try {
        const { client, created } = await getOrCreateWebSocketClient(
            url,
            configuration,
            validateUrl
        );
    
        if (!created) {
            Alert.alert(
                "Error",
                `A client for ${url} already exists`,
                [{ text: "OK" }],
                { cancelable: false }
            );
    
            return null;
        }
    
        return {
            name,
            client,
            type: ClientType.WEBSOCKET,
            isMattermostClient,
        };
    } catch (e) {
        console.log(JSON.stringify(e));
        return null;
    }
};

const createMattermostWebSocketClient = async (): Promise<WebSocketClientItem | null> => {
    const name = "Mattermost Web Socket";
    const host = "ws://192.168.0.14:8065";
    const url = `${host}/api/v4/websocket`;
    const configuration: WebSocketClientConfiguration = {
        headers: {
            origin: host,
        },
    };

    return createWebSocketClient(name, url, configuration, {isMattermostClient: true});
};

export const createTestClients = async (): Promise<NetworkClientItem[]> => {
    return [
        { name: "Generic", client: GenericClient, type: ClientType.GENERIC },
        await createMattermostAPIClient(),
        await createJSONPlaceholderAPIClient(),
        await createMockserverAPIClient(),
        await createMattermostWebSocketClient(),
    ].reduce((clients: NetworkClientItem[], client) => {
        if (client) {
            return [...clients, client];
        }

        return clients;
    }, []);
};

export const ClientContext = React.createContext({
    clients: [] as NetworkClientItem[],
    setClients: (() => {}) as React.Dispatch<
        React.SetStateAction<NetworkClientItem[]>
    >,
});
