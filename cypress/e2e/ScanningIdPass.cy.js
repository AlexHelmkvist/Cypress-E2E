/// <reference types="cypress"/>
Cypress.on('uncaught:exception', () => false); //Fånga fel

describe('ID Scan API Test', () => {
    it('should perform an ID scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env("API_KEY")
            },
            body: {
                "redirect_success": "https://google.com?q=success",
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
            const data = response.body.data;

            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('data');

            cy.visit(data.redirect_url);
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
                    cy.wait(4000);
                    cy.get('#L2AGLb > .QS5gu').click();
                    cy.wait(2000);

                });

            });
        });

    });

    it('should perform an DrivingLiicence scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env("API_KEY")
            },
            body: {
                "redirect_success": "https://google.com?q=success",
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
            const data = response.body.data;

            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('data');

            cy.visit(data.redirect_url);
            cy.wait(1000);

            cy.get('.continue-in-browser__btn').should('be.visible').click();
            cy.get('.select-flow__actions > :nth-child(2)').click();
            cy.get('.option-list > :nth-child(3)').click();


            const filePath1 = 'image1.jpeg';

            cy.fixture('image1.jpeg').then((filePath1) => {
                const frontBlob = Cypress.Blob.base64StringToBlob(filePath1, 'image/jpeg');
                const frontFile = new File([frontBlob], 'ID_card.jpeg', { type: 'image/jpeg' });
                const frontDataTransfer = new DataTransfer();
                frontDataTransfer.items.add(frontFile);

                cy.get('input[type=file]').eq(0).then((input) => {
                    input[0].files = frontDataTransfer.files;
                    input[0].dispatchEvent(new Event('change', { bubbles: true }));
                    cy.get('.btn-primary').click();
                    cy.wait(4000);
                    cy.get('#L2AGLb > .QS5gu').click();
                    cy.wait(2000);


                });


            });

        });

    });

    it('should perform an Pass scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('API_URL'),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env("API_KEY")
            },
            body: {
                "redirect_success": "https://google.com?q=success",
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
            const data = response.body.data;

            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('data');

            cy.visit(data.redirect_url);
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
                    cy.wait(4000);
                    cy.get('#L2AGLb > .QS5gu').click();
                    cy.wait(2000);
                });


            });

        });

    });


});
