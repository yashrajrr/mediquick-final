# MediQuick Rx

MediQuick Rx is a comprehensive healthcare platform that revolutionizes medication management and doctor consultations. Built with Next.js and powered by Firebase and AI, it offers secure prescription uploads, AI-driven analysis, real-time inventory tracking, drug interaction checking, and seamless doctor appointments.

## Features

### For Patients
- **Secure Prescription Upload**: Upload prescriptions securely via presigned URLs
- **AI-Powered Prescription Analysis**: Automatic extraction of prescription information with manual review options
- **Drug Interaction Checker**: Real-time alerts for potential harmful drug interactions
- **Symptom Checker**: AI-powered symptom analysis to suggest appropriate medications
- **Automated Refill Scheduling**: Set up automatic prescription refills and deliveries
- **Live Order Tracking**: GPS-based real-time tracking of medication deliveries
- **Doctor Consultations**: Book appointments with qualified doctors
- **Health Dashboard**: Comprehensive view of health metrics and history

### For Doctors
- **Appointment Management**: Schedule and manage patient appointments
- **Digital Prescriptions**: Issue prescriptions digitally
- **Patient Records**: Access to patient history and consultation notes
- **Earnings Tracking**: Monitor consultation fees and wallet balance

### For Pharmacies/Sellers
- **Inventory Management**: Real-time stock level tracking
- **Order Fulfillment**: Process and fulfill medication orders
- **Product Management**: Manage pharmacy products and pricing

### AI Features
- Prescription information extraction
- Drug interaction analysis
- Symptom-based medicine recommendations
- Message moderation for community chats

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **AI**: Google AI (Genkit), custom AI flows
- **Deployment**: Firebase App Hosting
- **Other**: Framer Motion for animations, React Hook Form for forms

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase CLI (for deployment)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mediquick-rx.git
   cd mediquick-rx
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore, Authentication, and Storage
   - Configure Firestore security rules as per `firestore.rules`
   - Set up Firebase App Hosting

## Usage

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. For AI development:
   ```bash
   npm run genkit:dev
   ```

3. Build for production:
   ```bash
   npm run build
   npm run start
   ```

### Deployment

Deploy to Firebase App Hosting:
```bash
firebase deploy --only hosting
```

## Project Structure

```
src/
├── ai/                    # AI flows and Genkit configuration
├── app/                   # Next.js app router pages
│   ├── dashboard/         # User dashboard
│   ├── doctor-dashboard/  # Doctor dashboard
│   ├── seller-dashboard/  # Pharmacy dashboard
│   └── ...
├── components/            # Reusable UI components
├── firebase/              # Firebase configuration and hooks
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions

docs/                      # Project documentation
public/                    # Static assets
```

## API Endpoints

The application uses Firebase Firestore with the following main collections:
- `users` - User profiles
- `sellers` - Pharmacy profiles
- `doctors` - Doctor profiles
- `appointments` - Scheduled appointments
- `prescriptions` - Digital prescriptions
- `communities/*/messages` - Community chat messages

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Code Quality

- **Linting**: ESLint configuration in `.eslintrc.json`
- **TypeScript**: Strict type checking enabled
- **Pre-commit hooks**: Run linting and type checking before commits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@mediquickrx.com or join our community forum.

## Roadmap

- [ ] Mobile app development
- [ ] Integration with wearable devices
- [ ] Advanced AI diagnostics
- [ ] Multi-language support
- [ ] Offline functionality

---

Built with ❤️ for better healthcare accessibility.
