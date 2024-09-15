//Generates a random ID.
function generateRandomID() {
  const MAX_ID_VALUE = 1000 
  const prefix = 'PV_' 
  const randomID = prefix + Math.floor(Math.random() * MAX_ID_VALUE)
  return randomID
}

// Retrieves the details of a patient from the input fields.
function getPatientDetails() {
  return {
    patientID: document.getElementById('patient-ID').value,
    name: document.getElementById('patient-name').value,
    gender: document.getElementById('patient-gender').value,
    bloodType: document.getElementById('patient-bloodType').value,
    dob: document.getElementById('patient-DOB').value,
    wardCategory: document.getElementById('patient-category').value,
  }
}



//Handle patient process
async function handleValidPatient(patient) {
  // Create patient status element
  const { li: patientLi } = createPatientStatus(
    patient.patientID,
    'Awaiting Admission',
    60
  )
  // Delay admission time
  await delay(ADMISSION_TIME)
  // Remove patient status element
  patientLi.remove()
  // Assign bed to patient
  const bedNumber = await assignBedToPatient(patient, patient.wardCategory)
  if (bedNumber) {
    // Update bed occupancy time
    bedOccupancyTime(patient.patientID, bedNumber)
    // Add patient data
    await addData('Patients', patient)
    // Update patient with bed number
    updatePatientWithBedNumber(patient.patientID, bedNumber)
    // Log assigned bed number
    console.log(`Assigned Bed #${bedNumber} to ${patient.name}`)
  } else {
    // Log and display message for no available bed
    console.log(`No bed available for ${patient.name}.`)
  }
}

//Adds a patient to the system.
async function addPatient() {
  // Get patient details
  const patient = getPatientDetails()
  if (true) {
    await handleValidPatient(patient)
    const existingPatients = JSON.parse(localStorage.getItem('patients')) || []
    existingPatients.push(patient)
    localStorage.setItem('patients', JSON.stringify(existingPatients))
  } 
}

// Get the patient admission form element
const patientAdmissionForm = document.getElementById('patient-admission-form')

// Check if the patient admission form exists
if (patientAdmissionForm) {
  patientAdmissionForm.addEventListener('submit', async function (event) {
    event.preventDefault()

    // Call the addPatient function
    addPatient()
    this.reset()
    document.getElementById('patient-ID').value = generateRandomID()
  })
}

//Discharging patient and updating UI
async function dischargePatient(bedNumber) {
  const transaction = db.transaction(['Beds'], 'readonly')
  const bedStore = transaction.objectStore('Beds')
  const bedRequest = bedStore.get(Number(bedNumber))

  await new Promise((resolve, reject) => {
    bedRequest.onsuccess = function (event) {
      const bedRecord = event.target.result

      if (bedRecord) {
        if (bedRecord.patientID) {
          patientID = bedRecord.patientID
        } else if (bedRecord.patient && bedRecord.patient.patientID) {
          patientID = bedRecord.patient.patientID
        }
      }

      resolve()
    }

    bedRequest.onerror = reject
  })

  if (!patientID) {
    console.warn(`No patientID found for bed number ${bedNumber}`)
    return
  }

  const patientTransaction = db.transaction(['Patients'], 'readwrite')
  const patientStore = patientTransaction.objectStore('Patients')
  const patientRequest = patientStore.delete(patientID)

  patientRequest.onsuccess = () => {
    console.log(`Patient with ID ${patientID} has been removed`)
  }

  patientRequest.onerror = () => {
    console.error('Failed to remove patient')
  }
  //Delete the Patient data from the 'Beds' object store
  const bedTransaction = db.transaction(['Beds'], 'readwrite')
  const bedStoreDelete = bedTransaction.objectStore('Beds')
  const bedIndexDelete = bedStoreDelete.index('patientID')
  const bedRequestDelete = bedIndexDelete.getKey(patientID)

  bedRequestDelete.onsuccess = () => {
    const bedKey = bedRequestDelete.result
    if (bedKey != undefined) {
      bedStoreDelete.delete(bedKey)
      console.log(`Bed number ${bedNumber} has been freed`)
    }
  }

  bedRequestDelete.onerror = () => {
    console.error('Failed to free bed')
  }
  console.log(`Patient in bed ${bedNumber} has been discharged`)
  const bed = document.querySelector(
    `.bed-sheet[data-bed-number='${bedNumber}']`
  )
  const dischargeButton = bed.querySelector('.discharge-btn')

  if (dischargeButton) {
    dischargeButton.style.display = 'none'
  }

  if (bed) {
    bed.classList.remove('occupied')
    bed.classList.add('pending-sanitizing')
    bed.dataset.occupied = 'true'
  }
  const { li: sanitizingLi } = createBedStatus(
    bedNumber,
    'Pending Sanitizing',
    60
  )
  await delay(PENDING_SANITIZING_TIME)
  sanitizingLi.remove()

  if (bed) {
    bed.classList.remove('pending-sanitizing')
    bed.classList.add('sanitizing')
    bed.dataset.occupied = 'true'
  }
  const { li: sanitizingLi2 } = createBedStatus(
    bedNumber,
    'Bed Sanitizing',
    120
  )

  await delay(SANITIZING_TIME)
  sanitizingLi2.remove()

  if (bed) {
    bed.classList.remove('sanitizing')
    bed.classList.add('available')
    bed.dataset.occupied = 'false'
  }

  const { li: sanitizingLi3 } = createLatestBedStatus(
    bedNumber,
    'Available Now'
  )
  await delay(BED_AVAILABILITY_STATUS)
  sanitizingLi3.remove()

}
