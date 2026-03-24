/**
 * Shared OpenAPI 3 component schemas and reusable responses.
 * Aligns with Joi validators in src/validations and controller response shapes.
 */

export const openApiComponents = {
	securitySchemes: {
		bearerAuth: {
			type: 'http' as const,
			scheme: 'bearer',
			bearerFormat: 'JWT',
			description: 'RS256 access token. Send as: Authorization: Bearer <accessToken>'
		}
	},
	schemas: {
		MongoObjectId: {
			type: 'string',
			pattern: '^[a-fA-F0-9]{24}$',
			description: 'MongoDB ObjectId (24 hex chars)'
		},
		ApiErrorItem: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				location: { type: 'string' },
				locationType: { type: 'string' }
			},
			required: ['message']
		},
		ApiErrorResponse: {
			type: 'object',
			description: 'Standard error envelope from error middleware',
			properties: {
				status: { type: 'integer', example: 400 },
				errors: {
					type: 'array',
					items: { $ref: '#/components/schemas/ApiErrorItem' }
				},
				requestId: { type: 'string' },
				stack: { type: 'string', description: 'Present only in development' }
			},
			required: ['status', 'errors']
		},
		SuccessTrue: {
			type: 'boolean',
			enum: [true],
			description: 'Most JSON responses include success: true on success'
		},
		PaginationTotal: {
			type: 'object',
			properties: {
				total: { type: 'integer', minimum: 0 }
			}
		},
		TokenPayload: {
			type: 'object',
			properties: {
				token: { type: 'string' },
				expires: { type: 'string', format: 'date-time' }
			}
		},
		AuthTokens: {
			type: 'object',
			properties: {
				accessToken: { $ref: '#/components/schemas/TokenPayload' },
				refreshToken: { $ref: '#/components/schemas/TokenPayload' }
			}
		},
		User: {
			type: 'object',
			description: 'User document (password omitted via toJSON)',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				email: { type: 'string', format: 'email' },
				avatar: { type: 'string' },
				avatarUrl: { type: 'string' },
				confirmed: { type: 'boolean' },
				roles: { type: 'array', items: { type: 'string' } },
				createdAt: { type: 'string', format: 'date-time' },
				updatedAt: { type: 'string', format: 'date-time' }
			}
		},
		Role: {
			type: 'object',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				description: { type: 'string' },
				permissions: { type: 'array', items: { type: 'string' } }
			}
		},
		ContractBlock: {
			type: 'object',
			description: 'Editor block node (recursive tree). Shape varies by type.',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				type: { type: 'string' },
				props: { type: 'object', additionalProperties: true },
				content: { type: 'array', items: { type: 'object', additionalProperties: true } },
				children: { type: 'array', items: { $ref: '#/components/schemas/ContractBlock' } }
			}
		},
		Contract: {
			type: 'object',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				title: { type: 'string' },
				content: { type: 'array', items: { $ref: '#/components/schemas/ContractBlock' } },
				status: { type: 'string', enum: ['draft', 'reviewing', 'finalized'] },
				userId: { type: 'string' },
				isFavorite: { type: 'boolean' },
				party: { type: 'string' },
				contractType: { type: 'string' },
				aiRiskScore: { type: 'number' },
				riskLevel: { type: 'string', enum: ['Low', 'Medium', 'High'] },
				summary: { type: 'string' },
				effectiveDate: { type: 'string', format: 'date-time' },
				createdAt: { type: 'string', format: 'date-time' },
				updatedAt: { type: 'string', format: 'date-time' }
			}
		},
		ContractListData: {
			type: 'object',
			properties: {
				contracts: { type: 'array', items: { $ref: '#/components/schemas/Contract' } },
				total: { type: 'integer' },
				page: { type: 'integer' },
				limit: { type: 'integer' }
			}
		},
		Template: {
			type: 'object',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				label: { type: 'string' },
				description: { type: 'string' },
				category: { type: 'string' },
				content: { type: 'array', items: { type: 'object', additionalProperties: true } }
			}
		},
		Clause: {
			type: 'object',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				title: { type: 'string' },
				content: { type: 'string' },
				category: { type: 'string' },
				tags: { type: 'array', items: { type: 'string' } },
				usageCount: { type: 'integer' }
			}
		},
		Notification: {
			type: 'object',
			additionalProperties: true,
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['info', 'success', 'warning', 'error'] },
				title: { type: 'string' },
				message: { type: 'string' },
				read: { type: 'boolean' },
				createdAt: { type: 'string', format: 'date-time' }
			}
		},
		SignerInput: {
			type: 'object',
			required: ['email', 'name'],
			properties: {
				email: { type: 'string', format: 'email' },
				name: { type: 'string', maxLength: 200 },
				roleId: { type: 'string', maxLength: 100 },
				roleName: { type: 'string', maxLength: 100 }
			}
		},
		ReviewIssue: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				type: { type: 'string', enum: ['risk', 'missing', 'inconsistency', 'suggestion'] },
				severity: { type: 'string', enum: ['low', 'medium', 'high'] },
				title: { type: 'string' },
				description: { type: 'string' },
				suggestion: { type: 'string' }
			}
		},
		ChatAssistantMessage: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				role: { type: 'string', enum: ['assistant'] },
				content: { type: 'string' },
				timestamp: { type: 'string', format: 'date-time' }
			}
		},
		ImageUploadResult: {
			type: 'object',
			additionalProperties: true,
			description: 'Shape from imageService / Cloudinary or local storage'
		}
	},
	responses: {
		BadRequest: {
			description: 'Validation error (Joi) or bad input',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ApiErrorResponse' }
				}
			}
		},
		Unauthorized: {
			description: 'Missing or invalid JWT',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ApiErrorResponse' }
				}
			}
		},
		Forbidden: {
			description: 'Authenticated but insufficient permission',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ApiErrorResponse' }
				}
			}
		},
		NotFound: {
			description: 'Resource not found',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ApiErrorResponse' }
				}
			}
		},
		InternalError: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ApiErrorResponse' }
				}
			}
		}
	}
};
