# Authentication system with FaceTec and ReactJS

This project is an authentication system that uses FaceTec's facial recognition service integrated with Vite, ReactJS and TypeScript. It allows users to be registered in the FaceTec database and authenticated using facial recognition.

## Project configuration

1. Create a developer account on FaceTec:
    - Go to [https://dev.facetec.com/](https://dev.facetec.com) and create a FaceTec developer account.
    - After creating a developer account, download the FaceTec Browser SDK from the Download SDKs section.
2. Configure the Environment Variables:
    - In the `core-sdk` directory of the FaceTec SDK you downloaded, open the `Config.js` file and copy the contents of the `PublicFaceScanEncryptionKey` variable. Paste this content into the `faceTec.ts` file located in the `src/configs/faceTec.ts` folder.
    - Also, create an `.env` file in the root of the project and fill it with the information from the `Config.js` file.

## Installation

Install the Dependencies and Start the Development Server

```bash
  npm install
  npm run dev
```
    
## Features

- FaceTec User Registration: Users can register using FaceTec's facial recognition service.
- Facial Recognition Authentication: After registering, users can authenticate using facial recognition.

## How to contribute

If you would like to contribute to this project, please follow the steps below:

1. Fork the project.
2. Create a new branch with your feature: `git checkout -b my-new-feature`.
3. Commit your changes: `git commit -m 'I've added a new feature'`.
4. Push to the branch: `git push origin my-new-feature`.
5. Submit a Pull Request.

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/).