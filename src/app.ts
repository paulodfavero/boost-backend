import fastify from 'fastify'
import cors from '@fastify/cors'

import { expensesRoutes } from '@/http/controllers/expenses/routes'
import { gainsRoutes } from '@/http/controllers/gains/routes'
import { categoryRoutes } from '@/http/controllers/category/routes'
import { companyRoutes } from './http/controllers/company/routes'
import { bankRoutes } from './http/controllers/bank/routes'
import { organizationRoutes } from './http/controllers/organization/routes'
import { userRoutes } from './http/controllers/user/routes'

export const app = fastify()

app.register(cors, {
  // put your options here
})
app.register(expensesRoutes)
app.register(gainsRoutes)
app.register(categoryRoutes)
app.register(companyRoutes)
app.register(bankRoutes)
app.register(organizationRoutes)
app.register(userRoutes)
