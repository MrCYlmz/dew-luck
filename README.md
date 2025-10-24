# Dew-Luck

A Vue 3 + TypeScript + Vite application for managing weighted random person selection. Create groups of people with custom weights and randomly select individuals using an animated spinning wheel interface.

## Features

- **Group Management**: Create, edit, copy, and delete groups of people
- **Weighted Selection**: Assign custom weights to individuals to influence selection probability
- **Animated Wheel**: Visual spinning wheel interface for random selection
- **Selection Tracking**: Track who has been selected with "Respect Early Selection" option
- **Smart Selection States**:
  - **Select**: Marks person as selected and respects this in future selections
  - **Absent**: Temporarily removes person from current session and spins again
  - **Cancel**: Closes dialog without any changes
- **Selection Reset**: Reset all selections for a group to start fresh

## Requirements

### Backend Dependency

**IMPORTANT**: This frontend application requires a REST API backend to function. The backend must be running at `http://localhost:3000` (configurable in `src/requests/requests.ts`).

For local development, use the companion backend:
- Repository: [dew-luck-backend](https://github.com/celal/dew-luck-backend) (check the profile)
- The backend should provide the following REST endpoints:
  - `GET /groups` - Fetch all groups
  - `POST /groups` - Create a new group
  - `PUT /groups/:id` - Update a group
  - `DELETE /groups/:id` - Delete a group
  - `PUT /groups/:id/persons/:name/selected` - Mark a person as selected
  - `PUT /groups/:id/reset-selections` - Reset all selections in a group

### System Requirements

- Node.js (v16 or higher recommended)
- npm or yarn package manager

## Installation

```bash
# Clone the repository
git clone https://github.com/celal/dew-luck.git
cd dew-luck

# Install dependencies
npm install
```

## Development

```bash
# Start development server (runs on http://localhost:5173 by default)
npm run dev

# Type check and build for production
npm run build

# Preview production build locally
npm run preview
```

## Usage

1. **Start the Backend**: Make sure the `dew-luck-backend` is running on `http://localhost:3000`
2. **Start the Frontend**: Run `npm run dev` and open `http://localhost:5173`
3. **Create a Group**:
   - Click "Create Group"
   - Enter a group name
   - Toggle "Weighted Selection" if you want custom weights
   - Toggle "Respect Early Selection" to exclude previously selected people
   - Add people to the group
   - Click "Create"
4. **Select a Person**:
   - Choose a group from the dropdown
   - Click the spinning wheel (or the center "Spin" button)
   - Wait for the animation to complete
   - Choose an action:
     - **Select**: Marks the person as selected
     - **Absent**: Removes from current session and spins again
     - **Cancel**: Dismisses without changes


## Architecture

The application follows Vue 3 Composition API patterns with a focus on:

- **Composables**: Reusable logic for wheel calculations, animations, and dialogs
- **Component Communication**: Template refs for dialog control, props for data, events for updates
- **State Management**: Simple in-memory caching with cache invalidation
- **Type Safety**: Full TypeScript support with strict typing

## Key Algorithms

### Weighted Random Selection
The weighted selection algorithm ensures that people with higher weights have proportionally higher chances of being selected:

```typescript
1. Generate random number from 0 to total weight sum
2. Iterate through people, subtracting their weight from the random number
3. Select the person when the random number becomes negative
```

### Wheel Animation
The spinning wheel uses progressive deceleration for a natural feel:
- Initial fast spinning (20ms delay between segments)
- Progressive slowdown with increasing delays
- 3 full rotations plus the target segment

## Configuration

To change the backend API URL, modify `src/requests/requests.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000'; // Change this to your backend URL
```

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues or questions:
- Open an issue on GitHub
- Refer to the backend repository for API-related issues

---

**Note**: This is a frontend application only. Make sure the backend server is running before starting development or production use.
