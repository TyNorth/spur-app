export const activityTypesByMood = {
  Relaxed: [
    'park',
    'spa',
    'library',
    'art_gallery',
    'tourist_attraction',
    'botanical_garden',
    'scenic_viewpoint',
  ],
  Focused: [
    'cafe',
    'book_store', // Updated to match supported types
    'library',
    'museum',
    'art_gallery',
    'university',
  ],
  Adventurous: [
    'park', // Hiking trails and outdoor activities are often associated with parks
    'tourist_attraction',
    'amusement_park', // For adventure rides
    'aquarium', // Engaging adventurous indoor activity
    'zoo',
  ],
  Excited: [
    'restaurant',
    'night_club', // Popular for nightlife excitement
    'amusement_park',
    'bowling_alley',
    'movie_theater',
    'stadium', // For sporting events
    'tourist_attraction',
    'arcade',
  ],
  Energetic: [
    'gym',
    'yoga_studio',
    'stadium', // For sports activities
    'fitness_center', // Alternative for workout spaces
    'amusement_park', // For energetic physical fun
    'swimming_pool',
    'trampoline_park', // Requires custom mapping or nearest category
  ],
}

// Function to get a random activity type for the selected mood
// Function to get the first activity type for the selected mood
// Function to get a random activity type for the selected mood
export const getActivityByMood = (mood) => {
  const activities = activityTypesByMood[mood]
  if (activities && activities.length > 0) {
    const randomIndex = Math.floor(Math.random() * activities.length)
    const randomActivity = activities[randomIndex]
    return encodeURIComponent(randomActivity.trim()) // URL-encode the activity
  }
  return null // Fallback if no activities are available
}
