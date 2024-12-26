/// <reference types="cypress"/>
Cypress.on('uncaught:exception', () => false); // Fånga fel

describe.only('POST ID Scan API Test/ID_CARD', () => {
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
                const jsonData = response.body;
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                verifyJsonData(jsonData);
            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });
});

describe.only('GET ID Scan API Test pending/ID_CARD', () => {
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };

    const verifyDocumentAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.documentAnalysis.images).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.ignoredErrorsInFields).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.excludedDocumentIds).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.status).to.eq('Requested');
    };

    const verifyLivenessAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.livenessAnalysis.history).to.be.an('array').that is.empty;
        expect(jsonData.data.result.livenessAnalysis.status).to.eq('NotRequested');
    };

    const verifyFaceMatchAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.faceMatchAnalysis.usedImages).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.faceMatchAnalysis.status).to.eq('NotRequested');
    };

    it('GET ID Scan API Test pending/ID_CARD', () => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');

        expect(getUrl, 'GET_URL environment variable').to.not.be.undefined;
        expect(sessionId, 'sessionId environment variable').to.not be.undefined;
        expect(apiKey, 'API_KEY environment variable').to.not be.undefined;

        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Logga statuskod och svar
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Hantera olika statuskoder
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Spara sessionId och redirectUrl i Cypress-environment variabler
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

describe.only('POST ID Scan API Test/ID_CARD', () => {
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to be.an('array').that.is.empty;
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
                const jsonData = response.body;
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
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
                cy.fixture(filePath1, 'base64').then((fileContent) => {
                    // Convert the base64 string to a Blob object
                    const frontBlob = Cypress.Blob.base64StringToBlob(fileContent, 'image/png');
                    // Create a new File object from the Blob
                    const frontFile = new File([frontBlob], 'ID_card.png', { type: 'image/png' });
                    // Create a new DataTransfer object and add the File to it
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);
                    // Get the file input element and set its files property to the DataTransfer files
                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        // Dispatch a change event to trigger any event listeners
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));
                        // Click the submit button
                        cy.get('.btn-primary').click();
                    });
                });
            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });
});

