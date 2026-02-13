// for this part, sa local storage muna to. this is json scripting. Justine, if icoconnet mo naman na sa XAMPP database 
        //ito, pwede mo i delete tong script part. pag may errors, sabihan mo ako
        // i'll  convert them into PHP na lang para di u mahiraparnch
        function loadCVList() {
            const cvList = JSON.parse(localStorage.getItem('cvList') || '[]');
            const tbody = document.getElementById('cvTableBody');
            
            if (cvList.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="empty-state">
                            <div class="empty-message">
                                <p>No CVs created yet</p>
                                <p class="empty-hint">Click "Create New CV" to get started</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = '';
            cvList.forEach((cv, index) => {
                const row = document.createElement('tr');
                row.className = 'cv-row';
                row.setAttribute('data-name', cv.fullName.toLowerCase());
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td class="name-cell">${cv.fullName}</td>
                    <td>
                        <a href="view.html?id=${cv.id}" class="view-btn">View</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        //hanggang dito pwede i-remove, wag  lang lines 78-90

        // for search function
        function searchCV() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const rows = document.querySelectorAll('.cv-row');
            
            rows.forEach(row => {
                const name = row.getAttribute('data-name');
                row.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        }

        // displaying real-time search
        document.getElementById('searchInput').addEventListener('input', searchCV);
        //line 92-93(can also delete this one)
        window.onload = loadCVList;