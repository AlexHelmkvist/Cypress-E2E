/// <reference types="cypress"/>
Cypress.on('uncaught:exception', () => false); // Catch errors
//Use command npm run test:all to run in three browsers "Chrome,Edge,Firefox"
describe('POST and GET ID Scan API Test/pendingID_CARD/DRIVING_LICENSE/PASS', () => {
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
        const expectedLanguage = Cypress.env('Language');
        expect(jsonData.data.language).to.eq(expectedLanguage);
        const expectedCountryCode = Cypress.env('CountryCode');
        expect(jsonData.data.country_code).to.eq(expectedCountryCode);
    };
    const performGetRequest = (getUrl, sessionId, apiKey) => {
        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log full response for debugging
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Handle different status codes
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Save jsonData to Cypress environment variable
                Cypress.env('jsonData', jsonData);
                verifyJsonData(jsonData);
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        });
    };

    it('should perform ID scan requests successfully for each language and country code', () => {
        cy.fixture('test_data.json').then((testData) => {
            testData.forEach((data) => {
                cy.log(`Testing with language: ${data.language}, country_code: ${data.country_code}`);
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
                        "relay_state": "internal-user-id",
                        "gpdr_user_id": "gdpr-user-id",
                        "webhook": "https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef",
                        "metadata": {
                            "analysis_types": [
                                "Document"
                            ],
                            "language": data.language,
                            "country_code": data.country_code
                        }
                    }
                }).then((response) => {
                    const statusCode = response.status;
                    const isSuccessfulStatusCode = statusCode >= 200 && statusCode < 300;

                    if (isSuccessfulStatusCode) {
                        const jsonData = response.body;
                        // Save sessionId and redirectUrl to Cypress environment variables
                        Cypress.env('sessionId', jsonData.data.id);
                        Cypress.env('redirectUrl', jsonData.data.redirect_url);
                        Cypress.env('Language', jsonData.data.language);
                        Cypress.env('CountryCode', jsonData.data.country_code);
                        Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                        verifyJsonData(jsonData);

                        // Perform GET request after successful POST request
                        const getUrl = Cypress.env('GET_URL');
                        const sessionId = Cypress.env('sessionId');
                        const apiKey = Cypress.env('API_KEY');
                        performGetRequest(getUrl, sessionId, apiKey);
                    } else {
                        throw new Error(`Unexpected status code: ${statusCode}`);
                    }
                });
            });
        });
    });
});
describe('POST ID Scan API Test/successID_CARD', () => {
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
    it('should perform an ID scan request successfully', () => {

        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('API_KEY'),
            },
            body: {
                "redirect_success": "https://google.com/?q=success",
                "redirect_failure": "https://bing.com/?q=failure",
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
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

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
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });
});
describe('GET ID Scan API Test success/ID_CARD', () => {
    
    let jsonData;
    before(() => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');
        const details = Cypress.env('details');

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
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);
            jsonData = response.body;
        });
    });

    it('Check if request data is retrieved successfully', () => {
        expect(jsonData.data.request_data.redirect_failure).to.equal("https://bing.com/?q=failure");
        expect(jsonData.data.request_data.redirect_success).to.equal("https://google.com/?q=success");
        expect(jsonData.data.request_data.locale).to.equal("EN");
        expect(jsonData.data.request_data.relay_state).to.equal("internal-user-id");
        expect(jsonData.data.request_data.webhook).to.equal("https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef");
    });

    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.be.eq("Declined");
    };

    const verifyNoError = (jsonData) => {
        expect(jsonData.data.errors).to.be.eql([]);
    };

    const verifyAnalysisImagesIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity).to.not.be.undefined;
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('');
    };

    const verifyAnalysisImagesIdenfityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish).to.not.be.undefined;
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.personalNumber).to.eql('');
    };

    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };

    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType).to.not.be.undefined;
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.eq('Sweden - Driving License (2013)');
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.eq('2013');
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.eq('Sweden');
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
    };

    it('Verify Error', () => {
        verifyStatus(jsonData);
    });

    it('verify Status', () => {
        verifyNoError(jsonData);
    });

    it('verify Analysis Images Idenfity', () => {
        verifyAnalysisImagesIdenfity(jsonData);
    });

    it('verify Analysis Images Idenfity English', () => {
        verifyAnalysisImagesIdenfityEnglish(jsonData);
    });

    it('verify Document Analysis Overall Status', () => {
        verifyDocumentAnalysisOverallStatus(jsonData);
    });

    it('Verify Analysis Document Type', () => {
        verifyAnalysisDocumentType(jsonData);
    });
});
describe('POST ID Scan API Test success/DRIVING_LICENSE', () => {
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
                "relay_state": "internal-user-id",
                "gpdr_user_id": "gdpr-user-id",
                "webhook": "https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef",
                "metadata": {
                    "analysis_types": [
                        "Document"
                    ]
                }
            }
        }).then((response) => {
            // Log full response for debugging
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            const statusCode = response.status;
            const isSuccessfulStatusCode = statusCode >= 200 && statusCode < 300;

            if (isSuccessfulStatusCode) {
                const jsonData = response.body;
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                verifyJsonData(jsonData);

                cy.visit(jsonData.data.redirect_url);
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(1)').click();

                const filePath1 = 'image1.jpeg';
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
                    });
                    const filePath2 = 'image2.jpeg';
                    // Load the fixture file as a base64 string
                    cy.fixture(filePath2, 'base64').then((fileContent) => {
                        // Convert the base64 string to a Blob object
                        const frontBlob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
                        // Create a new DataTransfer object and add the File to it
                        const backFile = new File([frontBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                        const backDataTransfer = new DataTransfer();
                        backDataTransfer.items.add(backFile);
                        // Set the File object on the input element
                        cy.get('input[type=file]').eq(1).then((input) => {
                            input[0].files = backDataTransfer.files;
                            input[0].dispatchEvent(new Event('change', { bubbles: true }));
                            cy.get('.btn-primary').click();
                            cy.wait(5000);
                        });
                    });
                });
            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });

});
describe('GET ID Scan API Test success/DRIVING_LICENSE', () => {
    let jsonData;
    before(() => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');
        const details = Cypress.env('details');

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
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log full response for debugging
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);
            jsonData = response.body;
        });
    });
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://bing.com?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('EN');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };

    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };

    const verifyAnalysisImagesIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('OHAN');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('ANDERSSON');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('ANDERSSON OHAN');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('');
        expect(jsonData.data.result.identity.dateOfBirth).to.eql('1966-02-02');
        expect(jsonData.data.result.documentAnalysis.identity.age).to.eql(58);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };
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
    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };
    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.eq('Sweden - Driving License (2007)');
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.eq('2007');
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.eq('Sweden');
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
        expect(jsonData.data.result.documentAnalysis.documentType.hasMrz).to.eq(false);
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.eq('SE');
    };


    it('Verify JsonData', () => {
        verifyJsonData(jsonData);
    });

    it('VerifyStatus', () => {
        verifyStatus(jsonData);
    });

    it('Verify Analysis Images Idenfity', () => {
        verifyAnalysisImagesIdenfity(jsonData);
    });

    it('Verify Analysis Images Idenfity English', () => {
        verifyAnalysisImagesIdenfityEnglish(jsonData);
    });

    it('Verify Document Analysis Overall Status', () => {
        verifyDocumentAnalysisOverallStatus(jsonData);
    });

    it('Verify Analysis Document Type', () => {
        verifyAnalysisDocumentType(jsonData);
    });
});
describe('POST ID Scan API Test success/PASS', () => {
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
                "redirect_failure": "https://www.bing.com?q=failure",
                "relay_state": "internal-user-id",
                "gpdr_user_id": "gdpr-user-id",
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
                const jsonData = response.body;
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                verifyJsonData(jsonData);

                cy.visit(jsonData.data.redirect_url);
                cy.wait(1000);
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(2)').click();


                const filePath1 = 'pass.png';

                cy.fixture('pass.png').then((filePath1) => {
                    const frontBlob = Cypress.Blob.base64StringToBlob(filePath1, 'image/png');
                    const frontFile = new File([frontBlob], 'ID_card.png', { type: 'image/png' });
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);

                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));
                        cy.get('.btn-primary').click();
                        cy.wait(5000);
                    });


                });

            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });

});
describe('GET ID Scan API Test success/PASS', () => {
    let jsonData;
    before(() => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');
        const details = Cypress.env('details');

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
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log full response for debugging
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);
            jsonData = response.body;
        });
    });

    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('EN');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };

    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };

    const verifyAnalysisImagesIdenfity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('SVEN');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('SPECIMEN');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('SPECIMEN SVEN');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('8703142391');
        expect(jsonData.data.result.documentAnalysis.identity.gender).to.be.eql("M");
        expect(jsonData.data.result.identity.dateOfBirth).to.eql("1987-03-14");
        expect(jsonData.data.result.documentAnalysis.identity.age).to.eql(37);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };

    const verifyAnalysisImagesIdenfityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('SVEN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('SPECIMEN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('SPECIMEN SVEN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.personalNumber).to.eql('8703142391');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.gender).to.be.eql("M");
        expect(jsonData.data.result.documentAnalysis.identityEnglish.age).to.eql(37);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };
    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };

    const verifyAnalysisDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.be.eq("Sweden - ePassport (2012)");
        expect(jsonData.data.result.documentAnalysis.documentType.type).to.be.eq("PASSPORT");
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.be.eq("2012");
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.be.eq("Sweden");
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.be.eq("SE");
        expect(jsonData.data.result.documentAnalysis.documentType.hasMrz).to.be.eq(true);
    };

    it('Verify JsonData', () => {
        verifyJsonData(jsonData);
    });

    it('VerifyStatus', () => {
        verifyStatus(jsonData);
    });

    it('Verify Analysis Images Idenfity', () => {
        verifyAnalysisImagesIdenfity(jsonData);
    });

    it('Verify Analysis Images Idenfity English', () => {
        verifyAnalysisImagesIdenfityEnglish(jsonData);
    });

    it('Verify Document Analysis Overall Status', () => {
        verifyDocumentAnalysisOverallStatus(jsonData);
    });

    it('Verify Analysis Document Type', () => {
        verifyAnalysisDocumentType(jsonData);
    });
});

