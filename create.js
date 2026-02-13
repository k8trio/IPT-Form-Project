 let imageData = '';

        document.getElementById('profileImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imageData = event.target.result;
                    document.getElementById('imagePreview').innerHTML = 
                        '<img src="' + imageData + '" style="max-width: 150px; margin-top: 10px; border-radius: 8px;">';
                };
                reader.readAsDataURL(file);
            }
        });

        function addEducation() {
            const container = document.getElementById('educationContainer');
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.innerHTML = `
                <div class="form-grid">
                    <div class="form-group">
                        <label>Degree</label>
                        <input type="text" class="degree">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" class="institution">
                    </div>
                    <div class="form-group">
                        <label>Start Year</label>
                        <input type="text" class="edu_start_year">
                    </div>
                    <div class="form-group">
                        <label>End Year</label>
                        <input type="text" class="edu_end_year">
                    </div>
                </div>
                <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
            container.appendChild(entry);
        }

        function addExperience() {
            const container = document.getElementById('experienceContainer');
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry';
            entry.innerHTML = `
                <div class="form-grid">
                    <div class="form-group">
                        <label>Job Title</label>
                        <input type="text" class="job_title">
                    </div>
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" class="company">
                    </div>
                    <div class="form-group">
                        <label>Start Year</label>
                        <input type="text" class="exp_start_year">
                    </div>
                    <div class="form-group">
                        <label>End Year</label>
                        <input type="text" class="exp_end_year">
                    </div>
                    <div class="form-group full-width">
                        <label>Description</label>
                        <textarea class="description" rows="3"></textarea>
                    </div>
                </div>
                <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
            container.appendChild(entry);
        }

        function addSkill() {
            const container = document.getElementById('skillsContainer');
            const entry = document.createElement('div');
            entry.className = 'dynamic-entry skill-entry';
            entry.innerHTML = `
                <div class="form-grid">
                    <div class="form-group">
                        <label>Skill Name</label>
                        <input type="text" class="skill_name">
                    </div>
                    <div class="form-group">
                        <label>Proficiency Level (1-7)</label>
                        <input type="number" class="skill_level" min="1" max="7" value="5">
                    </div>
                </div>
                <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
            container.appendChild(entry);
        }

        document.getElementById('cvForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cvData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                website: document.getElementById('website').value,
                address: document.getElementById('address').value,
                aboutMe: document.getElementById('aboutMe').value,
                colorTheme: document.querySelector('input[name="color_theme"]:checked').value,
                profileImage: imageData,
                education: [],
                experience: [],
                skills: []
            };

            document.querySelectorAll('#educationContainer .dynamic-entry').forEach(entry => {
                const degree = entry.querySelector('.degree').value;
                const institution = entry.querySelector('.institution').value;
                const startYear = entry.querySelector('.edu_start_year').value;
                const endYear = entry.querySelector('.edu_end_year').value;
                
                if (degree || institution) {
                    cvData.education.push({ degree, institution, startYear, endYear });
                }
            });

            document.querySelectorAll('#experienceContainer .dynamic-entry').forEach(entry => {
                const jobTitle = entry.querySelector('.job_title').value;
                const company = entry.querySelector('.company').value;
                const startYear = entry.querySelector('.exp_start_year').value;
                const endYear = entry.querySelector('.exp_end_year').value;
                const description = entry.querySelector('.description').value;
                
                if (jobTitle || company) {
                    cvData.experience.push({ jobTitle, company, startYear, endYear, description });
                }
            });

            document.querySelectorAll('#skillsContainer .dynamic-entry').forEach(entry => {
                const skillName = entry.querySelector('.skill_name').value;
                const skillLevel = entry.querySelector('.skill_level').value;
                
                if (skillName) {
                    cvData.skills.push({ skillName, skillLevel });
                }
            });
            //J: delete or specify this part
            let cvList = JSON.parse(localStorage.getItem('cvList') || '[]');
            cvData.id = cvList.length > 0 ? Math.max(...cvList.map(cv => cv.id)) + 1 : 1;
            cvList.push(cvData);
            localStorage.setItem('cvList', JSON.stringify(cvList));
            //until line 304
            alert('CV saved successfully!');
            window.location.href = 'index.html';
        });