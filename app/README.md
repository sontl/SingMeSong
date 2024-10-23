# SingMeSong

Built with [Wasp](https://wasp-lang.dev), based on the [Open Saas](https://opensaas.sh) template.

## Development

### Running locally

- Make sure you have the `.env.client` and `.env.server` files with correct dev values in the root of the project.
- Run the database with `wasp start db` and leave it running.
- Run `wasp start` and leave it running.
- [OPTIONAL]: If this is the first time starting the app, or you've just made changes to your entities/prisma schema, also run `wasp db migrate-dev`.

### Running Unit Tests

To run the unit tests for this project:

1. Make sure you have all the necessary dependencies installed:

   ```
   npm install
   ```

2. Run the tests using the following command:

   ```
   npm test
   ```

3. To run tests with coverage information, use:

   ```
   npm test -- --coverage
   ```

4. To run a specific test file, use:

   ```
   npm test -- path/to/your/test/file.test.ts
   ```

5. To run tests in watch mode (tests will re-run automatically when files change):
   ```
   npm test -- --watch
   ```

Remember to write your tests in files with the `.test.ts` or `.spec.ts` extension in the `tests` directory.

## Deployment

To deploy the app, run the `deploy.sh` script. This script will build the app, clone the remote backend and frontend repositories, copy the build files to the cloned repositories, and push the changes to the remote repositories.
There are 2 remote repositories:

- [Backend](https://github.com/sontl/SingMeSong-build)
- [Frontend](https://github.com/sontl/SingMeSong-frontend-prod)

The backend deployment is for docker deployment, and the frontend deployment is for static file serving.
