#!/bin/bash

# Variables
REMOTE_BACKEND_REPO_URL="git@github.com:sontl/SingMeSong-build.git"  # Replace with your remote repository URL
REMOTE_FRONTEND_REPO_URL="git@github.com:sontl/SingMeSong-frontend-prod.git"  # Replace with your remote repository URL
BASE_DIR="/Users/sontl/workspace"
APP_DIR="$BASE_DIR/sing-me-song/app"
BUILD_BACKEND_DIR="$APP_DIR/.wasp/build"
BUILD_FRONTEND_DIR="$BUILD_BACKEND_DIR/web-app"
TEMP_BACKEND_DIR="$BASE_DIR/singmesong-build-git"
TEMP_FRONTEND_DIR="$BASE_DIR/singmesong-web-app-git"

# Navigate to the build directory
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Navigating to the app directory...\033[0m"
cd "$APP_DIR" || { echo "Directory change failed"; exit 1; }
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Current directory: $(pwd)\033[0m"
# Run the build command
echo -e "\033[35mRunning wasp build...\033[0m"
wasp build

# Remove the temporary directory if it exists
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Removing the temporary backend directory...\033[0m"
rm -rf "$TEMP_BACKEND_DIR"

# Clone the remote repository into a temporary directory
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Cloning the remote backend repository...\033[0m"
git clone "$REMOTE_BACKEND_REPO_URL" "$TEMP_BACKEND_DIR" || { echo "Clone failed"; exit 1; }

# Navigate to the cloned repository
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Navigating to the cloned backend repository...\033[0m"
cd "$TEMP_BACKEND_DIR" || { echo "Directory change failed"; exit 1; }
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Current directory: $(pwd)\033[0m"

# Pull latest changes from the remote repository
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Pulling latest changes from remote...\033[0m"
git pull origin main || { echo "Pull failed, resolving conflicts may be necessary"; exit 1; }

# Clean up the cloned folder (except for .git directory)
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Cleaning up the cloned backend directory...\033[0m"
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +

# Ensure we're still in a git repository
if [ ! -d ".git" ]; then
    echo -e "\033[31m🚨 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Error: .git directory not found. Exiting.\033[0m"
    exit 1
fi

# Copy build files to the cleaned repository
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Copying build backend files...\033[0m"
cp -r "$BUILD_BACKEND_DIR/"* .

# Check for changes
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Checking for changes...\033[0m"
git status

# Stage the changes
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Staging changes...\033[0m"
git add .

# Commit the changes
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Committing changes...\033[0m"
git commit -m "Add build files" || { echo "No changes to commit"; }

# Push to the remote repository
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Pushing changes to backend remote...\033[0m"
git push origin main

echo -e "\033[35m🎉 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Deployment backend completed successfully!\033[0m"

# Clean up by removing the temporary directory
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Removing the temporary backend directory...\033[0m"
rm -rf "$TEMP_BACKEND_DIR"


# Deploy frontend
# Navigate to the frontend directory
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Navigating to the frontend directory...\033[0m"
cd "$BUILD_FRONTEND_DIR"
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Current directory: $(pwd)\033[0m"

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Installing dependencies...\033[0m"
npm install

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Building the frontend...\033[0m"
REACT_APP_API_URL=https://api.singmesong.com npm run build

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Removing the temporary frontend directory...\033[0m"
rm -rf "$TEMP_FRONTEND_DIR"

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Cloning the remote frontend repository...\033[0m"
git clone "$REMOTE_FRONTEND_REPO_URL" "$TEMP_FRONTEND_DIR" || { echo "Clone failed"; exit 1; }

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Navigating to the cloned frontend repository...\033[0m"
cd "$TEMP_FRONTEND_DIR" || { echo "Directory change failed"; exit 1; }
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Current directory: $(pwd)\033[0m"


# Clean up the cloned folder (except for .git directory)
echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Cleaning up the cloned frontend directory...\033[0m"
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +

# Ensure we're still in a git repository
if [ ! -d ".git" ]; then
    echo -e "\033[31m🚨 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Error: .git directory not found. Exiting.\033[0m"
    exit 1
fi

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Copying build frontend files...\033[0m"
cp -r "$BUILD_FRONTEND_DIR/build/"* .

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Checking for changes...\033[0m"
git status

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Staging changes...\033[0m"
git add .

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Committing changes...\033[0m"
git commit -m "Add build files" || { echo "No changes to commit"; exit 0; }

echo -e "\033[35m🔍 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Pushing changes to frontend remote...\033[0m"
git push origin main

echo -e "\033[35m🎉 ✩ ♬ ₊˚.🎧⋆☾⋆⁺₊✧ Deployment frontend completed successfully!\033[0m"

# clean up
rm -rf "$TEMP_FRONTEND_DIR"

