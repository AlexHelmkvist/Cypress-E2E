/// <reference types="cypress"/>
Cypress.on('uncaught:exception', () => false); // Ловим и игнорируем неперехваченные исключения
// Используйте команду npm run test:all для запуска в трех браузерах "Chrome, Edge, Firefox"

describe('POST ID Scan API Test/ID_CARD', () => {
    // Функция для проверки структуры и значений JSON данных
    const verifyJsonData = (jsonData) => {
        expect(jsonData).to.have.property('data');
        expect(jsonData.data.status).to.exist;
        expect(jsonData.data.status).to.eq('GeneratedLink');
        expect(jsonData.data.errors).to.be.an('array').that.is.empty;
        const expectedId = Cypress.env('sessionId');
        expect(jsonData.data.id).to.eql(expectedId);
        const expectedredirectUrl = Cypress.env('redirectUrl');

        // Логирование значений для отладки
        cy.log(`Expected Redirect URL: ${expectedredirectUrl}`);
        cy.log(`Actual Redirect URL: ${jsonData.data.redirect_url}`);

        // Проверка значения redirect_url
        expect(jsonData.data.redirect_url).to.eql(expectedredirectUrl);
    };

    // Функция для выполнения GET-запроса и проверки данных с polling
    const performGetRequestWithPolling = (getUrl, sessionId, apiKey, retries = 5, delay = 2000) => {
        const poll = (attempt) => {
            if (attempt > retries) {
                throw new Error('Max retries reached');
            }

            cy.request({
                method: 'GET',
                url: `${getUrl}/${sessionId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                },
                failOnStatusCode: false
            }).then((response) => {
                // Логирование кода статуса и тела ответа
                cy.log(`Statuskod: ${response.status}`);
                cy.log(`Svar: ${JSON.stringify(response.body)}`);

                const jsonData = response.body;

                // Обработка различных кодов статуса
                if (response.status === 400) {
                    cy.log('400 Bad Request - Проверьте URL, заголовки и payload.');
                    throw new Error('400 Bad Request');
                } else if (response.status >= 200 && response.status < 300) {
                    if (jsonData.data.status === 'GeneratedLink') {
                        // Сохранение jsonData в переменную окружения
                        Cypress.env('jsonData', jsonData);
                        verifyJsonData(jsonData);
                    } else if (jsonData.data.status === 'Pending') {
                        cy.wait(delay).then(() => poll(attempt + 1));
                    } else {
                        throw new Error(`Unexpected status: ${jsonData.data.status}`);
                    }
                } else {
                    throw new Error(`Unexpected status code: ${response.status}`);
                }
            });
        };

        poll(0);
    };

    // Итерация по каждому элементу тестовых данных
    it('should perform ID scan requests successfully for each language and country code', () => {
        // Загрузка тестовых данных из фикстуры
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
                        "relay_state": "my-internal-user-id",
                        "gpdr_user_id": "my-gdpr-user-id",
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
                        // Сохранение sessionId и redirectUrl в переменные окружения Cypress
                        Cypress.env('sessionId', jsonData.data.id);
                        Cypress.env('redirectUrl', jsonData.data.redirect_url);
                        Cypress.env('jsonData', jsonData); // Сохранение jsonData в переменную окружения
                        verifyJsonData(jsonData);

                        // Переход по redirect URL
                        cy.visit(jsonData.data.redirect_url);
                        cy.wait(1000);

                        // Взаимодействие с веб-страницей
                        cy.get('.continue-in-browser__btn').should('be.visible').click();
                        cy.get('.select-flow__actions > :nth-child(2)').click();
                        cy.get('.option-list > :nth-child(2)').click();

                        // Загрузка лицевой стороны ID карты
                        const filePath1 = 'image0.jpeg';
                        cy.fixture(filePath1, 'base64').then((fileContent) => {
                            // Преобразование base64 строки в Blob объект
                            const frontBlob = Cypress.Blob.base64StringToBlob(fileContent, 'image/png');
                            // Создание нового File объекта из Blob
                            const frontFile = new File([frontBlob], 'ID_card.png', { type: 'image/png' });
                            // Создание нового DataTransfer объекта и добавление в него File
                            const frontDataTransfer = new DataTransfer();
                            frontDataTransfer.items.add(frontFile);
                            // Получение элемента input и установка его свойства files на DataTransfer files
                            cy.get('input[type=file]').eq(0).then((input) => {
                                input[0].files = frontDataTransfer.files;
                                // Вызов события change для активации слушателей событий
                                input[0].dispatchEvent(new Event('change', { bubbles: true }));
                                // Нажатие на кнопку отправки
                                cy.get('.btn-primary').click();
                            });
                        });

                        // Выполнение GET-запроса после успешного POST-запроса с polling
                        const getUrl = Cypress.env('GET_URL');
                        const sessionId = Cypress.env('sessionId');
                        const apiKey = Cypress.env('API_KEY');
                        performGetRequestWithPolling(getUrl, sessionId, apiKey);
                    } else {
                        throw new Error(`Unexpected status code: ${statusCode}`);
                    }
                });
            });
        });
    });
});

describe('GET ID Scan API Test success/ID_CARD', () => {
    it('should verify the status and data of the ID scan', () => {
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
            // Логирование кода статуса и тела ответа
            cy.log(`Statuskod: ${response.status}`);
            cy.log(`Svar: ${JSON.stringify(response.body)}`);

            const jsonData = response.body;

            // Обработка различных кодов статуса
            if (response.status === 400) {
                cy.log('400 Bad Request - Проверьте URL, заголовки и payload.');
                throw new Error('400 Bad Request');
            } else if (response.status >= 200 && response.status < 300) {
                // Сохранение jsonData в переменную окружения
                Cypress.env('jsonData', jsonData);
                verifyJsonData(jsonData);
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        });
    });
});