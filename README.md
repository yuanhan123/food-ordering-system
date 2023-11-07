# Food Ordering System
A secured web application that offers customers the convenience of placing food orders for delivery.

Open [https://www.beautiful-noyce.cloud/] to view main UI 

Open [https://www.beautiful-noyce.cloud/seller/login] to login as seller 


## Build the project before you start

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

## Project file & directory structure

### Top-level files & directory layout

    .
    ├── app                    # Source files
    ├── cypress                # Automated test files
    ├── prisma                 # Migrations and schema files
    ├── public                 # Images files  
    ├── .eslintrc.json         # config files
    ├── .gitignore
    ├── Dockerfile
    ├── Jenkinsfile
    ├── cypress.config.js      
    ├── jsconfig.json          
    ├── middleware.js          
    ├── next.config.js
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── script.sh
    ├── tailwind.config.js
    └── README.md

### Source files
Each nested folder represents a route segment that is mapped to the corresponding sengment in a URL path. The route is publicly accessible if page.js is existing in the route segment.

    .
    ├── ...
    ├── app                          # Source files
    │   ├── admin 
    │   │   └── page.js
    │   ├── api                      # Api Endpoints
    │   │   ├── auth
    │   │   │   ├── [...nextauth]
    │   │   │   │   └── route.js
    │   │   │   ├── login
    │   │   │   │   └── route.js
    │   │   │   └── refreshToken
    │   │   │       └── route.js
    │   │   ├── menu-categories
    │   │   │   └── route.js
    │   │   ├── menu-items
    │   │   │   ├── create
    │   │   │   │   └── route.js
    │   │   │   ├── delete
    │   │   │   │   └── route.js
    │   │   │   ├── update
    │   │   │   │   └── route.js
    │   │   │   └── route.js
    │   │   ├── order
    │   │   │   ├── create
    │   │   │   │   └── route.js
    │   │   │   ├── customer
    │   │   │   │   └── route.js
    │   │   │   ├── [orderId]
    │   │   │   │   └── route.js
    │   │   │   └── route.js
    │   │   ├── payment-intent
    │   │   │   └── route.js
    │   │   ├── payment
    │   │   │   └── route.js
    │   │   └── signup
    │   │       └── route.js
    │   ├── components 
    │   │   ├── AlertItem.js
    │   │   ├── CartItem.js
    │   │   ├── CartOrderSummary.js
    │   │   ├── CartProduct.js
    │   │   ├── CategoryCard.js
    │   │   ├── CheckoutForm.js
    │   │   ├── LoginForm.js
    │   │   ├── LoginLayout.js
    │   │   ├── MenuCard.js
    │   │   ├── MenuGrid.js
    │   │   ├── Navigation.js
    │   │   ├── Order.js
    │   │   ├── OrderCard.js
    │   │   └── QuantityPicker.js
    │   ├── lib                          # Util files
    │   │   ├── axios.js
    │   │   ├── helper.js
    │   │   ├── jwt.js
    │   │   ├── prisma.js
    │   │   └── hooks
    │   │       ├── useAxiosAuth.js
    │   │       └── useRefreshToken.js   
    │   ├── login
    │   │   └── page.js
    │   ├── payment-success
    │   │   └── page.js
    │   ├── seller
    │   │   ├── page.js
    │   │   └── login
    │   │       └── page.js
    │   ├── sign-up
    │   │   └── page.js
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.js
    │   ├── page.js
    │   └── providers.js               
    └── ...            

### Automated test files

    .
    ├── ...
    ├── cypress                      # Automated Test files 
    │   ├── e2e                      # End to end test 
    │   │   ├── app.cy.js
    │   │   ├── loginCustomer.cy.js
    │   │   ├── loginSeller.cy.js
    │   │   └── payment.cy.js
    │   ├── fixtures
    │   │   └── example.json
    │   └── support                  # Command needed for testing
    │       ├── commands.js
    │       └── e2e.js
    └── ...

### Migrations and schema files

    .
    ├── ...
    ├── prisma                          # Migrations and schema files 
    │   ├── schema.prima   
    │   └── migrations     
    │       └── 20231024093649_order_update
    │           └── migration.sql
    └── ...

### Images files

    .
    ├── ...
    ├── public                    # Images files
    │   ├── banner.jpg   
    │   ├── logo-nav.jpg 
    │   ├── logo.jpg 
    │   ├── next.svg
    │   └── vercel.svg  
    └── ...

### Sequence Diagram for Secure Login Function

![Sequence Diagram](https://github.com/kch-chaihong/food-ordering-system/assets/92876312/2930724a-5abf-4959-9f0f-f3fc51eb84f0)
