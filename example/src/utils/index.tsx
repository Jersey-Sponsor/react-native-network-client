// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { Alert } from "react-native";
import DeviceInfo from "react-native-device-info";
import { getOrCreateAPIClient } from "@mattermost/react-native-network-client";

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

export const parseHeaders = (headers: Header[]): ClientHeaders => {
    return headers
        .filter(({ key, value }) => key && value)
        .reduce((prev, cur) => ({ ...prev, [cur.key]: cur.value }), {} as any);
};

export const networkClientKeyExtractor = (item: NetworkClientItem) => {
    if ("baseUrl" in item.client) {
        return item.client.baseUrl;
    } else if ("wsUrl" in item.client) {
        return item.client.wsUrl;
    }

    return item.name;
};

const createMattermostAPIClient = async (): Promise<APIClientItem | null> => {
    const name = "Mattermost";
    const baseUrl = "https://community.mattermost.com";
    const userAgent = await DeviceInfo.getUserAgent();
    const headers = {
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": userAgent,
    };
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

    const options: APIClientConfiguration = {
        headers,
        sessionConfiguration,
        retryPolicyConfiguration,
        requestAdapterConfiguration,
    };

    try {
        const { client, created } = await getOrCreateAPIClient(
            baseUrl,
            options
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
            isMattermostClient: true,
        };
    } catch (e) {
        console.log(JSON.stringify(e));
        return null;
    }
};

const createJSONPlaceholderAPIClient = async (): Promise<APIClientItem | null> => {
    const name = "JSON Placeholder";
    const baseUrl = "https://jsonplaceholder.typicode.com";
    const options = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const { client, created } = await getOrCreateAPIClient(baseUrl, options);

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
    };
};

export const createTestClients = async (): Promise<NetworkClientItem[]> => {
    return [
        await createMattermostAPIClient(),
        await createJSONPlaceholderAPIClient(),
    ].reduce((clients: NetworkClientItem[], client) => {
        if (client) {
            return [...clients, client];
        }

        return clients;
    }, []);
};
