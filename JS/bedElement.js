//Generates a ward element with beds.

function generateWard(title, numOfBeds, startingBedNumber) {
  // Create the ward element
  let ward = document.createElement('div')
  ward.className = 'ward'

  let h3 = document.createElement('h3')
  h3.textContent = title
  ward.appendChild(h3)

  // Create the container for the bed rows
  let bedRow = document.createElement('div')
  bedRow.className = 'bed-row'

  // Generate each bed element
  for (let i = 0; i < numOfBeds; i++) {
    // Create the bed element
    let bed = document.createElement('div')
    bed.className = 'bed-icon'

    // Create the pillow element
    let pillow = document.createElement('div')
    pillow.className = 'pillow'
    bed.appendChild(pillow)

    // Create the bed sheet element
    let bedSheet = document.createElement('div')
    bedSheet.className = 'bed-sheet'
    bedSheet.dataset.occupied = 'false'
    bedSheet.dataset.bedNumber = startingBedNumber + i
    bedSheet.classList.add(
      bedSheet.dataset.occupied === 'true' ? 'occupied' : 'available'
    )
    bed.appendChild(bedSheet)

    // Create the bed number element
    let bedNumberSpan = document.createElement('span')
    bedNumberSpan.className = 'bed-number'
    bedNumberSpan.textContent = startingBedNumber + i
    bed.appendChild(bedNumberSpan)

    // Create the discharge button
    let dischargeButton = document.createElement('button')
    dischargeButton.className = 'discharge-btn'
    dischargeButton.textContent = 'Discharge'
    // Add event listener for discharge button click
    dischargeButton.addEventListener('click', function () {
      dischargePatient(bedSheet.dataset.bedNumber)
    })
    bedSheet.appendChild(dischargeButton)

    /*// Create the tooltip content element
    let tooltipContent = document.createElement('div')
    tooltipContent.className = 'tooltip-content'
    bedSheet.appendChild(tooltipContent)
    */

    bedRow.appendChild(bed)
  }

  ward.appendChild(bedRow)

  // Return the generated ward element
  return ward
}

let bedSection = document.querySelector('.bed-ward-section')
// Define an array of ward configurations
const wardConfigurations = [
  {
    title: 'Intensive Care Ward',
    beds: 10,
    startNumber: 101,
  },
  {
    title: 'Infectious Disease Ward',
    beds: 10,
    startNumber: 201,
  },
  { title: 'General Ward', 
    beds: 20,
    startNumber: 301 },
]
// Iterate over the ward configurations
wardConfigurations.forEach((config) => {
  // Append a ward element generated using the configuration to the bed section
  bedSection.appendChild(
    generateWard(config.title, config.beds, config.startNumber)
  )
})

