/// <reference types="cypress"/>
Cypress.on('uncaught:exception', () => false); // Catch errors

// Use command npm run test:all to run in three browsers "Chrome, Edge, Firefox"

/**
 * Function to calculate accuracy based on results
 * @param {object} results - The results object containing necessary data
 * @returns {number} - The calculated accuracy
 */
const calculateAccuracy = (results) => {
    // Log results for debugging
    console.log('Results:', results);

    // Ensure total and correct are defined and greater than 0
    const total = results.total || 0;
    const correct = results.correct || 0;

    // Calculate accuracy
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Log accuracy for debugging
    console.log('Calculated Accuracy:', accuracy);

    return accuracy;
};

// Example usage of calculateAccuracy
const results = { total: 100, correct: 90 };
const accuracy = calculateAccuracy(results);
console.log(`Accuracy: ${accuracy}%`);

// Describe block for grouping related tests for POST ID Scan API for successID_CARD
describe('POST ID Scan API Test/successID_CARD', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data).to.have.property('status');
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data).to.have.property('errors');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data).to.have.property('id');
        expect(jsonData.data.id).to.eql(expectedId);
    };

    // Test case to perform an ID scan request successfully
    it('should perform an ID scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('API_KEY'),
            },
            body: {
                "redirect_success": "https://www.google.com/?q=success",
                "redirect_failure": "https://www.bing.com/?q=failure",
                "relay_state": "internal-user-id",
                "gpdr_user_id": "gdpr-user-id",
                "webhook": "https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef",
                "metadata": {
                    "analysis_types": [
                        "Document"
                    ],
                }
            }
        }).then((response) => {
            // Log full response for debugging
            cy.log(`Status code: ${response.status}`);
            cy.log(`Response: ${JSON.stringify(response.body)}`);

            const jsonData = response.body;
            const statusCode = response.status;
            const isSuccessfulStatusCode = statusCode >= 200 && statusCode < 300;

            if (isSuccessfulStatusCode) {
                // Save sessionId and redirectUrl to Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                // Verify the JSON data
                verifyJsonData(jsonData);

                // Visit the redirect URL
                cy.visit(jsonData.data.redirect_url);
                // Interact with the web page
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(3)').click();
                // Upload the front side of the ID card
                const filePath1 = 'image0.jpeg';
                // Load the fixture file as a base64 string
                cy.fixture(filePath1, 'base64').then((fileContent) => {
                    // Convert the base64 string to a Blob object
                    const frontBlob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
                    // Create a new DataTransfer object and add the File to it
                    const frontFile = new File([frontBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);
                    // Set the File object on the input element
                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));
                        cy.get('.btn-primary').should('be.visible').click();
                        cy.wait(5000);
                    });
                });
            } else {
                // Throw an error if the status code is unexpected
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });
});

// Describe block for grouping related tests for GET ID Scan API for successID_CARD
describe('GET ID Scan API Test success/ID_CARD', () => {
    // Before hook to perform a GET request to the specified URL with the given session ID and API key
    let jsonData;
    before(() => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');

        // Log URL and headers for debugging
        cy.log(`GET URL: ${getUrl}/${sessionId}`);
        cy.log(`Authorization: ${apiKey}`);

        expect(getUrl, 'GET_URL environment variable').to.not.be.undefined;
        expect(sessionId, 'sessionId environment variable').to.not.be.undefined;
        expect(apiKey, 'API_KEY environment variable').to.not.be.undefined;

        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('API_KEY'),
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log full response for debugging
            cy.log(`Status code: ${response.status}`);
            cy.log(`Response: ${JSON.stringify(response.body)}`);
            // Assign the response body to jsonData
            jsonData = response.body;
        });
    });

    // Test case to check if request data is retrieved successfully
    it('Check if request data is retrieved successfully', () => {
        expect(jsonData.data.request_data.redirect_failure).to.equal("https://www.bing.com/?q=failure");
        expect(jsonData.data.request_data.redirect_success).to.equal("https://www.google.com/?q=success");
        expect(jsonData.data.request_data.locale).to.equal("EN");
        expect(jsonData.data.request_data.relay_state).to.equal("internal-user-id");
        expect(jsonData.data.request_data.webhook).to.equal("https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef");
    });

    /**
     * Function to verify the status in the JSON data
     * @param {object} jsonData - The JSON data to verify
     */
    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.be.eq("Declined");
    };

    /**
     * Function to verify there are no errors in the JSON data
     * @param {object} jsonData - The JSON data to verify
     */
    const verifyNoError = (jsonData) => {
        expect(jsonData.data.errors).to.be.eql([]);
    };

    /**
     * Function to verify the identity in the document analysis
     * @param {object} jsonData - The JSON data to verify
     */
    const verifyAnalysisImagesIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity).to.not.be.undefined;
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('');
    };

    /**
     * Function to verify the identity in the document analysis in English
     * @param {object} jsonData - The JSON data to verify
     */
    const verifyAnalysisImagesIdenfityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish).to.not.be.undefined;
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.personalNumber).to.eql('');
    };

    /**
     * Function to verify the overall status in the document analysis
     * @param {object} jsonData - The JSON data to verify
     */
    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };

    /**
     * Function to verify the document type in the document analysis
     * @param {object} jsonData - The JSON data to verify
     */
    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType).to.not.be.undefined;
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.eq('Sweden - Driving License (2013)');
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.eq('2013');
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.eq('Sweden');
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
    };

    // Test case to verify the status
    it('Verify Error', () => {
        verifyStatus(jsonData);
    });

    // Test case to verify there are no errors
    it('verify Status', () => {
        verifyNoError(jsonData);
    });

    // Test case to verify the identity in the document analysis
    it('verify Analysis Images Idenfity', () => {
        verifyAnalysisImagesIdenfity(jsonData);
    });

    // Test case to verify the identity in the document analysis in English
    it('verify Analysis Images Idenfity English', () => {
        verifyAnalysisImagesIdenfityEnglish(jsonData);
    });

    // Test case to verify the overall status in the document analysis
    it('verify Document Analysis Overall Status', () => {
        verifyDocumentAnalysisOverallStatus(jsonData);
    });

    // Test case to verify the document type in the document analysis
    it('Verify Analysis Document Type', () => {
        verifyAnalysisDocumentType(jsonData);
    });
});