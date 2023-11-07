describe('Main Page', () => {
    beforeEach(() => {
        // Visit the login page or route where your login form is located
        cy.visit('/');
    });

    it('should display navigation bar', () => {
        cy.getByTestId('sign-label').then(($label) => {
            // If the Sign Out label is displayed, verify the existence of the Cart button
            if ($label.text() === 'Sign Out') {
              cy.getByTestId('cart-button').should('exist');
            } else {
              // If the Sign Out label is not displayed, assert that the Cart button does not exist
              cy.getByTestId('cart-button').should('not.exist');
            }
        });
    })

    it('should display the menu', () =>{
      cy.getByTestId('menu-Item')
        .should('be.visible')
        .each((menuItem) => {
            cy.wrap(menuItem).getByTestId('menu-image').should('exist');
            cy.wrap(menuItem).getByTestId('menu-name').should('exist'); 
            cy.wrap(menuItem).getByTestId('menu-price').should('exist'); 
            cy.wrap(menuItem).getByTestId('add-cart-button').should('exist');          
        })
    })

    it('should log in, add three items to cart, and verify the order summary', () => {
        //login 
        cy.visit('/login');
        cy.intercept('GET', '/api/auth/providers').as('customerlogin');
        cy.wait(500);
        cy.get('input[id=username]').type('customer_one');
        cy.get('input[id=password]').type('johndoe_user');
        cy.getByTestId('signin').click();
        cy.wait('@customerlogin', {requestTimeout: 20000});
        cy.wait(500);

        // verify login
        cy.getByTestId('sign-label').should('have.text', 'Sign Out');
        cy.getByTestId('cart-button').should('exist');

        // add items to cart and verify order summary
        let totalPrice = 0;
        for (let i = 0; i < 3; i++) {
            cy.getByTestId('add-cart-button').eq(i).click();
            cy.getByTestId('menu-price').eq(i).invoke('text').then((itemPrice) => {
                totalPrice += parseFloat(itemPrice);
            })
        }

        cy.getByTestId('cart-button').click();
        cy.getByTestId('label').invoke('text').then((text) => {
            const dollarIndex = text.indexOf('$');
            const valueBeforeDollar = text.substring(0, dollarIndex);
            const valueAfterDollar = text.substring(dollarIndex + 1);
            expect(valueBeforeDollar).to.equal('3');
            expect(valueAfterDollar).to.equal((totalPrice.toFixed(2)).toString());
        });
    })
});