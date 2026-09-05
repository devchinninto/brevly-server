import fastify from 'fastify'
import { env } from '@/env.ts'
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod'
import scalarUI from '@scalar/fastify-api-reference'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import { createShortUrlRoute } from './routes/create-short-url.ts'
import { getUrlsRoute } from './routes/get-all-urls.ts'
import { deleteUrlRoute } from './routes/delete-url.ts'
import { getUrlByShortUrlRoute } from './routes/get-url-by-short-url.ts'
import { exportCsvRoute } from './routes/export-csv.ts'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(fastifyCors, {
  origin: '*'
})

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brevly Server',
      version: '1.0.0'
    }
  },
  transform: jsonSchemaTransform,
  transformObject: jsonSchemaTransformObject
})

server.get('/openapi.json', () => server.swagger())

server.register(scalarUI, {
  routePrefix: '/docs',
  configuration: {
    layout: 'modern'
  }
})

server.register(createShortUrlRoute)
server.register(getUrlsRoute)
server.register(deleteUrlRoute)
server.register(getUrlByShortUrlRoute)
server.register(exportCsvRoute)

server
  .listen({
    host: '0.0.0.0',
    port: env.PORT
  })
  .then(() => {
    console.log(`🟢 Server running on port ${env.PORT}`)
  })
