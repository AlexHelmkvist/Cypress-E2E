<reference types="cypress" />
Cypress.on('uncaught:exception', () => false); //Fånga fel

describe('ID Scan API Test', () => {
    it('should perform an ID scan request successfully', () => {
        cy.request({
            method: 'POST',
            url: 'https://test-gateway.zignsec.com/api/v5/sessions/scanning-dp50/web',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '9bb9d9779a174583a45710e1900d9617'
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
            cy.get('.btn > .icon').click();
            cy.get('.back-btn__text').click();
            cy.get('.option-list > :nth-child(2)').click();
            cy.get('.btn > .icon').click();
            cy.get('.back-btn__text').click();
            cy.get(':nth-child(1) > .document-type-info > .document-type-info__text > .document-type-hint').click();
            cy.get(':nth-child(2) > .file-upload-item > .file-upload-actions > .btn > .icon').click();
            cy.get(':nth-child(1) > .file-upload-item > .file-upload-actions > .btn > .icon').click();
            cy.get('.back-btn__text').click();



        });
    });
});
