document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const medicalReportsInput = document.getElementById('medicalReports');
    const reportList = document.getElementById('reportList');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    let reports = [];
    let originalFormData = {}; // Store original form data to track changes
    let formChanged = false;   // Track if form has been changed

    // Load profile data
    function loadProfile() {
        // Fetch profile data from server (mocked here)
        const profileData = {
            patientId: '123456',
            name: 'John A. Doe',
            dob: '1985-07-22',
            gender: 'Male',
            bloodGroup: 'O+',
            allergies: 'Penicillin: Hives\nShellfish: Anaphylaxis',
            medicalHistory: `
                Chronic Conditions:
                - Hypertension (Diagnosed: 2015, Status: Active)
                - Type 2 Diabetes (Diagnosed: 2018, Status: Active)
                
                Surgeries:
                - Appendectomy (Date: 2005-03-15)
            `,
            medications: `
                Current Medications:
                - Lisinopril (10mg, Daily, Hypertension)
                - Metformin (500mg, BID, Diabetes)
                
                OTC:
                - Aspirin 81mg daily
                - Vitamin D3 1000 IU
                
                Interactions:
                - NSAIDs may reduce antihypertensive effect
            `,
            labReports: `
                Recent Results:
                - HbA1c: 6.8% (Date: 2023-06-15)
                - LDL Cholesterol: 110 mg/dL (Date: 2023-06-15)
            `,
            reports: [
                { id: 1, name: 'Blood Test Report.pdf' },
                { id: 2, name: 'X-Ray Report.jpg' }
            ]
        };

        document.getElementById('patientId').value = profileData.patientId;
        document.getElementById('name').value = profileData.name;
        document.getElementById('dob').value = profileData.dob;
        document.getElementById('gender').value = profileData.gender;
        document.getElementById('bloodGroup').value = profileData.bloodGroup;
        document.getElementById('allergies').value = profileData.allergies;
        document.getElementById('medicalHistory').value = profileData.medicalHistory;
        document.getElementById('medications').value = profileData.medications;
        document.getElementById('labReports').value = profileData.labReports;
        // Remove insurance line
        reports = [...profileData.reports]; // Make a copy
        renderReports();
        
        // Store original form data
        originalFormData = {
            name: profileData.name,
            dob: profileData.dob,
            gender: profileData.gender,
            bloodGroup: profileData.bloodGroup,
            allergies: profileData.allergies,
            reports: [...profileData.reports] // Deep copy
        };
        
        // Reset form changed flag
        formChanged = false;
    }

    // Render reports
    function renderReports() {
        reportList.innerHTML = '';
        reports.forEach(report => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><i class="fas fa-file-medical mr-2"></i> ${report.name}</span>
                <div>
                    <button class="btn btn-sm btn-info" onclick="viewReport(${report.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteReport(${report.id})">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            reportList.appendChild(li);
        });
    }

    // View report
    window.viewReport = function(id) {
        const report = reports.find(r => r.id === id);
        if (report) {
            showNotification(`Viewing report: ${report.name}`);
            // In a real app, this would open the report
            console.log('Viewing report:', report);
        }
    };

    // Delete report
    window.deleteReport = function(id) {
        if (confirm('Are you sure you want to delete this report?')) {
            reports = reports.filter(report => report.id !== id);
            renderReports();
            formChanged = true; // Mark form as changed
            showNotification('Report deleted successfully', 'danger');
        }
    };

    // Show notification
    function showNotification(message, type = 'success') {
        notificationMessage.textContent = message;
        
        // Change notification color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else if (type === 'danger') {
            notification.style.backgroundColor = '#dc3545';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#ffc107';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Check if form has changed
    function checkFormChanged() {
        if (
            document.getElementById('name').value !== originalFormData.name ||
            document.getElementById('dob').value !== originalFormData.dob ||
            document.getElementById('gender').value !== originalFormData.gender ||
            document.getElementById('bloodGroup').value !== originalFormData.bloodGroup ||
            document.getElementById('allergies').value !== originalFormData.allergies ||
            reports.length !== originalFormData.reports.length
        ) {
            return true;
        }
        
        // Check if reports are different (if same length)
        if (reports.length === originalFormData.reports.length) {
            for (let i = 0; i < reports.length; i++) {
                if (reports[i].id !== originalFormData.reports[i].id) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Function to show a more prominent success alert
    function showSaveSuccessAlert() {
        // Create the alert container
        const alertContainer = document.createElement('div');
        alertContainer.className = 'save-success-alert';
        alertContainer.innerHTML = `
            <div class="save-success-content">
                <div class="save-success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="save-success-message">
                    <h4>Changes Saved Successfully!</h4>
                    <p>Your profile has been updated.</p>
                </div>
            </div>
        `;
        
        // Add styles inline to ensure they're applied
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '50%';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translate(-50%, -50%)';
        alertContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        alertContainer.style.borderRadius = '8px';
        alertContainer.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.25)';
        alertContainer.style.padding = '25px';
        alertContainer.style.zIndex = '10000';
        alertContainer.style.opacity = '0';
        alertContainer.style.transition = 'opacity 0.3s ease';
        
        // Style the content
        const content = alertContainer.querySelector('.save-success-content');
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        
        // Style the icon
        const icon = alertContainer.querySelector('.save-success-icon');
        icon.style.fontSize = '50px';
        icon.style.color = '#28a745';
        icon.style.marginRight = '20px';
        
        // Style the message
        const message = alertContainer.querySelector('.save-success-message');
        message.style.textAlign = 'left';
        
        const heading = alertContainer.querySelector('h4');
        heading.style.margin = '0 0 8px 0';
        heading.style.color = '#28a745';
        heading.style.fontWeight = '600';
        
        const paragraph = alertContainer.querySelector('p');
        paragraph.style.margin = '0';
        paragraph.style.color = '#333';
        
        // Add to the document
        document.body.appendChild(alertContainer);
        
        // Trigger animation
        setTimeout(() => {
            alertContainer.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            alertContainer.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(alertContainer);
            }, 300);
        }, 2000);
    }

    // Save profile data
    saveBtn.addEventListener('click', function() {
        // Check if form has changed
        formChanged = checkFormChanged();
        
        if (!formChanged) {
            showNotification('No changes to save', 'warning');
            return;
        }
        
        const profileData = {
            patientId: document.getElementById('patientId').value,
            name: document.getElementById('name').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            bloodGroup: document.getElementById('bloodGroup').value,
            allergies: document.getElementById('allergies').value,
            medicalHistory: document.getElementById('medicalHistory').value,
            medications: document.getElementById('medications').value,
            labReports: document.getElementById('labReports').value,
            // Remove insurance line
            reports: reports
        };

        // Save profile data to server (mocked here)
        console.log('Profile saved', profileData);
        
        // Show success notification
        showNotification('Profile saved successfully!');
        
        // Display a more prominent success alert
        showSaveSuccessAlert();
        
        // Update original form data to reflect saved state
        originalFormData = {
            name: profileData.name,
            dob: profileData.dob,
            gender: profileData.gender,
            bloodGroup: profileData.bloodGroup,
            allergies: profileData.allergies,
            reports: [...reports] // Deep copy
        };
        
        // Reset form changed flag
        formChanged = false;
        
        // Redirect to home page after a delay
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2500); // Slightly longer delay to ensure alert is seen
    });

    // Cancel profile update
    cancelBtn.addEventListener('click', function() {
        // Check if form has changed
        formChanged = checkFormChanged();
        
        if (formChanged) {
            if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                loadProfile();
                showNotification('Changes cancelled', 'warning');
            }
        } else {
            // No changes, just go back
            window.location.href = 'home.html';
        }
    });

    // Track form changes
    ['name', 'dob', 'gender', 'bloodGroup', 'allergies'].forEach(field => {
        document.getElementById(field).addEventListener('input', function() {
            formChanged = true;
        });
    });

    // Handle file upload
    medicalReportsInput.addEventListener('change', function() {
        const files = Array.from(medicalReportsInput.files);
        if (files.length > 0) {
            files.forEach(file => {
                const report = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    name: file.name
                };
                reports.push(report);
            });
            renderReports();
            formChanged = true; // Mark form as changed
            showNotification(`${files.length} report(s) uploaded successfully`);
        }
    });

    // Load profile data on page load
    loadProfile();
});