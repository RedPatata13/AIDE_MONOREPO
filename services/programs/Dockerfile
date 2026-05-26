FROM public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
RUN npm run build
COPY dist/ ./

CMD ["handlers/health.handler"]