/* eslint-disable max-lines -- single source of truth for API paths */

const errRefs = {
	400: { $ref: '#/components/responses/BadRequest' },
	401: { $ref: '#/components/responses/Unauthorized' },
	403: { $ref: '#/components/responses/Forbidden' },
	404: { $ref: '#/components/responses/NotFound' },
	500: { $ref: '#/components/responses/InternalError' }
};

const bearer = [{ bearerAuth: [] }];

/** OpenAPI paths relative to server URL `/api/v1` */
export const openApiPaths: Record<string, Record<string, unknown>> = {
	'/health': {
		get: {
			tags: ['Health'],
			summary: 'Liveness / DB connectivity',
			description:
				'Liveness for orchestrators: returns 200 when MongoDB is connected, else 503. During graceful shutdown, `shutting_down` is true but the process is still alive (use GET /health/ready to stop traffic). Production omits uptime/database debug fields.',
			responses: {
				200: {
					description: 'Service healthy',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									status: { type: 'string', example: 'ok' },
									timestamp: { type: 'string', format: 'date-time' },
									shutting_down: { type: 'boolean', description: 'True while draining after SIGTERM/SIGINT' },
									uptime: { type: 'number' },
									database: {
										type: 'object',
										properties: {
											state: { type: 'integer' },
											healthy: { type: 'boolean' }
										}
									}
								}
							}
						}
					}
				},
				503: { description: 'Database not connected' }
			}
		}
	},
	'/health/external': {
		get: {
			tags: ['Health'],
			summary: 'Dependency probes (MongoDB, Gemini)',
			description:
				'MongoDB reflects connection state. When GEMINI_API_KEY is set, Gemini defaults to status `configured` (no API call) to avoid burning quota on frequent polls. Set GEMINI_HEALTH_LIVE_PROBE=true for a real generateContent probe.',
			responses: {
				200: { description: 'All configured dependencies healthy' },
				503: { description: 'One or more dependencies unhealthy' }
			}
		}
	},
	'/health/ready': {
		get: {
			tags: ['Health'],
			summary: 'Readiness (MongoDB, SMTP, Cloudinary)',
			description:
				'Structured readiness for load balancers. Returns `{ success, data: { status, checks } }`. ' +
				'Returns 503 with `reason: shutting_down` while the process is draining after SIGTERM/SIGINT. ' +
				'SMTP and Cloudinary are skipped (`not_configured`) when env is incomplete; they must be `healthy` when configured. MongoDB must always be healthy.',
			responses: {
				200: {
					description: 'All required checks passed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											status: { type: 'string', enum: ['ready'] },
											checks: { type: 'object', additionalProperties: true }
										}
									}
								}
							}
						}
					}
				},
				503: {
					description: 'One or more required checks failed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [false] },
									data: {
										type: 'object',
										properties: {
											status: { type: 'string', enum: ['not_ready'] },
											checks: { type: 'object', additionalProperties: true }
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},

	'/auth/google': {
		get: {
			tags: ['Auth'],
			summary: 'Start Google OAuth',
			description: 'Redirects to Google. Returns 501 if OAuth not configured.',
			responses: {
				302: { description: 'Redirect to Google' },
				501: { description: 'Google sign-in not configured' }
			}
		}
	},
	'/auth/google/callback': {
		get: {
			tags: ['Auth'],
			summary: 'Google OAuth callback',
			description: 'Redirects to FRONTEND_URL/auth/callback with tokens in URL hash.',
			responses: {
				302: { description: 'Redirect to frontend with tokens' }
			}
		}
	},
	'/auth/signup': {
		post: {
			tags: ['Auth'],
			summary: 'Register',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['name', 'email', 'password'],
							properties: {
								name: { type: 'string', minLength: 2, maxLength: 200 },
								email: { type: 'string', format: 'email', maxLength: 255 },
								password: { type: 'string', minLength: 6, maxLength: 128 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					description: 'User and tokens',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											user: { $ref: '#/components/schemas/User' },
											tokens: { $ref: '#/components/schemas/AuthTokens' }
										}
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/signin': {
		post: {
			tags: ['Auth'],
			summary: 'Sign in',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['email', 'password'],
							properties: {
								email: { type: 'string', format: 'email' },
								password: { type: 'string', minLength: 1, maxLength: 128 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					description: 'User and tokens',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											user: { $ref: '#/components/schemas/User' },
											tokens: { $ref: '#/components/schemas/AuthTokens' }
										}
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/current': {
		get: {
			tags: ['Auth'],
			summary: 'Current user (light)',
			security: bearer,
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/me': {
		get: {
			tags: ['Auth'],
			summary: 'Get my profile',
			security: bearer,
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/User' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		put: {
			tags: ['Auth'],
			summary: 'Update my profile',
			security: bearer,
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								name: { type: 'string', minLength: 2, maxLength: 200 },
								email: { type: 'string', format: 'email' },
								password: { type: 'string', minLength: 6, maxLength: 128 },
								avatar: { type: 'string', maxLength: 500 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/User' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/signout': {
		post: {
			tags: ['Auth'],
			summary: 'Sign out (invalidate refresh token)',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['refreshToken'],
							properties: { refreshToken: { type: 'string' } }
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'string', example: 'Signout success' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/refresh-tokens': {
		post: {
			tags: ['Auth'],
			summary: 'Refresh access + refresh tokens',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['refreshToken'],
							properties: { refreshToken: { type: 'string' } }
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											tokens: { $ref: '#/components/schemas/AuthTokens' }
										}
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/send-verification-email': {
		post: {
			tags: ['Auth'],
			summary: 'Send email verification',
			security: bearer,
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'string' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/verify-email': {
		post: {
			tags: ['Auth'],
			summary: 'Verify email with token (query)',
			parameters: [
				{
					name: 'token',
					in: 'query',
					required: true,
					schema: { type: 'string' }
				}
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'string', example: 'Verify email success' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/forgot-password': {
		post: {
			tags: ['Auth'],
			summary: 'Request password reset email',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['email'],
							properties: { email: { type: 'string', format: 'email' } }
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'string' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/auth/reset-password': {
		post: {
			tags: ['Auth'],
			summary: 'Reset password',
			parameters: [
				{
					name: 'token',
					in: 'query',
					required: true,
					schema: { type: 'string' }
				}
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['password'],
							properties: { password: { type: 'string', minLength: 6, maxLength: 128 } }
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'string' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/users': {
		get: {
			tags: ['Users'],
			summary: 'List users (paginated)',
			description: 'Requires permission `user:read`.',
			security: bearer,
			parameters: [
				{ name: 'q', in: 'query', schema: { type: 'string', maxLength: 100 } },
				{
					name: 'sortBy',
					in: 'query',
					schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'name', 'email'] }
				},
				{ name: 'sortDirection', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
									pagination: { $ref: '#/components/schemas/PaginationTotal' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		post: {
			tags: ['Users'],
			summary: 'Create user',
			description: 'Requires permission `user:create`.',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['name', 'email', 'password', 'roles'],
							properties: {
								name: { type: 'string', minLength: 2, maxLength: 200 },
								email: { type: 'string', format: 'email' },
								password: { type: 'string', minLength: 6, maxLength: 128 },
								roles: {
									type: 'array',
									minItems: 1,
									maxItems: 6,
									items: { $ref: '#/components/schemas/MongoObjectId' },
									uniqueItems: true
								},
								avatar: { type: 'string', maxLength: 500 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/User' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/users/{userId}': {
		get: {
			tags: ['Users'],
			summary: 'Get user by ID',
			security: bearer,
			parameters: [{ name: 'userId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/User' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		put: {
			tags: ['Users'],
			summary: 'Update user',
			security: bearer,
			parameters: [{ name: 'userId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								name: { type: 'string' },
								email: { type: 'string', format: 'email' },
								password: { type: 'string' },
								roles: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 6, uniqueItems: true },
								avatar: { type: 'string' }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/User' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		delete: {
			tags: ['Users'],
			summary: 'Delete user',
			security: bearer,
			parameters: [{ name: 'userId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'string' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/roles': {
		get: {
			tags: ['Roles'],
			summary: 'List roles',
			security: bearer,
			parameters: [
				{ name: 'q', in: 'query', schema: { type: 'string' } },
				{
					name: 'sortBy',
					in: 'query',
					schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'name', 'description'] }
				},
				{ name: 'sortDirection', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
				{ name: 'limit', in: 'query', schema: { type: 'integer' } },
				{ name: 'page', in: 'query', schema: { type: 'integer' } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { $ref: '#/components/schemas/Role' } },
									pagination: { $ref: '#/components/schemas/PaginationTotal' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		post: {
			tags: ['Roles'],
			summary: 'Create role',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['name'],
							properties: {
								name: { type: 'string', minLength: 2, maxLength: 100 },
								description: { type: 'string', maxLength: 500 },
								permissions: { type: 'array', items: { type: 'string' }, uniqueItems: true }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Role' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/roles/{roleId}': {
		get: {
			tags: ['Roles'],
			summary: 'Get role',
			security: bearer,
			parameters: [{ name: 'roleId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Role' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		put: {
			tags: ['Roles'],
			summary: 'Update role',
			security: bearer,
			parameters: [{ name: 'roleId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								name: { type: 'string' },
								description: { type: 'string' },
								permissions: { type: 'array', items: { type: 'string' }, uniqueItems: true }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Role' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		delete: {
			tags: ['Roles'],
			summary: 'Delete role',
			security: bearer,
			parameters: [{ name: 'roleId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/images/upload': {
		post: {
			tags: ['Images'],
			summary: 'Upload image (multipart)',
			description:
				'Requires permission `image:create`. Form field name must be **`image`** (see `uploadImage` middleware). Max size 6MB; PNG, JPEG, GIF.',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							properties: {
								image: { type: 'string', format: 'binary' }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/ImageUploadResult' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/notifications': {
		get: {
			tags: ['Notifications'],
			summary: 'List my notifications',
			security: bearer,
			parameters: [
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
				{ name: 'unreadOnly', in: 'query', schema: { type: 'boolean' } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
									pagination: { $ref: '#/components/schemas/PaginationTotal' },
									unreadCount: { type: 'integer', minimum: 0 }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/notifications/read-all': {
		patch: {
			tags: ['Notifications'],
			summary: 'Mark all notifications read',
			security: bearer,
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											markedCount: { type: 'integer' }
										}
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/notifications/{notificationId}/read': {
		patch: {
			tags: ['Notifications'],
			summary: 'Mark one notification read',
			security: bearer,
			parameters: [
				{ name: 'notificationId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Notification' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/contracts': {
		get: {
			tags: ['Contracts'],
			summary: 'List my contracts',
			security: bearer,
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
				{
					name: 'sortBy',
					in: 'query',
					schema: {
						type: 'string',
						enum: ['createdAt', 'updatedAt', 'title', 'status', 'contractType', 'aiRiskScore']
					}
				},
				{ name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/ContractListData' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		post: {
			tags: ['Contracts'],
			summary: 'Create contract',
			security: bearer,
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string', maxLength: 500, default: 'Untitled Agreement' },
								content: { type: 'array', items: { type: 'object', additionalProperties: true } },
								status: { type: 'string', enum: ['draft', 'reviewing', 'finalized'] },
								metadata: { type: 'object', additionalProperties: true },
								party: { type: 'string', maxLength: 200 },
								contractType: { type: 'string', maxLength: 100 },
								effectiveDate: { type: 'string', format: 'date-time' },
								summary: { type: 'string', maxLength: 2000 }
							}
						}
					}
				}
			},
			responses: {
				201: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/generate': {
		post: {
			tags: ['Contracts'],
			summary: 'Generate contract with AI from prompt',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['prompt'],
							properties: { prompt: { type: 'string', minLength: 5, maxLength: 2000 } }
						}
					}
				}
			},
			responses: {
				201: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									message: { type: 'string' },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/from-template': {
		post: {
			tags: ['Contracts', 'Templates'],
			summary: 'Create contract from template',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['templateId'],
							properties: {
								templateId: { type: 'string' },
								title: { type: 'string', maxLength: 500 }
							}
						}
					}
				}
			},
			responses: {
				201: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/{id}': {
		get: {
			tags: ['Contracts'],
			summary: 'Get contract',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		put: {
			tags: ['Contracts'],
			summary: 'Update contract',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								content: { type: 'array', items: { type: 'object', additionalProperties: true } },
								status: { type: 'string', enum: ['draft', 'reviewing', 'finalized'] },
								metadata: { type: 'object', additionalProperties: true },
								party: { type: 'string' },
								contractType: { type: 'string' },
								effectiveDate: { type: 'string', format: 'date-time' },
								summary: { type: 'string' }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		delete: {
			tags: ['Contracts'],
			summary: 'Delete contract',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { nullable: true, description: 'Always null' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/{id}/autosave': {
		patch: {
			tags: ['Contracts'],
			summary: 'Autosave contract content',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['content'],
							properties: {
								content: { type: 'array', items: { type: 'object', additionalProperties: true } },
								lastModified: { type: 'string', format: 'date-time' }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/{id}/download': {
		get: {
			tags: ['Contracts'],
			summary: 'Download contract file',
			description: 'Returns raw bytes (PDF, DOCX, MD, or HTML) with Content-Disposition attachment.',
			security: bearer,
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } },
				{
					name: 'format',
					in: 'query',
					schema: { type: 'string', enum: ['pdf', 'docx', 'md', 'html'], default: 'pdf' }
				}
			],
			responses: {
				200: {
					description: 'Binary file',
					content: {
						'application/pdf': { schema: { type: 'string', format: 'binary' } },
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
							schema: { type: 'string', format: 'binary' }
						},
						'text/markdown': { schema: { type: 'string' } },
						'text/html': { schema: { type: 'string' } }
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/{id}/favorite': {
		patch: {
			tags: ['Contracts'],
			summary: 'Favorite contract',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/contracts/{id}/unfavorite': {
		patch: {
			tags: ['Contracts'],
			summary: 'Unfavorite contract',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Contract' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/templates': {
		get: {
			tags: ['Templates'],
			summary: 'List templates',
			security: bearer,
			parameters: [{ name: 'category', in: 'query', schema: { type: 'string', maxLength: 100 } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { $ref: '#/components/schemas/Template' } }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/clauses': {
		get: {
			tags: ['Clauses'],
			summary: 'List clauses',
			description:
				'Returns an array of clauses in `data`. Pagination is applied server-side; totals are not included in this response.',
			security: bearer,
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer' } },
				{ name: 'limit', in: 'query', schema: { type: 'integer' } },
				{
					name: 'sortBy',
					in: 'query',
					schema: { type: 'string', enum: ['title', 'category', 'usageCount', 'createdAt', 'updatedAt'] }
				},
				{ name: 'sortDirection', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
				{ name: 'category', in: 'query', schema: { type: 'string' } },
				{ name: 'q', in: 'query', schema: { type: 'string' } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { $ref: '#/components/schemas/Clause' } }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		post: {
			tags: ['Clauses'],
			summary: 'Create clause',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['title', 'content', 'category'],
							properties: {
								title: { type: 'string', maxLength: 300 },
								content: { type: 'string' },
								category: { type: 'string', maxLength: 100 },
								tags: { type: 'array', items: { type: 'string', maxLength: 50 }, maxItems: 20 }
							}
						}
					}
				}
			},
			responses: {
				201: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Clause' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/clauses/{id}': {
		get: {
			tags: ['Clauses'],
			summary: 'Get clause',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Clause' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		patch: {
			tags: ['Clauses'],
			summary: 'Update clause',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								content: { type: 'string' },
								category: { type: 'string' },
								tags: { type: 'array', items: { type: 'string' }, maxItems: 20 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/Clause' }
								}
							}
						}
					}
				},
				...errRefs
			}
		},
		delete: {
			tags: ['Clauses'],
			summary: 'Delete clause',
			security: bearer,
			parameters: [{ name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { nullable: true, description: 'Always null' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/ai/ping': {
		get: {
			tags: ['AI'],
			summary: 'Gemini connectivity check',
			description:
				'Sends a minimal prompt (`hi`) to Gemini and returns the model reply. Uses API quota. Unauthenticated — protect with network policy or disable in production if needed.',
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											prompt: { type: 'string', example: 'hi' },
											reply: { type: 'string' }
										}
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/chat/{contractId}': {
		post: {
			tags: ['AI'],
			summary: 'Contract-scoped chat message',
			security: bearer,
			parameters: [{ name: 'contractId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['message'],
							properties: { message: { type: 'string', minLength: 1, maxLength: 5000 } }
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { $ref: '#/components/schemas/ChatAssistantMessage' }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/review/{contractId}': {
		post: {
			tags: ['AI'],
			summary: 'AI contract review (issues array)',
			security: bearer,
			parameters: [{ name: 'contractId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { $ref: '#/components/schemas/ReviewIssue' } }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/editor/rewrite': {
		post: {
			tags: ['AI'],
			summary: 'Rewrite selection',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['contractId', 'selection', 'tone'],
							properties: {
								contractId: { $ref: '#/components/schemas/MongoObjectId' },
								selection: { type: 'string', minLength: 1, maxLength: 10000 },
								tone: { type: 'string', enum: ['formal', 'friendly', 'concise'] }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: { rewrittenText: { type: 'string' } }
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/editor/explain': {
		post: {
			tags: ['AI'],
			summary: 'Explain clause in plain language',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['contractId', 'clauseText'],
							properties: {
								contractId: { $ref: '#/components/schemas/MongoObjectId' },
								clauseText: { type: 'string', minLength: 1, maxLength: 10000 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: { explanation: { type: 'string' } }
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/editor/summarize': {
		post: {
			tags: ['AI'],
			summary: 'Summarize contract',
			security: bearer,
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['contractId'],
							properties: {
								contractId: { $ref: '#/components/schemas/MongoObjectId' },
								content: { type: 'array', items: { type: 'object', additionalProperties: true } }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										additionalProperties: true,
										description: 'Service-specific summary payload'
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/editor/generate-clause': {
		post: {
			tags: ['AI'],
			summary: 'Generate clause from prompt',
			security: bearer,
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['contractId', 'prompt'],
							properties: {
								contractId: { $ref: '#/components/schemas/MongoObjectId' },
								prompt: { type: 'string', minLength: 1, maxLength: 2000 }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/ai/editor/suggest-clauses': {
		post: {
			tags: ['AI'],
			summary: 'Suggest clauses for contract',
			security: bearer,
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['contractId'],
							properties: {
								contractId: { $ref: '#/components/schemas/MongoObjectId' },
								content: { type: 'array', items: { type: 'object', additionalProperties: true } }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/dashboard/metrics': {
		get: {
			tags: ['Dashboard'],
			summary: 'Dashboard metrics',
			security: bearer,
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/dashboard/contracts': {
		get: {
			tags: ['Dashboard'],
			summary: 'Contracts for dashboard',
			security: bearer,
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer' } },
				{ name: 'limit', in: 'query', schema: { type: 'integer' } },
				{ name: 'sortBy', in: 'query', schema: { type: 'string' } },
				{ name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/dashboard/activity': {
		get: {
			tags: ['Dashboard'],
			summary: 'Recent activity',
			security: bearer,
			parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { type: 'object', additionalProperties: true } }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/dashboard/ai-insights': {
		get: {
			tags: ['Dashboard'],
			summary: 'AI insights',
			security: bearer,
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/dashboard/metrics/{metricId}/items': {
		get: {
			tags: ['Dashboard'],
			summary: 'Items for a metric drill-down',
			security: bearer,
			parameters: [
				{
					name: 'metricId',
					in: 'path',
					required: true,
					schema: {
						type: 'string',
						enum: ['total-contracts', 'pending-signatures', 'expiring-soon', 'ai-risk-flags']
					}
				}
			],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { type: 'object', additionalProperties: true } }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},

	'/signatures/{contractId}/signatures/request': {
		post: {
			tags: ['Signatures'],
			summary: 'Request signatures',
			security: bearer,
			parameters: [{ name: 'contractId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['signers'],
							properties: {
								signers: { type: 'array', minItems: 1, maxItems: 20, items: { $ref: '#/components/schemas/SignerInput' } },
								message: { type: 'string', maxLength: 2000 }
							}
						}
					}
				}
			},
			responses: {
				201: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: {
										type: 'object',
										properties: {
											requestId: { type: 'string' },
											status: { type: 'string' },
											sentTo: { type: 'array', items: { type: 'string', format: 'email' } }
										}
									}
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/signatures/{contractId}/signatures': {
		get: {
			tags: ['Signatures'],
			summary: 'List signature requests for contract',
			security: bearer,
			parameters: [{ name: 'contractId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'array', items: { type: 'object', additionalProperties: true } }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	},
	'/signatures/{contractId}/sign': {
		post: {
			tags: ['Signatures'],
			summary: 'Sign document',
			security: bearer,
			parameters: [{ name: 'contractId', in: 'path', required: true, schema: { $ref: '#/components/schemas/MongoObjectId' } }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['signature', 'signerName'],
							properties: {
								signature: { type: 'string' },
								signerName: { type: 'string', maxLength: 200 },
								requestId: { $ref: '#/components/schemas/MongoObjectId' }
							}
						}
					}
				}
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', enum: [true] },
									data: { type: 'object', additionalProperties: true }
								}
							}
						}
					}
				},
				...errRefs
			}
		}
	}
};
