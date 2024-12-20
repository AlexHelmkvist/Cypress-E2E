/// <reference types="cypress"/>
Cypress.on('uncaught:exception', () => false); // Catch errors
//Use command npm run test:all to run in three browsers "Chrome,Edge,Firefox"

describe('POST ID Scan API Test/ID_CARD', () => {
    // Function to verify the JSON data structure and value
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };
        // Send a POST request to the API
    it('should perform an ID scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('API_KEY')
            },
            body: {
                "redirect_success": "https://www.google.com/?q=success",
                "redirect_failure": "https://bing.com?q=failure",
                "relay_state": "my-internal-user-id",
                "gpdr_user_id": "my-gdpr-user-id",
                "webhook": "https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef",
                "metadata": {
                    "analysis_types": [
                        "Document"
                    ]
                }
            }
        }).then((response) => {
            // Save the response body to jsonData
            const statusCode = response.status;
            const isSuccessfulStatusCode = statusCode >= 200 && statusCode < 300;

            if (isSuccessfulStatusCode) {
                const jsonData = response.body;
                 // Save sessionId and redirectUrl to Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                // Verify the JSON data
                verifyJsonData(jsonData);
                // Visit the redirect URL
                cy.visit(jsonData.data.redirect_url);
                cy.wait(1000);
                // Interact with the web page
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(2)').click();
                // Upload the front side of the ID card
                const filePath1 = 'image0.jpeg';
                // Load the fixture file as a base64 string
                cy.fixture(filePath1, 'base64').then((fileContent) => {
                    // Convert the base64 string to a Blob object
                    const frontBlob = Cypress.Blob.base64StringToBlob(fileContent, 'image/png');
                    // Create a new DataTransfer object and add the File to it
                    const frontFile = new File([frontBlob], 'ID_card.png', { type: 'image/png' });
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);
                    // Set the File object on the input element
                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        // Dispatch a change event to trigger any event listeners
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));
                        cy.get('.btn-primary').click();
                    });
                });
            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });




});
describe('GET ID Scan API Test pending/ID_CARD', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };
     // Function to verify document analysis in the JSON data
    const verifyDocumentAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.documentAnalysis.images).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.ignoredErrorsInFields).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.excludedDocumentIds).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.status).to.eq('Requested');
    };
    // Function to verify liveness analysis in the JSON data
    const verifyLivenessAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.livenessAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.livenessAnalysis.status).to.eq('NotRequested');
    };
    // Function to verify face match analysis in the JSON data
    const verifyFaceMatchAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.faceMatchAnalysis.usedImages).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.status).to.eq('NotRequested');
    };



    it('GET-PENDING', () => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');

        expect(getUrl, 'GET_URL environment variable').to.not.be.undefined;
        expect(sessionId, 'sessionId environment variable').to.not.be.undefined;
        expect(apiKey, 'API_KEY environment variable').to.not.be.undefined;
        // Send a GET request to the API
        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log the status code and response body
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Handle different status codes
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Save sessionId and redirectUrl in Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        });
    });

    it('Verify status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyJsonData(jsonData);
    });

    it('Verify result documentAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysis(jsonData);
    });

    it('Verify result livenessAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyLivenessAnalysis(jsonData);
    });

    it('Verify result faceMatchAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyFaceMatchAnalysis(jsonData);
    });
});
describe('GET ID Scan API Test success/ID_CARD', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com/?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('SV');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.gdpr_user_id).to.equal('gdpr_user_id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };
    // Function to verify the status in the JSON data
    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };
    // Function to verify that there are no errors in the JSON data
    const NoErorr = (jsonData) => {
        expect(jsonData.data.errors).to.eql([]);
    };
    // Function to verify the analysis images in the JSON data
    const verifyAnalysisImages = (jsonData) => {
        const expectedAnalysisImages = Cypress.env('AnalysisImages');
        Cypress.env('AnalysisImages', jsonData.data.result.documentAnalysis.images[0].url);
        expect(jsonData.data.result.documentAnalysis.images[0].url).to.eql(expectedAnalysisImages);
        expect(jsonData.data.result.documentAnalysis.textResult.validityStatus).to.eql('None');
        expect(jsonData.data.result.documentAnalysis.summary.overallStatus).to.eql('Error');
        expect(jsonData.data.result.documentAnalysis.images[0].mimeType).to.eql('image/jpeg');

    };
    // Function to verify the identity analysis in the JSON data

    const verifyAnalysisImagesIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('');
        expect(jsonData.data.result.identity.dateOfBirth).to.eql('1989-07-09');
        expect(jsonData.data.result.documentAnalysis.identity.age).to.eql(35);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };
    // Function to verify identity information in English in the JSON data
    const verifyAnalysisImagesIdenfityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.personalNumber).to.eql('');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.dateOfBirth).to.eql('1989-07-09');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.age).to.eql(35);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
        expect(jsonData.data.result.documentAnalysis.documentType.type).to.eql('DRIVING_LICENSE');
    };
    // Function to verify the overall status of the document analysis in the JSON data
    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };
    // Function to verify the document type in the JSON data
    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.eq('Sweden - Driving License (2013)');
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.eq('2013');
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.eq('Sweden');
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
        expect(jsonData.data.result.documentAnalysis.documentType.hasMrz).to.eq(false);
    };




});
describe('POST ID Scan API Test/DRIVING_LICENSE', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };

    it('should perform an ID scan request successfully', () => {
        // Send a POST request to the API
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('API_KEY')
            },
            body: {
                "redirect_success": "https://www.google.com/?q=success",
                "redirect_failure": "https://bing.com?q=failure",
                "relay_state": "my-internal-user-id",
                "gpdr_user_id": "my-gdpr-user-id",
                "webhook": "https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef",
                "metadata": {
                    "analysis_types": [
                        "Document"
                    ]
                }
            }
        }).then((response) => {
            const statusCode = response.status;
            const isSuccessfulStatusCode = statusCode >= 200 && statusCode < 300;

            if (isSuccessfulStatusCode) {
                // Save the response body to jsonData
                const jsonData = response.body;
                // Save sessionId and redirectUrl to Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                // Verify the JSON data
                verifyJsonData(jsonData);
                // Visit the redirect URL
                cy.visit(jsonData.data.redirect_url);
                cy.wait(1000);
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(1)').click();
                // Upload the front side of the ID card
                const filePath1 = 'image1.jpeg';
                // Load the fixture file as a base64 string
                cy.fixture('image1.jpeg').then((filePath1) => {
                    // Convert the base64 string to a Blob object
                    const frontBlob = Cypress.Blob.base64StringToBlob(filePath1, 'image/jpeg');
                    // Create a new DataTransfer object and add the File to it
                    const frontFile = new File([frontBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);
                    // Set the File object on the input element
                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));

                    });


                });
                // Upload the back side of the ID card
                const filePath2 = 'image2.jpeg';
                // Load the fixture file as a base64 string
                cy.fixture('image2.jpeg').then((filePath2) => {
                    // Convert the base64 string to a Blob object
                    const backBlob = Cypress.Blob.base64StringToBlob(filePath2, 'image/jpeg');
                    // Create a new DataTransfer object and add the File to it
                    const backFile = new File([backBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                    // Create a new DataTransfer object and add the File to it
                    const backDataTransfer = new DataTransfer();
                    backDataTransfer.items.add(backFile);
                    // Set the File object on the input element
                    cy.get('input[type=file]').eq(1).then((input) => {
                        input[0].files = backDataTransfer.files;
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));
                        cy.get('.btn-primary').click();
                    });
                });
            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });

});
describe('GET ID Scan API Test pending/DRIVING_LICENSE', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };
    // Function to verify document analysis in the JSON data
    const verifyDocumentAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.documentAnalysis.images).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.ignoredErrorsInFields).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.excludedDocumentIds).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.status).to.eq('Requested');
    };
    // Function to verify liveness analysis in the JSON data
    const verifyLivenessAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.livenessAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.livenessAnalysis.status).to.eq('NotRequested');
    };
    // Function to verify face match analysis in the JSON data
    const verifyFaceMatchAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.faceMatchAnalysis.usedImages).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.status).to.eq('NotRequested');
    };



    it('GET-PENDING', () => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');

        expect(getUrl, 'GET_URL environment variable').to.not.be.undefined;
        expect(sessionId, 'sessionId environment variable').to.not.be.undefined;
        expect(apiKey, 'API_KEY environment variable').to.not.be.undefined;
        // Send a GET request to the API
        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log the status code and response body
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Handle different status codes
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Save sessionId and redirectUrl in Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        });
    });

    it('Verify status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyJsonData(jsonData);
    });

    it('Verify result documentAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysis(jsonData);
    });

    it('Verify result livenessAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyLivenessAnalysis(jsonData);
    });

    it('Verify result faceMatchAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyFaceMatchAnalysis(jsonData);
    });

});
describe('GET ID Scan API Test success/DRIVING_LICENSE', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com/?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('SV');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.gdpr_user_id).to.equal('gdpr_user_id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };
    // Function to verify the status in the JSON data
    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };
    // Function to verify that there are no errors in the JSON data
    const NoErorr = (jsonData) => {
        expect(jsonData.data.errors).to.eql([]);
    };
    // Function to verify the analysis images in the JSON data
    const verifyAnalysisImages = (jsonData) => {
        const expectedAnalysisImages = Cypress.env('AnalysisImages');
        Cypress.env('AnalysisImages', jsonData.data.result.documentAnalysis.images[0].url);
        expect(jsonData.data.result.documentAnalysis.images[0].url).to.eql(expectedAnalysisImages);
        expect(jsonData.data.result.documentAnalysis.textResult.validityStatus).to.eql('None');
        expect(jsonData.data.result.documentAnalysis.summary.overallStatus).to.eql('Error');
        expect(jsonData.data.result.documentAnalysis.images[0].mimeType).to.eql('image/jpeg');

    };
    // Function to verify the identity analysis in the JSON data
    const verifyAnalysisImagesIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('OHAN');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('ANDERSSON');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('ANDERSSON OHAN');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('');
        expect(jsonData.data.result.identity.dateOfBirth).to.eql('1966-02-02');
        expect(jsonData.data.result.documentAnalysis.identity.age).to.eql(58);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };
    // Function to verify identity information in English in the JSON data
    const verifyAnalysisImagesIdenfityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('OHAN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('ANDERSSON');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('ANDERSSON OHAN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.personalNumber).to.eql('');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.dateOfBirth).to.eql('1966-02-02');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.age).to.eql(58);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
        expect(jsonData.data.result.documentAnalysis.documentType.type).to.eql('DRIVING_LICENSE');
    };
    // Function to verify the overall status of the document analysis in the JSON data
    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };
    // Function to verify the document type in the JSON data
    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.eq('Sweden - Driving License (2007)');
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.eq('2007');
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.eq('Sweden');
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
        expect(jsonData.data.result.documentAnalysis.documentType.hasMrz).to.eq(false);
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
    };




});
describe('POST ID Scan API Test/PASS', () => {
    // Send a POST request to the API
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };

    it('should perform an ID scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('API_KEY')
            },
            body: {
                "redirect_success": "https://www.google.com/?q=success",
                "redirect_failure": "https://bing.com?q=failure",
                "relay_state": "my-internal-user-id",
                "gpdr_user_id": "my-gdpr-user-id",
                "webhook": "https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef",
                "metadata": {
                    "analysis_types": [
                        "Document"
                    ]
                }
            }
        }).then((response) => {
            const statusCode = response.status;
            const isSuccessfulStatusCode = statusCode >= 200 && statusCode < 300;

            if (isSuccessfulStatusCode) {
                // Save the response body to jsonData
                const jsonData = response.body;
                // Save sessionId and redirectUrl to Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                // Verify the JSON data
                verifyJsonData(jsonData);
                // Visit the redirect URL
                cy.visit(jsonData.data.redirect_url);
                cy.wait(1000);
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(2)').click();

                // Upload the front side of the passport
                const filePath1 = 'pass.png';
                // Load the fixture file as a base64 string
                cy.fixture('pass.png').then((filePath1) => {
                    // Convert the base64 string to a Blob object
                    const frontBlob = Cypress.Blob.base64StringToBlob(filePath1, 'image/png');
                    // Create a new File object from the Blob
                    const frontFile = new File([frontBlob], 'ID_card.png', { type: 'image/png' });
                    // Create a new DataTransfer object and add the File to it
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);
                    // Set the File object on the input element
                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        // Dispatch a change event to trigger any event listeners
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));
                        cy.get('.btn-primary').click();
                    });


                });

            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });

});
describe('GET ID Scan API Test pending/PASS', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };
    // Function to verify document analysis in the JSON data
    const verifyDocumentAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.documentAnalysis.images).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.ignoredErrorsInFields).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.excludedDocumentIds).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.status).to.eq('Requested');
    };
    // Function to verify liveness analysis in the JSON data
    const verifyLivenessAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.livenessAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.livenessAnalysis.status).to.eq('NotRequested');
    };
    // Function to verify face match analysis in the JSON data
    const verifyFaceMatchAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.faceMatchAnalysis.usedImages).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.status).to.eq('NotRequested');
    };



    it('GET-PENDING', () => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');

        expect(getUrl, 'GET_URL environment variable').to.not.be.undefined;
        expect(sessionId, 'sessionId environment variable').to.not.be.undefined;
        expect(apiKey, 'API_KEY environment variable').to.not.be.undefined;
        // Send a GET request to the API
        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log the status code and response body
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Handle different status codes
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Save sessionId and redirectUrl to Cypress environment variables
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        });
    });

    it('Verify status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyJsonData(jsonData);
    });

    it('Verify result documentAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysis(jsonData);
    });

    it('Verify result livenessAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyLivenessAnalysis(jsonData);
    });

    it('Verify result faceMatchAnalysis', () => {
        const jsonData = Cypress.env('jsonData');
        verifyFaceMatchAnalysis(jsonData);
    });

});
describe('GET ID Scan API Test success/PASS', () => {
    // Function to verify the JSON data structure and values
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com/?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('SV');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.gdpr_user_id).to.equal('gdpr_user_id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };
    // Function to verify the status in the JSON data
    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };
    // Function to verify that there are no errors in the JSON data
    const NoErorr = (jsonData) => {
        expect(jsonData.data.errors).to.eql([]);

    };
    // Function to verify the analysis images in the JSON data
    const verifyAnalysisImages = (jsonData) => {
        const expectedAnalysisImages = Cypress.env('AnalysisImages');
        Cypress.env('AnalysisImages', jsonData.data.result.documentAnalysis.images[0].url);
        expect(jsonData.data.result.documentAnalysis.images[0].url).to.eql(expectedAnalysisImages);
        expect(jsonData.data.result.documentAnalysis.textResult.validityStatus).to.eql('None');
        expect(jsonData.data.result.documentAnalysis.summary.overallStatus).to.eql('Error');
        expect(jsonData.data.result.documentAnalysis.images[0].mimeType).to.eql('image/jpeg');

    };
    // Function to verify the identity analysis in the JSON data
    const verifyAnalysIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('SVEN');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('SPECIMEN');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('SPECIMEN SVEN');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql(8703142391);
        expect(jsonData.data.result.documentAnalysis.identity.gender).to.be.eql("M");
        expect(jsonData.data.result.identity.dateOfBirth).to.eql('1987-03-14');
        expect(jsonData.data.result.documentAnalysis.identity.age).to.eql(37);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };
    // Function to verify identity information in English in the JSON data
    const verifyAnalysisImagesIdenfityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('SVEN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('SPECIMEN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('SPECIMEN SVEN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.personalNumber).to.eql(8703142391);
        expect(jsonData.data.result.documentAnalysis.identityEnglish.gender).to.be.eql("M");
        expect(jsonData.data.result.documentAnalysis.identityEnglish.dateOfBirth).to.eql('1987-03-14');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.age).to.eql(37);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };
    // Function to verify the overall status of the document analysis in the JSON data
    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };
    // Function to verify the document type in the JSON data
    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.be.eq("Sweden - ePassport (2012)");
        expect(jsonData.data.result.documentAnalysis.documentType.type).to.be.eq("PASSPORT");
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.be.eq("2012");
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.be.eq("Sweden");
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.be.eq("SE");
        expect(jsonData.data.result.documentAnalysis.documentType.hasMrz).to.be.eq(true);
    };

});