describe.only('GET ID Scan API Test success/ID_CARD', () => {
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com/?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        const expectedLokale = Cypress.env('Locale');
        expect(jsonData.data.request_data.locale).to.equal(expectedLokale);
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.gdpr_user_id).to.equal('gdpr_user_id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };

    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };

    const noErrors = (jsonData) => {
        expect(jsonData.data.errors).to.eql([]);
    };

    const verifyDocumentAnalysisImages = (jsonData) => {
        const expectedAnalysisImages = Cypress.env('AnalysisImages');
        Cypress.env('AnalysisImages', jsonData.data.result.documentAnalysis.images[0].url);
        expect(jsonData.data.result.documentAnalysis.images[0].url).to.eql(expectedAnalysisImages);
        expect(jsonData.data.result.documentAnalysis.images[0].mimeType).to.eql('image/jpeg');
        expect(jsonData.data.result.documentAnalysis.textResult.validityStatus).to.eql('None');
        expect(jsonData.data.result.documentAnalysis.summary.overallStatus).to.eql('Error');
    };

    const verifyDocumentAnalysisIdentity = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identity.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identity.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identity.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identity.personalNumber).to.eql('');
        expect(jsonData.data.result.identity.dateOfBirth).to.eql('1989-07-09');
        expect(jsonData.data.result.documentAnalysis.identity.age).to.eql(35);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
    };

    const verifyDocumentAnalysisIdentityEnglish = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.identityEnglish.countryCode).to.eql('SE');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.firstName).to.eql('JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.lastName).to.eql('OWINDEBORN');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.fullName).to.eql('OWINDEBORN JAN EVERT JIMMY');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.dateOfBirth).to.eql('1989-07-09');
        expect(jsonData.data.result.documentAnalysis.identityEnglish.age).to.eql(35);
        expect(jsonData.data.result.documentAnalysis.identity.idProviderName).to.eql('DP50');
        expect(jsonData.data.result.documentAnalysis.documentType.type).to.eql('DRIVING_LICENSE');
    };

    const verifyDocumentAnalysisOverallStatus = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.overallStatus).to.eq('Error');
    };

    const verifyDocumentType = (jsonData) => {
        expect(jsonData.data.result.documentAnalysis.documentType.name).to.be.eq('Sweden - Driving License (2013)');
        expect(jsonData.data.result.documentAnalysis.documentType.year).to.be.eq('2013');
        expect(jsonData.data.result.documentAnalysis.documentType.countryName).to.be.eq('Sweden');
        expect(jsonData.data.result.documentAnalysis.documentType.countryCode).to.be.eq('SE');
        expect(jsonData.data.result.documentAnalysis.documentType.hasMrz).to.be.eq(false);
    };

    it('GET ID Scan API Test success/ID_CARD', () => {
        const getUrl = Cypress.env('GET_URL');
        const sessionId = Cypress.env('sessionId');
        const apiKey = Cypress.env('API_KEY');

        expect(getUrl, 'GET_URL environment variable').to.not.be.undefined;
        expect(sessionId, 'sessionId environment variable').to.not be.undefined;
        expect(apiKey, 'API_KEY environment variable').to.not be.undefined;

        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Logga statuskod och svar
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Hantera olika statuskoder
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Spara sessionId och redirectUrl i Cypress-environment variabler
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        });
    });

    it('should verify request data is retrieved successfully', () => {
        const jsonData = Cypress.env('jsonData');
        verifyJsonData(jsonData);
    });

    it('should verify status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyStatus(jsonData);
    });

    it('should verify no errors', () => {
        const jsonData = Cypress.env('jsonData');
        noErrors(jsonData);
    });

    it('should verify document analysis images', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysisImages(jsonData);
    });

    it('should verify document analysis identity', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysisIdentity(jsonData);
    });

    it('should verify document analysis identity in English', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysisIdentityEnglish(jsonData);
    });

    it('should verify document analysis overall status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentAnalysisOverallStatus(jsonData);
    });

    it('should verify document type', () => {
        const jsonData = Cypress.env('jsonData');
        verifyDocumentType(jsonData);
    });

    it('should verify liveness analysis status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyLivenessAnalysis(jsonData);
    });

    it('should verify face match analysis status', () => {
        const jsonData = Cypress.env('jsonData');
        verifyFaceMatchAnalysis(jsonData);
    });
});
describe('POST ID Scan API Test/DRIVING_LICENSE', () => {
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
                const jsonData = response.body;
                Cypress.env('sessionId', jsonData.data.id);
                Cypress.env('redirectUrl', jsonData.data.redirect_url);
                Cypress.env('jsonData', jsonData); // Saving jsonData to an environment variable
                verifyJsonData(jsonData);

                cy.visit(jsonData.data.redirect_url);
                cy.wait(1000);
                cy.get('.continue-in-browser__btn').should('be.visible').click();
                cy.get('.select-flow__actions > :nth-child(2)').click();
                cy.get('.option-list > :nth-child(1)').click();

                const filePath1 = 'image1.jpeg';

                cy.fixture('image1.jpeg').then((filePath1) => {
                    const frontBlob = Cypress.Blob.base64StringToBlob(filePath1, 'image/jpeg');
                    const frontFile = new File([frontBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                    const frontDataTransfer = new DataTransfer();
                    frontDataTransfer.items.add(frontFile);

                    cy.get('input[type=file]').eq(0).then((input) => {
                        input[0].files = frontDataTransfer.files;
                        input[0].dispatchEvent(new Event('change', { bubbles: true }));

                    });


                });
                const filePath2 = 'image2.jpeg';

                cy.fixture('image2.jpeg').then((filePath2) => {
                    const backBlob = Cypress.Blob.base64StringToBlob(filePath2, 'image/jpeg');
                    const backFile = new File([backBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                    const backDataTransfer = new DataTransfer();
                    backDataTransfer.items.add(backFile);

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
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };

    const verifyDocumentAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.documentAnalysis.images).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.ignoredErrorsInFields).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.excludedDocumentIds).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.status).to.eq('Requested');
    };

    const verifyLivenessAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.livenessAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.livenessAnalysis.status).to.eq('NotRequested');
    };

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

        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Logga statuskod och svar
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Hantera olika statuskoder
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Spara sessionId och redirectUrl i Cypress-environment variabler
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
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com/?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('SV');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.gdpr_user_id).to.equal('gdpr_user_id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };

    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };

    const NoErorr = (jsonData) => {
        expect(jsonData.data.errors).to.eql([]);
    };

    const verifyAnalysisImages = (jsonData) => {
        const expectedAnalysisImages = Cypress.env('AnalysisImages');
        Cypress.env('AnalysisImages', jsonData.data.result.documentAnalysis.images[0].url);
        expect(jsonData.data.result.documentAnalysis.images[0].url).to.eql(expectedAnalysisImages);
        expect(jsonData.data.result.documentAnalysis.textResult.validityStatus).to.eql('None');
        expect(jsonData.data.result.documentAnalysis.summary.overallStatus).to.eql('Error');
        expect(jsonData.data.result.documentAnalysis.images[0].mimeType).to.eql('image/jpeg');

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




});
describe('POST ID Scan API Test/PASS', () => {
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
                    });


                });

            } else {
                throw new Error(`Unexpected status code: ${statusCode}`);
            }
        });
    });

});
describe('GET ID Scan API Test pending/PASS', () => {
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
    };

    const verifyDocumentAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.documentAnalysis.images).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.ignoredErrorsInFields).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.excludedDocumentIds).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.documentAnalysis.status).to.eq('Requested');
    };

    const verifyLivenessAnalysis = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.result.livenessAnalysis.history).to.be.an('array').that.is.empty;
        expect(jsonData.data.result.livenessAnalysis.status).to.eq('NotRequested');
    };

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

        cy.request({
            method: 'GET',
            url: `${getUrl}/${sessionId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            },
            failOnStatusCode: false
        }).then((response) => {
            // Logga statuskod och svar
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            // Hantera olika statuskoder
            if (response.status === 400) {
                cy.log('400 Bad Request - Kontrollera URL, headers och payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                const jsonData = response.body;
                // Spara sessionId och redirectUrl i Cypress-environment variabler
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
    const verifyJsonData = (jsonData) => {
        expect(jsonData.data.request_data.redirect_failure).to.equal('https://www.bing.com/?q=failure');
        expect(jsonData.data.request_data.redirect_success).to.equal('https://www.google.com/?q=success');
        expect(jsonData.data.request_data.locale).to.equal('SV');
        expect(jsonData.data.request_data.relay_state).to.equal('internal-user-id');
        expect(jsonData.data.request_data.gdpr_user_id).to.equal('gdpr_user_id');
        expect(jsonData.data.request_data.webhook).to.equal('https://webhook.site/340f6dc8-80ac-4dc8-b43f-9b94d3dc26ef');
    };

    const verifyStatus = (jsonData) => {
        expect(jsonData.data.status).to.eq('Declined');
    };

    const NoErorr = (jsonData) => {
        expect(jsonData.data.errors).to.eql([]);

    };

    const verifyAnalysisImages = (jsonData) => {
        const expectedAnalysisImages = Cypress.env('AnalysisImages');
        Cypress.env('AnalysisImages', jsonData.data.result.documentAnalysis.images[0].url);
        expect(jsonData.data.result.documentAnalysis.images[0].url).to.eql(expectedAnalysisImages);
        expect(jsonData.data.result.documentAnalysis.textResult.validityStatus).to.eql('None');
        expect(jsonData.data.result.documentAnalysis.summary.overallStatus).to.eql('Error');
        expect(jsonData.data.result.documentAnalysis.images[0].mimeType).to.eql('image/jpeg');

    };

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

});

