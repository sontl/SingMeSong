# SingMeSong

This project is based on [OpenSaas](https://opensaas.sh) template and consists of three main dirs:
1. `app` - Your web app, built with [Wasp](https://wasp-lang.dev).
2. `e2e-tests` - [Playwright](https://playwright.dev/) tests for your Wasp web app.
3. `blog` - Your blog / docs, built with [Astro](https://docs.astro.build) based on [Starlight](https://starlight.astro.build/) template.

For more details, check READMEs of each respective directory!

## Running the Project

### Prerequisites
- Node.js (v14 or higher)
- Wasp (v0.2.0 or higher)
- Playwright (for e2e tests)
- Astro (for the blog/docs)

### Setup

1. **Clone the repository:**
    ```sh
    git clone https://github.com/sontl/SingMeSong.git
    cd SingMeSong
    ```

2. **Install dependencies:**
    ```sh
    cd app
    npm install
    ```

3. **Run the web app:**
    ```sh
    wasp start
    ```

4. **Run the end-to-end tests:**
    ```sh
    cd ../e2e-tests
    npx playwright test
    ```

5. **Run the blog/docs:**
    ```sh
    cd ../blog
    npm install
    npm start
    ```

### Directory Structure
- `app/` - Contains the source code for the web application.
- `e2e-tests/` - Contains Playwright tests for end-to-end testing.
- `blog/` - Contains the blog and documentation built with Astro.

### Additional Resources
- [Wasp Documentation](https://wasp-lang.dev/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Astro Documentation](https://docs.astro.build)

For more details, check READMEs of each respective directory!
