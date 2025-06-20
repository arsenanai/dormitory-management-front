SDU Dormitory Management Frontend
=================================

This is the frontend for the SDU Dormitory Management System, built with Vue 3, TypeScript, Tailwind CSS, and Pinia. It provides an admin interface for managing students, guests, rooms, dormitories, payments, and more.

Features
--------

*   **Authentication**: Secure login for admins.
*   **Student & Guest Management**: Add, edit, and view students and guests.
*   **Room & Dormitory Management**: Manage rooms, room types, and dormitories.
*   **Payments**: Track and manage student and guest payments.
*   **Messaging**: Send and receive messages within the system.
*   **Responsive UI**: Built with Tailwind CSS and Flowbite for a modern, responsive design.
*   **Multi-language Support**: English, Kazakh, and Russian (see `/src/i18n/`).

Project Structure
-----------------

src/
  assets/           # Images and static assets
  components/       # Reusable Vue components (inputs, tables, buttons, etc.)
  models/           # TypeScript models for data structures
  pages/            # Main page components (Students, Guests, Payments, etc.)
  router/           # Vue Router configuration
  services/         # API and business logic (if any)
  stores/           # Pinia stores for state management
  i18n/             # Localization files
  index.css         # Tailwind and custom CSS
  main.ts           # App entry point

Getting Started
---------------

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Docker](https://www.docker.com/) (optional, for containerized development)

### Installation

    
    # Install dependencies
    npm install
    # or
    yarn install
    

### Development

    
    npm run dev
    # or
    yarn dev
    

The app will be available at [http://localhost:5173](http://localhost:5173) (or as configured).

### Linting & Formatting

    
    npm run lint
    npm run format
    

### Testing

    
    npm run test:unit
    

### Build for Production

    
    npm run build
    

### Docker Usage

You can use Docker Compose for development, testing, and production builds:

    
    # Install dependencies
    docker compose run --rm init
    
    # Start development server
    docker compose --profile dev up
    
    # Run unit tests
    docker compose --profile test up
    
    # Build for production
    docker compose --profile build up
    
    # Serve production build with Nginx
    docker compose --profile serve up
    

Customization
-------------

*   **Theme Colors**: See `/src/index.css` for SDU color palette and font settings.
*   **Localization**: Edit `/src/i18n/en.json`, `kk.json`, `ru.json` for translations.
*   **Component Library**: Uses custom components in `/src/components/` and Flowbite for UI.

Contributing
------------

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/YourFeature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin feature/YourFeature`)
5.  Create a new Pull Request

License
-------

This project is private and for SDU internal use only.

* * *

**SDU Dormitory Management System**  
Contact: [info@sdu.edu.kz](mailto:info@sdu.edu.kz)