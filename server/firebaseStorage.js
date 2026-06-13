import { initializeApp } from 'firebase/app'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBlyofRcdFSydK8rtW106dMZCAmEV7ugP4',
  authDomain: 'realmedia-9e290.firebaseapp.com',
  projectId: 'realmedia-9e290',
  storageBucket: 'realmedia-9e290.firebasestorage.app',
  messagingSenderId: '908201210038',
  appId: '1:908201210038:web:f1915072f934fbea9ab617',
  measurementId: 'G-3PKLNX2QKP',
}

const firebaseApp = initializeApp(firebaseConfig)
const storage = getStorage(firebaseApp)

export function safeStorageName(originalName = 'upload') {
  return originalName.replace(/[^\w.\-() ]+/g, '_')
}

export async function uploadToFirebaseStorage(file, folder) {
  const filename = `${Date.now()}-${cryptoRandom()}-${safeStorageName(file.originalname)}`
  const fullPath = `${folder}/${filename}`
  const storageRef = ref(storage, fullPath)
  const snapshot = await uploadBytes(storageRef, file.buffer, {
    contentType: file.mimetype,
    customMetadata: {
      originalName: file.originalname,
    },
  })
  const url = await getDownloadURL(snapshot.ref)
  return { filename: fullPath, url }
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2, 12)
}
