//Create the database
let db
function initDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('BedManagementDB', 1)

    // Create the schema
    request.onupgradeneeded = function (event) {
      try {
        db = event.target.result

        // Create Patient object store
        if (!db.objectStoreNames.contains('Patients')) {
          const patients = db.createObjectStore('Patients', {
            keyPath: 'patientID',
          })
          patients.createIndex('name', 'name', { unique: false })
          patients.createIndex('gender', 'gender', { unique: false })
          patients.createIndex('bloodType', 'bloodType', { unique: false })
          patients.createIndex('dob', 'dob', { unique: false })
          patients.createIndex('wardCategory', 'wardCategory', {
            unique: false,
          })
          patients.createIndex('bedNumber', 'bedNumber', {
            unique: false,
          })
        }

        // Create Beds object store
        if (!db.objectStoreNames.contains('Beds')) {
          const beds = db.createObjectStore('Beds', {
            keyPath: 'bedNumber',
          })
          beds.createIndex('patientID', 'patientID', { unique: true })
          beds.createIndex('wardCategory', 'wardCategory', { unique: false })
        }
      } catch (error) {
        console.log('An error occurred during database upgrade:', error)
        reject('There was an error during database upgrade')
      }
    }

    // Handle success event of the request
    request.onsuccess = function (event) {
      try {
        console.log('Database opened successfully')

        db = event.target.result

        resolve()
      } catch (error) {
        console.log('An error occurred while opening the database:', error)

        reject('There was an error while opening the database')
      }
    }

    request.onerror = function (event) {
      console.log(
        'There was an error opening the database:',
        event.target.error
      )
      reject('There was an error opening the database')
    }
  })
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the database
  initDB()
    .then(() => {
      // Generate a random patient ID and set it as the value of the 'patientID' element
      const initialPatientID = generateRandomID()
      document.getElementById('patient-ID').value = initialPatientID
      return refreshDatabase()
    })
    .then(() => {
      console.log('Database refreshed successfully')
    })
    .catch((error) => {
      console.error('Error refreshing the database:', error)
    })
})

//Adds data to a specified store in the database. Returns the key of the added data.
async function addData(storeName, data) {
  return new Promise((resolve, reject) => {
    // Start a new transaction with the specified store
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // Add data to store
    const request = store.add(data)

    // Resolve if success
    request.onsuccess = function (event) {
      resolve(event.target.result)
    }

    // Reject if error
    request.onerror = function (event) {
      reject(
        new Error(`Error adding data to ${storeName}: ${event.target.error}`)
      )
    }
  })
}

//Retrieve all data from a specified store in the database.
function getData(storeName) {
  return new Promise((resolve, reject) => {
    // Start a transaction with the specified store in read-only mode
    const transaction = db.transaction([storeName], 'readonly')

    // Get the object store from the transaction
    const store = transaction.objectStore(storeName)

    // Create a request to retrieve all data from the store
    const request = store.getAll()

    // Resolve if success
    request.onsuccess = function (event) {
      resolve(event.target.result)
    }
    // Reject if error 
    request.onerror = function (event) {
      reject('Error fetching data from ' + storeName)
    }
  })
}

//Update the bed number of a patient in the database.
async function updatePatientWithBedNumber(patientID, bedNumber) {
  try {
    // Start a transaction
    const transaction = db.transaction(['Patients'], 'readwrite')
    const patientStore = transaction.objectStore('Patients')

    // Get the patient with the given ID
    const getPatientRequest = patientStore.get(patientID)
    const storedPatient = await new Promise((resolve, reject) => {
      getPatientRequest.onsuccess = () => resolve(getPatientRequest.result)
      getPatientRequest.onerror = (event) => reject(event)
    })

    // Update the bed number of the patient
    storedPatient.bedNumber = bedNumber

    // Update the patient in the database
    await new Promise((resolve, reject) => {
      const updateRequest = patientStore.put(storedPatient)
      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = (event) => reject(event)
    })
  } catch (error) {
    throw error
  }
}

//Refreshes the database by fetching data from the 'Beds' object stores, handles patients with bed numbers or assigns available beds
async function refreshDatabase() { 
  try {

    const patients = await getData('Beds')

    // Check if the fetched data is valid
    if (!patients) {
      throw new Error('Failed to fetch patients')
    }

    // Handle patients with bed numbers or assign available beds
    for (const currentPatient of patients) {
      if (!currentPatient) {
        console.warn('Invalid patient record:', currentPatient)
        continue // Skip to next iteration
      }

      if (currentPatient.bedNumber && currentPatient.occupied) {
        markBedAsOccupied(
          currentPatient.bedNumber,
          currentPatient.patientID,
          currentPatient.wardCategory
        )
        domBedOccupancyTime(currentPatient.bedNumber)
      } else {
        const bedNumber = findAvailableBed()
        console.log(bedNumber)
        if (bedNumber) {
          assignBedToPatient(currentPatient, currentPatient.wardCategory)
        }
        
      }
    }
  } 
  
 catch (error) {
    console.error('Error refreshing the database:', error)
  }
}
