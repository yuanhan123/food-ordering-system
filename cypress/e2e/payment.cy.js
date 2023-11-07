const STRIPE_IFRAME_PREFIX = '__privateStripeFrame'

const getStripeIFrameDocument = () => {
    return cy.checkElementExists(`iframe[name^="${STRIPE_IFRAME_PREFIX}"]`).iframeCustom()
}

describe('Payment Page', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.intercept('GET', '/api/auth/providers').as('customerlogin');
        cy.wait(500);
        cy.get('input[id=username]').type('customer_one');
        cy.get('input[id=password]').type('johndoe_user');
        cy.getByTestId('signin').click();
        cy.wait('@customerlogin', {requestTimeout: 20000});
        cy.wait(500);

        for (let i = 0; i < 3; i++) {
            cy.getByTestId('add-cart-button').eq(i).click();
        }

        cy.getByTestId('cart-button').click();
    });

    it('should make valid payment', () =>{
        cy.getByTestId('checkout').should('exist').click();
        cy.wait(6000);
        cy.get('#payment-element > .__PrivateStripeElement > iframe').click(); // in cy.get() insert stripe iframe id
        cy.wait(6000);
        cy.get('iframe').then($iframe => {
            const doc = $iframe.contents().find('body');
            let input = doc.find('input[name="number"]');
            cy.wrap(input).type('4242424242424242');

            input = doc.find('input[name=expiry]');
            cy.wrap(input).type('1227');

            input = doc.find('input[name=cvc]');
            cy.wrap(input).type('123');
        })
        cy.getByTestId('place-order').click();
        cy.url().should('include', '/payment-success');
    })

    it('should not make payment with invalid card', () =>{
        cy.getByTestId('checkout').should('exist').click();
        cy.wait(6000);
        cy.get('#payment-element > .__PrivateStripeElement > iframe').click(); // in cy.get() insert stripe iframe id
        cy.wait(6000);
        cy.get('iframe').then($iframe => {
            const doc = $iframe.contents().find('body');
            let input = doc.find('input[name="number"]');
            cy.wrap(input).type('4000 0000 0000 0002');

            input = doc.find('input[name=expiry]');
            cy.wrap(input).type('1227');

            input = doc.find('input[name=cvc]');
            cy.wrap(input).type('123');
        })
        cy.getByTestId('place-order').click();
        cy.url().should('include', '/');
    })

    it("should not make payment with Insufficient Fund's Card", () =>{
        cy.getByTestId('checkout').should('exist').click();
        cy.wait(6000);
        cy.get('#payment-element > .__PrivateStripeElement > iframe').click(); // in cy.get() insert stripe iframe id
        cy.wait(6000);
        cy.get('iframe').then($iframe => {
            const doc = $iframe.contents().find('body');
            let input = doc.find('input[name="number"]');
            cy.wrap(input).type('4000 0000 0000 9995');

            input = doc.find('input[name=expiry]');
            cy.wrap(input).type('1227');

            input = doc.find('input[name=cvc]');
            cy.wrap(input).type('123');
        })
        cy.getByTestId('place-order').click();
        cy.url().should('include', '/');
    })
});