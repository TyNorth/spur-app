# Navigate to the src directory (update the path as needed)
cd src

# Create feature folders
mkdir -p features/suggestions/components
mkdir -p features/suggestions/store
mkdir -p features/groups/components
mkdir -p features/groups/store
mkdir -p features/profile/components
mkdir -p features/profile/store
mkdir -p features/shared/components
mkdir -p features/shared/store

# Create placeholder files for routes and utilities
New-Item -ItemType File -Path features/suggestions/routes.js
New-Item -ItemType File -Path features/suggestions/utils.js
New-Item -ItemType File -Path features/groups/routes.js
New-Item -ItemType File -Path features/groups/utils.js
New-Item -ItemType File -Path features/profile/routes.js
New-Item -ItemType File -Path features/shared/api.js
New-Item -ItemType File -Path features/shared/constants.js
New-Item -ItemType File -Path features/shared/utils.js
