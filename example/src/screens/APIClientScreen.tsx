// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { Input, Button } from "react-native-elements";

import ListHeaders from "../components/ListHeaders";
import { METHODS } from "../utils";

export default function APIClientScreen({
    navigation,
    route,
}: APIClientScreenProps) {
    const { item } = route.params;
    const { client, name } = item;

    const [headers, setHeaders] = useState<Header[]>([]);

    const getRequest = () =>
        navigation.navigate("APIClientRequest", {
            item,
            method: METHODS.GET,
        });
    const putRequest = () =>
        navigation.navigate("APIClientRequest", {
            item,
            method: METHODS.PUT,
        });
    const postRequest = () =>
        navigation.navigate("APIClientRequest", {
            item,
            method: METHODS.POST,
        });
    const patchRequest = () =>
        navigation.navigate("APIClientRequest", {
            item,
            method: METHODS.PATCH,
        });
    const deleteRequest = () =>
        navigation.navigate("APIClientRequest", {
            item,
            method: METHODS.DELETE,
        });
    const uploadRequest = () =>
        navigation.navigate("APIClientUpload", { item });
    const mattermostUploadRequest = () =>
        navigation.navigate("MattermostClientUpload", { item });
    const fastImageRequest = () =>
        navigation.navigate("APIClientFastImage", { item });

    const buttons = [
        { title: METHODS.GET, onPress: getRequest },
        { title: METHODS.PUT, onPress: putRequest },
        { title: METHODS.POST, onPress: postRequest },
        { title: METHODS.PATCH, onPress: patchRequest },
        { title: METHODS.DELETE, onPress: deleteRequest },
        { title: "UPLOAD", onPress: uploadRequest },
        {
            title: "MATTERMOST UPLOAD",
            onPress: mattermostUploadRequest,
            hide: !item.isMattermostClient,
        },
        { title: "FAST IMAGE", onPress: fastImageRequest },
    ];

    useEffect(() => {
        client.getHeaders().then((clientHeaders) => {
            const headers = Object.entries(
                clientHeaders
            ).map(([key, value]) => ({ key, value }));
            setHeaders(headers);
        });
    }, []);

    return (
        <SafeAreaView>
            <ScrollView>
                <Input label="Name" value={name} disabled={true} />
                <Input
                    label="Base URL"
                    value={client.baseUrl}
                    disabled={true}
                />
                <ListHeaders headers={headers} />
                {buttons.map(({ title, onPress }) => (
                    <Button
                        key={`button-${title}`}
                        title={title}
                        onPress={onPress}
                        style={{ paddingHorizontal: 10, paddingVertical: 5 }}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
