const options = {
      swaggerDefinition: {
        info: {
          title: "realEstate-webapp API",
          version: "0.1.0",
          description:
            "This is a real estate web API application made with Express and documented with Swagger",
          license: {
            name: "MIT",
            url: "https://spdx.org/licenses/MIT.html",
          },
          contact: {
            name: "S13",
            email: "smdays13@gmail.com",
          },
        },
        servers: [
          {
            url: "http://localhost:5000/",
          },
        ],
      },
      apis: ['./Routes/*.js'],
    };
    
    
    
    const specs = swaggerJsdoc(options)
    app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(specs));