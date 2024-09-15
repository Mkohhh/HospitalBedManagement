# Hospital Bed Management System (A school project)

A simple web-based application for school assignment.

This system aims to provide real-time online information for bed management of a hospital. The system enables efficiency from managing, optimizing and automating patient flow from admission to discharge. 

# Set-Up guide
1. Ensure node.js is installed on local machine.
2. Extract zip file to desired directory.
3. Open a terminal in a text/code editor and navigate to location of extracted folder eg. `cd C:\Users\Marcus\Documents\HospitalV3`.
4. Once inside directory, key in `node server.js`. There should show `Server is running on port:8080`, meaning the server has started.
5. Open up a browser (preferably google chrome), and run `http://localhost:8080`.


# Usage Guide

1. Enter patient details and press 'Register'.
2. System will assign a bed for the patient in the chosen ward.
3. The duration of each status has been shorten to facilitate testing process.
4. A alert will pop out saying that patient can now be discharged. 
5. To discharge, simply click on the 'Discharge' button on the occupied bed.
6. The bed will be automatically santitized and be available for next patient to check in.