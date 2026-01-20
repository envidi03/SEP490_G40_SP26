const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SEP490 G40 API Documentation',
            version: '1.0.0',
            description: 'API documentation for SEP490 G40 Backend Services',
            contact: {
                name: 'API Support',
                email: 'support@sep490g40.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../modules/**/*.route.js'),
        path.join(__dirname, '../app.js')
    ]
};

const swaggerSpec = swaggerJsdoc(options);

// Log để debug
console.log('📚 Swagger paths found:', Object.keys(swaggerSpec.paths || {}).length);
if (Object.keys(swaggerSpec.paths || {}).length === 0) {
    console.warn('⚠️  No API paths found! Check your JSDoc comments.');
}

const swaggerDocs = (app) => {
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'SEP490 G40 API Docs',
        swaggerOptions: {
            persistAuthorization: true,
        }
    }));

    // JSON format
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`📚 Swagger UI available at http://localhost:${process.env.PORT || 5000}/api-docs`);
};

module.exports = swaggerDocs;
