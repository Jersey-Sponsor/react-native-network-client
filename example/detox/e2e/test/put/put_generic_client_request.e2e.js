// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// *******************************************************************
// - [#] indicates a test step (e.g. # Go to a screen)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element testID when selecting an element. Create one if none.
// *******************************************************************

import {Request} from '@support/server_api';
import testConfig from '@support/test_config';
import {GenericClientRequestScreen} from '@support/ui/screen';
import {
    customBody,
    customHeaders,
    performGenericClientRequest,
    verifyApiResponse,
    verifyResponseOverlay,
} from '../helpers';

describe('Put - Generic Client Request', () => {
    const testMethod = 'PUT';
    const testServerUrl = `${testConfig.serverUrl}/${testMethod.toLowerCase()}`;
    const testSiteUrl = `${testConfig.siteUrl}/${testMethod.toLowerCase()}`;
    const testHost = testConfig.host;
    const testStatus = 200;
    const testHeaders = {...customHeaders};
    const testBody = {...customBody};

    beforeAll(async () => {
        const apiResponse = await Request.apiPut({headers: testHeaders, body: testBody});
        await verifyApiResponse(apiResponse, testSiteUrl, testStatus, testHost, testMethod, testHeaders, testBody);

        await GenericClientRequestScreen.open();
        await GenericClientRequestScreen.putButton.tap();
    });

    it('should return a valid response', async () => {
        // # Perform generic client request
        await performGenericClientRequest({testUrl: testServerUrl, testHeaders, testBody});

        // * Verify response overlay
        await verifyResponseOverlay(testServerUrl, testStatus, testHost, testMethod, testHeaders, testBody);
    });
});
